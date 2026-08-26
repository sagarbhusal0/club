import { NextRequest, NextResponse } from "next/server";
import { validateLogin, createToken, setAuthCookie } from "@/lib/auth";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`login:${ip}`, LIMITS.login.limit, LIMITS.login.windowMs)) return NextResponse.json({ error: LIMITS.login.message },{status:429});
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error:"Email and password required" },{status:400});
  let user;
  try {
    user = await validateLogin(email, password);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause = (e as { cause?: unknown })?.cause;
    const causeMsg = cause instanceof Error ? cause.message : cause ? String(cause) : "";
    console.error("[login] DB error:", causeMsg || msg, e);
    return NextResponse.json({ error:"Database connection failed. Please try again later." },{status:503});
  }
  if (!user) return NextResponse.json({ error:"Invalid credentials" },{status:401});
  const token = await createToken({ id:user.id, email:user.email, role:user.role });
  await setAuthCookie(token);
  return NextResponse.json({ success:true, role: user.role });
}
