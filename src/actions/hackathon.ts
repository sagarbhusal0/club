"use server";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers, settings } from "@/db/schema";
import { hackathonSchema, finalSubmissionSchema } from "@/lib/validation";
import { rateLimit, LIMITS } from "@/lib/ratelimit";
import { eq, sql, inArray } from "drizzle-orm";
import { neon, Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleWs } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";
import { sendEmail } from "@/lib/email";
import { hackathonRegisteredEmail, finalSubmissionEmail } from "@/lib/email-templates";
import { registrationStatus } from "@/lib/utils";

neonConfig.webSocketConstructor = ws;

// Advisory lock id serializing hackathon registration (team-cap + numbering).
const REGISTRATION_LOCK_ID = 9203117;

function getRawDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const s = neon(url);
  return { sql: s, db: drizzle(s, { schema }) };
}

// neon-http does not support transactions; use the WebSocket driver for real
// (atomic, concurrency-safe) transactions.
type WsDb = ReturnType<typeof drizzleWs<typeof schema>>;
type Tx = Parameters<Parameters<WsDb["transaction"]>[0]>[0];

async function withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const pool = new Pool({ connectionString: url });
  try {
    const txDb = drizzleWs(pool, { schema });
    return await txDb.transaction(fn);
  } finally {
    await pool.end();
  }
}

