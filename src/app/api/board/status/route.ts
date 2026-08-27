import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { boardApplications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`board-status:${ip}`, LIMITS.statusLookup.limit, LIMITS.statusLookup.windowMs)) return NextResponse.json({ error: LIMITS.statusLookup.message },{status:429});
  const id = req.nextUrl.searchParams.get("applicationNumber")?.trim().toUpperCase();
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!id && !email) return NextResponse.json({ error:"Application ID or email required" },{status:400});
  if (id && email) {
    const [app] = await db.select().from(boardApplications).where(and(eq(boardApplications.applicationNumber,id),eq(boardApplications.email,email))).limit(1);
    if (!app) return NextResponse.json({ error:"No matching application found for that ID and email" },{status:404});
    return NextResponse.json({ applicationNumber:app.applicationNumber, fullName:app.fullName, status:app.status, adminNotes: app.adminNotes });
  }
  if (id) {
    const [app] = await db.select().from(boardApplications).where(eq(boardApplications.applicationNumber,id)).limit(1);
    if (!app) return NextResponse.json({ error:"No application found for that ID" },{status:404});
    return NextResponse.json({ applicationNumber:app.applicationNumber, fullName:app.fullName, status:app.status, adminNotes: app.adminNotes });
  }
  const apps = await db.select().from(boardApplications).where(eq(boardApplications.email,email!));
  if (!apps.length) return NextResponse.json({ error:"No applications found for this email" },{status:404});
  if (apps.length === 1) {
    const app = apps[0];
    return NextResponse.json({ applicationNumber:app.applicationNumber, fullName:app.fullName, status:app.status, adminNotes: app.adminNotes });
  }
  return NextResponse.json({ applications: apps.map(a=>({ applicationNumber:a.applicationNumber, fullName:a.fullName, status:a.status, adminNotes: a.adminNotes })) });
}
