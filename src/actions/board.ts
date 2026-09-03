"use server";
import { db } from "@/db";
import { boardApplications, boardPositions } from "@/db/schema";
import { boardApplicationSchema } from "@/lib/validation";
import { rateLimit, LIMITS } from "@/lib/ratelimit";
import { sql, eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { boardSubmittedEmail } from "@/lib/email-templates";

export async function submitBoardApplication(data: unknown, ip: string) {
  const emailFromData = (data as { email?: string })?.email?.toLowerCase();
  if (!rateLimit(`board:${ip}`, LIMITS.boardSubmit.limit, LIMITS.boardSubmit.windowMs)) return { error: LIMITS.boardSubmit.message };
  if (emailFromData && !rateLimit(`board:email:${emailFromData}`, 2, 60_000)) return { error:"This email has reached the submission limit. Please try again later." };
  const parsed = boardApplicationSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data as unknown as Record<string,string> & { confirm:boolean };
  if (d.firstChoicePositionId?.startsWith("fallback-")) {
    const name = d.firstChoicePositionId==="fallback-member" ? "Member" : null;
    if (name) {
      const [p] = await db.select().from(boardPositions).where(eq(boardPositions.name, name)).limit(1);
      if (p) d.firstChoicePositionId = p.id;
      else {
        const [ins] = await db.insert(boardPositions).values({ name, description: "General member — contribute across club activities", sortOrder: "13" }).onConflictDoNothing().returning();
        const resolved = ins || (await db.select().from(boardPositions).where(eq(boardPositions.name, name)).limit(1))[0];
        if (resolved) d.firstChoicePositionId = resolved.id;
      }
    }
  }

  const year = new Date().getFullYear();
  const prefix = `ICT-BOARD-${year}-`;

  try {
    const existing = await db.execute(sql`SELECT application_number FROM board_applications WHERE application_number LIKE ${prefix + "%"} ORDER BY application_number DESC LIMIT 1`) as unknown as { rows: { application_number:string }[] };
    const rows = existing.rows;
    let next = 1;
    if (rows.length) {
      const n = parseInt(rows[0].application_number.split("-").pop()||"0",10);
      next = n+1;
    }
    const num = `${prefix}${String(next).padStart(4,"0")}`;
    const [result] = await db.insert(boardApplications).values({
        applicationNumber: num,
        fullName: d.fullName,
        email: d.email.toLowerCase(),
        phone: d.phone,
        grade: d.grade,
        section: d.section,
        studentId: (d.studentId && d.studentId.trim()) ? d.studentId.trim() : "",
        dateOfBirth: d.dateOfBirth||null,
        profilePhoto: d.profilePhoto||null,
        firstChoicePositionId: d.firstChoicePositionId||null,
        technicalInterests: d.technicalInterests||null,
        expertise: d.expertise||null,
        experience: d.experience||null,
        leadershipExperience: d.leadershipExperience||null,
        projects: d.projects||null,
        competitions: d.competitions||null,
        githubUrl: d.githubUrl||null,
        portfolioUrl: d.portfolioUrl||null,
        otherLinks: d.otherLinks||null,
        motivation: d.motivation,
        positionReason: d.positionReason,
        contribution: d.contribution,
        proposedActivities: d.proposedActivities,
        timeCommitment: d.timeCommitment,
        status: "SUBMITTED",
      }).returning();

    // send confirmation with full details (non-blocking for user flow)
    try {
      let firstChoice: string|undefined;
      if (result.firstChoicePositionId) {
        const [p] = await db.select().from(boardPositions).where(eq(boardPositions.id, result.firstChoicePositionId)).limit(1);
        firstChoice = p?.name;
      }
      const emailData = boardSubmittedEmail({
        applicationNumber: result.applicationNumber,
        fullName: result.fullName,
        email: result.email,
        phone: result.phone,
        grade: result.grade,
        section: result.section,
        studentId: result.studentId,
        firstChoice,
        motivation: result.motivation,
        timeCommitment: result.timeCommitment,
      });
      await sendEmail({ to: result.email, subject: emailData.subject, html: emailData.html });
    } catch (e) { console.error("[email] board confirmation failed", e); }

    return { success:true, applicationNumber: result.applicationNumber };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause = (e as { cause?: unknown })?.cause;
    const causeMsg = cause instanceof Error ? cause.message : cause ? String(cause) : "";
    const detail = (msg.includes("Failed query") && causeMsg) ? causeMsg : msg;
    console.error("[board] submit failed:", detail, e);
    if (detail.includes("duplicate")||detail.includes("unique")) return { error:"Duplicate submission detected." };
    if (detail.includes("null value")||detail.includes("not-null")) return { error:"Submission failed: a required field was empty. Please refresh and try again." };
    return { error: detail ? `Submission failed: ${detail}` : "Something went wrong. Please try again." };
  }
}
