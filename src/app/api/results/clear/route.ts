import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Barcha urinishlar va ishtirokchilarni o'chiradi.
// Savollar, banklar, imtihonlar va admin SAQLANADI.
export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const att = await prisma.attempt.deleteMany({});
  const cand = await prisma.candidate.deleteMany({});

  return NextResponse.json({ ok: true, attempts: att.count, candidates: cand.count });
}
