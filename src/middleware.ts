import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login ochiq; qolgan /admin/* himoyalangan
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("ws_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    try {
      await jwtVerify(token, secret);
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
