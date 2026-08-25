import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { boardApplications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`board-status:${ip}`, LIMITS.statusLookup.limit, LIMITS.statusLookup.windowMs)) return NextResponse.json({ error: LIMITS.statusLookup.message },{status:429});
  const id = req.nextUrl.searchParams.get("applicationNumber")?.trim();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!id || !email) return NextResponse.json({ error:"Application ID and email required" },{status:400});
  const [app] = await db.select().from(boardApplications).where(and(eq(boardApplications.applicationNumber,id),eq(boardApplications.email,email))).limit(1);
  if (!app) return NextResponse.json({ error:"No matching application found" },{status:404});
  return NextResponse.json({ applicationNumber:app.applicationNumber, fullName:app.fullName, status:app.status });
}