export async function submitHackathonTeam(data: unknown, ip: string) {
  if (!rateLimit(`hackathon:${ip}`, LIMITS.hackathonSubmit.limit, LIMITS.hackathonSubmit.windowMs)) return { error: LIMITS.hackathonSubmit.message };
  const parsed = hackathonSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const emailKey = d.members[0]?.email?.toLowerCase();
  if (emailKey && !rateLimit(`hackathon:email:${emailKey}`, 2, 60_000)) return { error: "This email has reached the registration limit. Try again later." };

  // 0 or missing setting = unlimited teams.
  let maxTeams = 0;
  const rawDb = getRawDb().db;

  try {
    const settingsRows = await rawDb.select().from(settings);
    const s2 = Object.fromEntries(settingsRows.map(r => [r.key, r.value]));
    const st = registrationStatus(s2.hackathon_opens || "2026-01-01", s2.hackathon_closes || "2026-12-31");
    if (st !== "OPEN") return { error: st === "COMING_SOON" ? "Hackathon registration has not opened yet." : "Hackathon registration is closed." };
    maxTeams = Number(s2.hackathon_max_teams) || 0;
  } catch {}

  const year = new Date().getFullYear();
  const prefix = `ICT-HACK-${year}-`;

  try {
    return await withTransaction(async (tx) => {
      // Serialize concurrent registrations so the team cap and team numbering
      // cannot be bypassed by simultaneous submissions.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${REGISTRATION_LOCK_ID})`);
      const [countRow] = await tx.select({ c: sql<number>`count(*)` }).from(hackathonTeams);
      const teamCount = Number(countRow?.c ?? 0);
      if (maxTeams > 0 && teamCount >= maxTeams) {
        return { error: `Registration is full — the hackathon limit of ${maxTeams} teams has been reached.` };
      }

      const emails = d.members.map(m => m.email.toLowerCase());
      const ids = d.members.map(m => m.studentId.toLowerCase());
      const teamNameLower = d.teamName.toLowerCase();

      const existingEmails = await tx.select().from(hackathonMembers).where(inArray(hackathonMembers.email, d.members.map(m => m.email)));
      if (existingEmails.length) {
        const dupEmails = new Set(existingEmails.map(r => r.email.toLowerCase()));
        const dupInInput = emails.filter(e => dupEmails.has(e));
        if (dupInInput.length) return { error: "This student is already registered in another team." };
      }
      // case-insensitive check via lower
      const allMembers = await tx.select().from(hackathonMembers);
      for (const m of allMembers) {
        if (emails.includes(m.email.toLowerCase())) return { error: "This student is already registered in another team." };
        if (ids.includes((m.studentId || "").toLowerCase())) return { error: "This student is already registered in another team." };
      }
      const allTeams = await tx.select().from(hackathonTeams);
      if (allTeams.some(t => t.teamName.toLowerCase() === teamNameLower)) return { error: "Team name already taken. Please choose another." };

      const existing = await tx.execute(sql`SELECT team_number FROM hackathon_teams WHERE team_number LIKE ${prefix + "%"} ORDER BY team_number DESC LIMIT 1`) as unknown as { rows: { team_number: string }[] };
      let next = 1;
      if (existing.rows?.length) {
        const n = parseInt(existing.rows[0].team_number.split("-").pop() || "0", 10);
        next = n + 1;
      }
      const teamNumber = `${prefix}${String(next).padStart(4, "0")}`;

      const [team] = await tx.insert(hackathonTeams).values({
        teamNumber,
        teamName: d.teamName.trim(),
        projectTitle: d.projectTitle.trim(),
        category: d.category,
        description: d.description,
        problemStatement: d.problemStatement || null,
        solution: d.solution || null,
        technologyStack: d.technologyStack || null,
        projectIdeaSummary: d.projectIdeaSummary,
        ideaStatus: "PENDING",
        status: "REGISTERED",
      }).returning();

      for (let i = 0; i < d.members.length; i++) {
        const m = d.members[i];
        await tx.insert(hackathonMembers).values({
          teamId: team.id,
          fullName: m.fullName,
          email: m.email.toLowerCase(),
          phone: m.phone,
          grade: m.grade,
          section: m.section,
          studentId: m.studentId.trim(),
          role: m.role,
          githubUrl: m.githubUrl || null,
          isLeader: !!m.isLeader || i === 0,
        });
      }

      try {
        const emailData = hackathonRegisteredEmail({
          teamNumber: team.teamNumber,
          teamName: team.teamName,
          projectTitle: team.projectTitle,
          category: team.category,
          description: team.description,
          members: d.members.map(m => ({ fullName: m.fullName, email: m.email, role: m.role + (m.isLeader ? " (Leader)" : ""), studentId: m.studentId })),
        });
        const recipientEmails = [...new Set(d.members.map(m => m.email.toLowerCase()))];
        for (const to of recipientEmails) {
          try { await sendEmail({ to, subject: emailData.subject, html: emailData.html }); }
          catch (e) { console.error("[email] hackathon confirmation failed", to, e); }
        }
      } catch (e) { console.error("[email] hackathon confirmation failed", e); }

      return { success: true, teamNumber: team.teamNumber, teamId: team.id } as const;
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("already registered")) return { error: "This student is already registered in another team." };
    if (msg.includes("duplicate") || msg.includes("unique") || msg.includes("hm_email_unique") || msg.includes("hm_student_id_unique")) return { error: "This student is already registered in another team." };
    if (msg.includes("team_name")) return { error: "Team name already taken. Please choose another." };
    console.error("[hackathon] submit failed", e);
    return { error: "Registration failed. Please try again." };
  }
}

export async function submitFinal(teamNumber: string, data: unknown, ip: string) {
  if (!rateLimit(`final:${ip}`, 5, 60_000)) return { error: "Too many submissions. Try again shortly." };
  const parsed = finalSubmissionSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const tn = teamNumber.trim().toUpperCase();
  if (!tn) return { error: "Team ID required" };
  const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, tn)).limit(1);
  if (!team) return { error: "Team not found" };
  if (team.isFinalSubmitted) return { error: "Final submission is already locked. Contact an admin to unlock." };
  await db.update(hackathonTeams).set({
    repositoryUrl: d.repositoryUrl,
    documentationUrl: d.documentationUrl,
    finalDemoUrl: d.finalDemoUrl || null,
    finalDescription: d.finalDescription || null,
    aiToolsUsed: d.aiToolsUsed || null,
    originalWorkConfirmed: true,
    isFinalSubmitted: true,
    finalSubmittedAt: new Date(),
    status: "FINAL_SUBMITTED",
    updatedAt: new Date(),
  }).where(eq(hackathonTeams.id, team.id));
  try {
    const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
    const leader = members.find(m => m.isLeader) || members[0];
    if (leader) {
      const e = finalSubmissionEmail({ teamNumber: team.teamNumber, teamName: team.teamName });
      await sendEmail({ to: leader.email, subject: e.subject, html: e.html });
    }
  } catch (err) { console.error("[email] final submission failed", err); }
  return { success: true };
}

export async function unlockFinalSubmission(teamId: string) {
  const { requireAdmin } = await import("@/lib/auth");
  const s = await requireAdmin();
  if (!s) return { error: "Unauthorized" };
  const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, teamId)).limit(1);
  if (!team) return { error: "Team not found" };
  // Restore an editable state: back to APPROVED (or REGISTERED if not yet approved).
  const editableStatus = team.status === "FINAL_SUBMITTED" ? (team.ideaStatus === "APPROVED" ? "APPROVED" : "REGISTERED") : team.status;
  await db.update(hackathonTeams).set({ isFinalSubmitted: false, finalSubmittedAt: null, status: editableStatus, updatedAt: new Date() }).where(eq(hackathonTeams.id, teamId));
  return { success: true };
}
