import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ error: "Email va parol kiriting" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin || !(await comparePassword(password, admin.passwordHash))) {
    return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });
  }

  const token = await signToken({ sub: admin.id, email: admin.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
