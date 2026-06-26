import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const banks = await prisma.questionBank.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });
  return NextResponse.json({ banks });
}

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const skill = String(body.skill || "").trim() || null;
  if (!name) return NextResponse.json({ error: "Bank nomini kiriting" }, { status: 400 });
  const bank = await prisma.questionBank.create({ data: { name, skill } });
  return NextResponse.json({ ok: true, bank });
}
