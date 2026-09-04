import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`hack-status:${ip}`, LIMITS.statusLookup.limit, LIMITS.statusLookup.windowMs)) return NextResponse.json({ error: LIMITS.statusLookup.message },{status:429});
  const teamNumber = req.nextUrl.searchParams.get("teamNumber")?.trim().toUpperCase();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!teamNumber && !email) return NextResponse.json({ error:"Team ID or email required" },{status:400});
  const toJson = (t: typeof hackathonTeams.$inferSelect) => ({
    teamName: t.teamName, projectTitle: t.projectTitle, status: t.status, teamNumber: t.teamNumber,
    adminNotes: t.adminNotes, ideaStatus: t.ideaStatus, ideaReviewNotes: t.ideaReviewNotes, isFinalSubmitted: t.isFinalSubmitted, finalSubmittedAt: t.finalSubmittedAt,
  });
  if (teamNumber && email) {
    const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, teamNumber)).limit(1);
    if (!team) return NextResponse.json({ error:"Team not found" },{status:404});
    const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
    if (!members.some(m=>m.email.toLowerCase()===email)) return NextResponse.json({ error:"Email not in team" },{status:404});
    return NextResponse.json(toJson(team));
  }
  if (teamNumber) {
    if (!email) return NextResponse.json({ error:"Email required with Team ID to verify membership" },{status:400});
    const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, teamNumber)).limit(1);
    if (!team) return NextResponse.json({ error:"Team not found" },{status:404});
    const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
    if (!members.some(m=>m.email.toLowerCase()===email)) return NextResponse.json({ error:"Email not in team" },{status:404});
    return NextResponse.json(toJson(team));
  }
  const memberRows = await db.select().from(hackathonMembers).where(eq(hackathonMembers.email, email!));
  if (!memberRows.length) return NextResponse.json({ error:"No team found for this email" },{status:404});
  const teamIds = [...new Set(memberRows.map(m=>m.teamId))];
  const teams = teamIds.length === 1
    ? await db.select().from(hackathonTeams).where(eq(hackathonTeams.id, teamIds[0]))
    : await db.select().from(hackathonTeams).where(inArray(hackathonTeams.id, teamIds));
  if (teams.length === 1) return NextResponse.json(toJson(teams[0]));
  return NextResponse.json({ teams: teams.map(toJson) });
}
