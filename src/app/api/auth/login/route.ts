import { NextRequest, NextResponse } from "next/server";
import { validateLogin, createToken, setAuthCookie } from "@/lib/auth";
import { rateLimit, LIMITS, getClientIp } from "@/lib/ratelimit";
import { loginSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (!rateLimit(`login:${ip}`, LIMITS.login.limit, LIMITS.login.windowMs)) return NextResponse.json({ error: LIMITS.login.message },{status:429});
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error:"Invalid JSON" },{status:400}); }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error:"Email and password required" },{status:400});
  const { email, password } = parsed.data;
  const user = await validateLogin(email, password);
  if (!user) return NextResponse.json({ error:"Invalid credentials" },{status:401});
  const token = await createToken({ id:user.id, email:user.email, role:user.role });
  await setAuthCookie(token);
  return NextResponse.json({ success:true, role: user.role });
}
