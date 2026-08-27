import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`hack-status:${ip}`, LIMITS.statusLookup.limit, LIMITS.statusLookup.windowMs)) return NextResponse.json({ error: LIMITS.statusLookup.message },{status:429});
  const teamNumber = req.nextUrl.searchParams.get("teamNumber")?.trim().toUpperCase();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!teamNumber && !email) return NextResponse.json({ error:"Team ID or email required" },{status:400});
  if (teamNumber && email) {
    const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, teamNumber)).limit(1);
    if (!team) return NextResponse.json({ error:"Team not found" },{status:404});
    const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
    if (!members.some(m=>m.email.toLowerCase()===email)) return NextResponse.json({ error:"Email not in team" },{status:404});
    return NextResponse.json({ teamName: team.teamName, projectTitle: team.projectTitle, status: team.status, teamNumber: team.teamNumber, adminNotes: team.adminNotes });
  }
  if (teamNumber) {
    const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, teamNumber)).limit(1);
    if (!team) return NextResponse.json({ error:"Team not found" },{status:404});
    return NextResponse.json({ teamName: team.teamName, projectTitle: team.projectTitle, status: team.status, teamNumber: team.teamNumber, adminNotes: team.adminNotes });
  }
  const memberRows = await db.select().from(hackathonMembers).where(eq(hackathonMembers.email, email!));
  if (!memberRows.length) return NextResponse.json({ error:"No team found for this email" },{status:404});
  const teamIds = [...new Set(memberRows.map(m=>m.teamId))];
  const teams = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, teamIds[0])).limit(1);
  if (teams.length === 1 && teamIds.length === 1) {
    const t = teams[0];
    return NextResponse.json({ teamName: t.teamName, projectTitle: t.projectTitle, status: t.status, teamNumber: t.teamNumber, adminNotes: t.adminNotes });
  }
  const allTeams: typeof teams = [];
  for (const id of teamIds) {
    const [t] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, id)).limit(1);
    if (t) allTeams.push(t);
  }
  if (allTeams.length === 1) {
    const t = allTeams[0];
    return NextResponse.json({ teamName: t.teamName, projectTitle: t.projectTitle, status: t.status, teamNumber: t.teamNumber, adminNotes: t.adminNotes });
  }
  return NextResponse.json({ teams: allTeams.map(t=>({ teamName: t.teamName, projectTitle: t.projectTitle, status: t.status, teamNumber: t.teamNumber, adminNotes: t.adminNotes })) });
}
