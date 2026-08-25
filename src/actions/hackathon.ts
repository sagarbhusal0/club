"use server";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { hackathonSchema } from "@/lib/validation";
import { sql } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import { hackathonRegisteredEmail } from "@/lib/email-templates";

export async function submitHackathonTeam(data: unknown, _ip: string) {
  const parsed = hackathonSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const year = new Date().getFullYear();
  const prefix = `ICT-HACK-${year}-`;

  try {
    const existing = await db.execute(sql`SELECT team_number FROM hackathon_teams WHERE team_number LIKE ${prefix+"%"} ORDER BY team_number DESC LIMIT 1`) as unknown as { rows: { team_number:string }[] };
    const rows = existing.rows;
    let next = 1;
    if (rows.length) next = parseInt(rows[0].team_number.split("-").pop()||"0",10)+1;
    const num = `${prefix}${String(next).padStart(4,"0")}`;

    const [team] = await db.insert(hackathonTeams).values({
      teamNumber: num,
      teamName: d.teamName,
      projectTitle: d.projectTitle,
      category: d.category,
      description: d.description,
      problemStatement: d.problemStatement||null,
      solution: d.solution||null,
      technologyStack: d.technologyStack||null,
      status: "REGISTERED",
    }).returning();

    for (let i=0;i<d.members.length;i++) {
      const m = d.members[i];
      await db.insert(hackathonMembers).values({
        teamId: team.id,
        fullName: m.fullName,
        email: m.email.toLowerCase(),
        phone: m.phone,
        grade: m.grade,
        section: m.section,
        studentId: m.studentId,
        role: m.role,
        githubUrl: m.githubUrl||null,
        isLeader: i===0,
      });
    }

    try {
      const emailData = hackathonRegisteredEmail({
        teamNumber: team.teamNumber,
        teamName: team.teamName,
        projectTitle: team.projectTitle,
        category: team.category,
        description: team.description,
        members: d.members.map(m=>({ fullName:m.fullName, email:m.email.toLowerCase(), role:m.role, studentId:m.studentId })),
      });
      for (const m of d.members) {
        try { await sendEmail({ to: m.email.toLowerCase(), subject: emailData.subject, html: emailData.html }); } catch {}
      }
    } catch (e) { console.error("[email] hackathon confirmation failed", e); }

    return { success:true, teamNumber: team.teamNumber, teamName: team.teamName };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[hackathon] submit failed:", msg, e);
    if (msg.includes("duplicate")||msg.includes("unique")||msg.includes("hm_student_id_unique")||msg.includes("hm_email_unique"))
      return { error:"This student is already registered in another team." };
    return { error: msg ? `Submission failed: ${msg}` : "Something went wrong. Please try again." };
  }
}
