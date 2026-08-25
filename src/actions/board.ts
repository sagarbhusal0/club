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
        studentId: d.studentId,
        dateOfBirth: d.dateOfBirth||null,
        profilePhoto: d.profilePhoto||null,
        firstChoicePositionId: d.firstChoicePositionId||null,
        secondChoicePositionId: d.secondChoicePositionId||null,
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
      let firstChoice: string|undefined, secondChoice: string|undefined;
      if (result.firstChoicePositionId) {
        const [p] = await db.select().from(boardPositions).where(eq(boardPositions.id, result.firstChoicePositionId)).limit(1);
        firstChoice = p?.name;
      }
      if (result.secondChoicePositionId) {
        const [p] = await db.select().from(boardPositions).where(eq(boardPositions.id, result.secondChoicePositionId)).limit(1);
        secondChoice = p?.name;
      }
      const emailData = boardSubmittedEmail({
        applicationNumber: result.applicationNumber,
        fullName: result.fullName,
        email: result.email,
        phone: result.phone,
        grade: result.grade,
        section: result.section,
        studentId: result.studentId,
        firstChoice, secondChoice,
        motivation: result.motivation,
        timeCommitment: result.timeCommitment,
      });
      await sendEmail({ to: result.email, subject: emailData.subject, html: emailData.html });
    } catch (e) { console.error("[email] board confirmation failed", e); }

    return { success:true, applicationNumber: result.applicationNumber };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[board] submit failed:", msg, e);
    if (msg.includes("duplicate")||msg.includes("unique")) return { error:"Duplicate submission detected." };
    return { error: msg ? `Submission failed: ${msg}` : "Something went wrong. Please try again." };
  }
}
