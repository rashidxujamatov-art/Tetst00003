import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Bir martalik: /api/setup?secret=SETUP_SECRET
// ADMIN_EMAIL / ADMIN_PASSWORD env'lardan birinchi adminni yaratadi.
export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.SETUP_SECRET || secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: "secret noto'g'ri" }, { status: 401 });
  }

  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || "");
  if (!email || !password) {
    return NextResponse.json(
      { error: "ADMIN_EMAIL / ADMIN_PASSWORD env o'rnatilmagan" },
      { status: 500 }
    );
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ ok: true, message: "Admin allaqachon mavjud: " + email });
  }

  await prisma.admin.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
  return NextResponse.json({ ok: true, message: "Admin yaratildi: " + email });
}
