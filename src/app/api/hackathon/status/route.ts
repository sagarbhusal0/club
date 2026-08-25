import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hackathonTeams, hackathonMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`hack-status:${ip}`, LIMITS.statusLookup.limit, LIMITS.statusLookup.windowMs)) return NextResponse.json({ error: LIMITS.statusLookup.message },{status:429});
  const teamNumber = req.nextUrl.searchParams.get("teamNumber")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!teamNumber || !email) return NextResponse.json({ error:"Team ID and email required" },{status:400});
  const [team] = await db.select().from(hackathonTeams).where(eq(hackathonTeams.teamNumber, teamNumber)).limit(1);
  if (!team) return NextResponse.json({ error:"Team not found" },{status:404});
  const members = await db.select().from(hackathonMembers).where(eq(hackathonMembers.teamId, team.id));
  if (!members.some(m=>m.email.toLowerCase()===email)) return NextResponse.json({ error:"Email not in team" },{status:404});
  return NextResponse.json({ teamName: team.teamName, projectTitle: team.projectTitle, status: team.status, teamNumber: team.teamNumber });
}
