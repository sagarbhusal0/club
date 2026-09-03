"use server";
import { db } from "@/db";
import { boardApplications, hackathonTeams, hackathonMembers, boardPositions, settings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail, sendBulk } from "@/lib/email";
import { boardStatusEmail, hackathonStatusEmail, broadcastEmail, ideaStatusEmail } from "@/lib/email-templates";
import { rateLimit, LIMITS } from "@/lib/ratelimit";
import { BOARD_STATUSES, HACKATHON_STATUSES, HACKATHON_IDEA_STATUSES, HACKATHON_MAX_TEAMS } from "@/lib/constants";
import { withTransaction } from "@/lib/db-tx";
import { sql } from "drizzle-orm";

async function ensureAdmin() {
  const s = await requireAdmin();
  if (!s) throw new Error("Unauthorized");
  return s;
}

export async function updateApplicationStatus(id: string, status: string, notes?: string, notify = true) {
  await ensureAdmin();
  if (!(BOARD_STATUSES as readonly string[]).includes(status)) return { error: "Invalid status" };
  await db.update(boardApplications).set({ status, adminNotes: notes, updatedAt: new Date() }).where(eq(boardApplications.id, id));
  if (notify) {
    try {
      const [app] = await db.select().from(boardApplications).where(eq(boardApplications.id, id)).limit(1);
      if (app) {
        const e = boardStatusEmail({ applicationNumber: app.applicationNumber, fullName: app.fullName, status, adminNotes: notes });
        await sendEmail({ to: app.email, subject: e.subject, html: e.html });
      }
    } catch (err) { console.error("[email] status notify failed", err); }
  }
  revalidatePath("/admin/applications");
  return { success:true };
}

