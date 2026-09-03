import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  if (pathname === "/login" && token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET!));
      const role = (payload as { role?: string })?.role;
      return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/dashboard", req.url));
    } catch {
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/login"] };
