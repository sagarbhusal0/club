import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { boardApplications, hackathonMembers, hackathonTeams } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`dashboard:${ip}`, LIMITS.dashboard.limit, LIMITS.dashboard.windowMs)) return NextResponse.json({ error: LIMITS.dashboard.message },{status:429});
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const q = (req.nextUrl.searchParams.get("q") || req.nextUrl.searchParams.get("applicationId") || "").trim().toUpperCase();

  let applications: typeof boardApplications.$inferSelect[] = [];
  let teams: { teamNumber:string; teamName:string; projectTitle:string; category:string; status:string; members:{fullName:string;role:string}[] }[] = [];

  if (email && email.includes("@")) {
    applications = await db.select().from(boardApplications).where(eq(boardApplications.email, email));
    const memberRows = await db.select().from(hackathonMembers).where(eq(hackathonMembers.email, email));
    const teamIds = memberRows.map(m=>m.teamId);
    if (teamIds.length) {
      const teamRows = await db.select().from(hackathonTeams).where(inArray(hackathonTeams.id, teamIds));
      for (const t of teamRows) {
        const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, t.id));
        teams.push({ teamNumber: t.teamNumber, teamName: t.teamName, projectTitle: t.projectTitle, category: t.category, status: t.status, members: members.map(m=>({fullName:m.fullName,role:m.role})) });
      }
    }
    if (q) {
      const byId = await db.select().from(boardApplications).where(eq(boardApplications.applicationNumber, q));
      for (const a of byId) if (!applications.some(x=>x.id===a.id)) applications.push(a);
      const teamById = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, q)).limit(1);
      for (const t of teamById) if (!teams.some(x=>x.teamNumber===t.teamNumber)) {
        const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, t.id));
        teams.push({ teamNumber: t.teamNumber, teamName: t.teamName, projectTitle: t.projectTitle, category: t.category, status: t.status, members: members.map(m=>({fullName:m.fullName,role:m.role})) });
      }
    }
  } else if (q) {
    const appById = await db.select().from(boardApplications).where(eq(boardApplications.applicationNumber, q));
    applications = appById;
    const teamById = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, q)).limit(1);
    for (const t of teamById) {
      const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, t.id));
      teams.push({ teamNumber: t.teamNumber, teamName: t.teamName, projectTitle: t.projectTitle, category: t.category, status: t.status, members: members.map(m=>({fullName:m.fullName,role:m.role})) });
    }
  } else {
    return NextResponse.json({ error:"Enter your email or Application/Team ID" },{status:400});
  }

  if (applications.length===0 && teams.length===0) return NextResponse.json({ error: q ? `No result for ${q}` : "No applications or teams found for this email" },{status:404});

  return NextResponse.json({
    applications: applications.map(a=>({ applicationNumber:a.applicationNumber, fullName:a.fullName, status:a.status, grade:a.grade, createdAt:a.createdAt })),
    teams,
  });
}