export async function updateTeamStatus(id: string, status: string, notes?: string, notify = true) {
  await ensureAdmin();
  if (!(HACKATHON_STATUSES as readonly string[]).includes(status)) return { error: "Invalid status" };

  // Approval quota: only `hackathon_max_teams` teams may occupy a competition slot
  // (APPROVED or CHECKED_IN). Registration itself is unlimited.
  if (status === "APPROVED" || status === "CHECKED_IN") {
    const [current] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, id)).limit(1);
    if (!current) return { error: "Team not found" };
    const occupiesNow = current.status === "APPROVED" || current.status === "CHECKED_IN";
    if (!occupiesNow) {
      const rows = await db.select().from(settings);
      const sMap = Object.fromEntries(rows.map(r => [r.key, r.value]));
      const quota = Number(sMap.hackathon_max_teams) || HACKATHON_MAX_TEAMS;
      const result = await withTransaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(9203118)`);
        const [row] = await tx.select({ c: sql<number>`count(*)` }).from(hackathonTeams)
          .where(sql`${hackathonTeams.status} IN ('APPROVED','CHECKED_IN') AND ${hackathonTeams.id} <> ${id}`);
        return Number(row?.c ?? 0);
      });
      if (result >= quota) return { error: `Quota full — only ${quota} teams can be approved. Registration remains open, but no more teams can be selected.` };
    }
  }

  await db.update(hackathonTeams).set({ status, adminNotes: notes, updatedAt: new Date() }).where(eq(hackathonTeams.id, id));
  if (notify) {
    try {
      const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, id)).limit(1);
      if (team) {
        const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, id));
        const e = hackathonStatusEmail({ teamNumber: team.teamNumber, teamName: team.teamName, status, adminNotes: notes });
        for (const m of members) { try { await sendEmail({ to: m.email, subject: e.subject, html: e.html }); } catch {} }
      }
    } catch (err) { console.error("[email] hack team notify failed", err); }
  }
  revalidatePath("/admin/teams");
  return { success:true };
}

export async function bulkSendBroadcast(input: { audience: "board"|"hackathon"|"all"; statusFilter?: string; subject: string; html: string }) {
  const admin = await ensureAdmin();
  if (!rateLimit(`broadcast:${admin.email}`, LIMITS.broadcast.limit, LIMITS.broadcast.windowMs)) return { error: LIMITS.broadcast.message };
  if (!input.subject.trim() || !input.html.trim()) return { error:"Subject and message required." };

  const emails = new Set<string>();

  if (input.audience === "board" || input.audience === "all") {
    const rows = await db.select().from(boardApplications);
    for (const r of rows) {
      if (input.statusFilter && r.status !== input.statusFilter) continue;
      emails.add(r.email.toLowerCase());
    }
  }
  if (input.audience === "hackathon" || input.audience === "all") {
    const teams = await db.select().from(hackathonTeams);
    const filteredIds = input.statusFilter ? teams.filter(t=>t.status===input.statusFilter).map(t=>t.id) : teams.map(t=>t.id);
    if (filteredIds.length) {
      const members = await db.select().from(hackathonMembers).where(inArray(hackathonMembers.teamId, filteredIds));
      for (const m of members) emails.add(m.email.toLowerCase());
    } else if (!input.statusFilter) {
      const members = await db.select().from(hackathonMembers);
      for (const m of members) emails.add(m.email.toLowerCase());
    }
  }

  if (emails.size === 0) return { error:"No recipients match the selected filters." };

  const payload = broadcastEmail(input.subject, input.html);
  const payloads = [...emails].map(to => ({ to, subject: payload.subject, html: payload.html }));
  const { sent, failed } = await sendBulk(payloads, 300);
  return { success:true, sent, failed, total: emails.size };
}

export async function sendTestEmail(to: string) {
  const admin = await ensureAdmin();
  if (!rateLimit(`test:${admin.email}`, LIMITS.testEmail.limit, LIMITS.testEmail.windowMs)) return { error: LIMITS.testEmail.message };
  const e = broadcastEmail("Test email — ICT Mavi Imiliya Club", "<p>If you received this, email delivery is working correctly.</p>");
  await sendEmail({ to, subject: e.subject, html: e.html });
  return { success:true };
}

export async function updateSettings(data: Record<string,string>) {
  await ensureAdmin();
  for (const [k,v] of Object.entries(data)) {
    await db.insert(settings).values({ key:k, value:v }).onConflictDoUpdate({ target: settings.key, set:{ value:v } });
  }
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success:true };
}

export async function updateIdeaStatus(id: string, ideaStatus: string, notes?: string) {
  await ensureAdmin();
  if (!(HACKATHON_IDEA_STATUSES as readonly string[]).includes(ideaStatus)) return { error: "Invalid idea status" };
  await db.update(hackathonTeams).set({ ideaStatus, ideaReviewNotes: notes ?? null, updatedAt: new Date() }).where(eq(hackathonTeams.id, id));
  // Notify the team leader only.
  try {
    const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, id)).limit(1);
    if (team) {
      const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, id));
      const leader = members.find(m => m.isLeader) || members[0];
      if (leader) {
        const e = ideaStatusEmail({ teamNumber: team.teamNumber, teamName: team.teamName, ideaStatus, adminNotes: notes });
        await sendEmail({ to: leader.email, subject: e.subject, html: e.html });
      }
    }
  } catch (err) { console.error("[email] idea status notify failed", err); }
  revalidatePath("/admin/teams");
  return { success:true };
}

export async function togglePosition(id: string, isActive: boolean) {
  await ensureAdmin();
  await db.update(boardPositions).set({ isActive }).where(eq(boardPositions.id, id));
  revalidatePath("/admin/settings");
  return { success:true };
}

export async function upsertPosition(name: string, description: string) {
  await ensureAdmin();
  if (!name.trim()) return { error:"Name required" };
  await db.insert(boardPositions).values({ name: name.trim(), description }).onConflictDoNothing();
  revalidatePath("/admin/settings");
  return { success:true };
}
