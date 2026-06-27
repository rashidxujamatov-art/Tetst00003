import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const exams = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bank: { select: { name: true } },
      _count: { select: { attempts: true } },
    },
  });
  return NextResponse.json({ exams });
}

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  const name = String(body.name || "").trim();
  const bankId = String(body.bankId || "");
  const numQuestions = parseInt(String(body.numQuestions), 10);
  const durationMin = parseInt(String(body.durationMin), 10);

  if (!name) return NextResponse.json({ error: "Imtihon nomini kiriting" }, { status: 400 });
  if (!bankId) return NextResponse.json({ error: "Bank tanlang" }, { status: 400 });

  const bank = await prisma.questionBank.findUnique({
    where: { id: bankId },
    include: { _count: { select: { questions: true } } },
  });
  if (!bank) return NextResponse.json({ error: "Bank topilmadi" }, { status: 404 });

  if (!Number.isInteger(numQuestions) || numQuestions < 1) {
    return NextResponse.json({ error: "Savollar soni kamida 1 bo'lsin" }, { status: 400 });
  }
  if (numQuestions > bank._count.questions) {
    return NextResponse.json(
      { error: `Bankда faqat ${bank._count.questions} ta savol bor` },
      { status: 400 }
    );
  }
  if (!Number.isInteger(durationMin) || durationMin < 1) {
    return NextResponse.json({ error: "Vaqt (daqiqa) kamida 1 bo'lsin" }, { status: 400 });
  }

  const exam = await prisma.exam.create({
    data: { name, bankId, numQuestions, durationMin },
  });
  return NextResponse.json({ ok: true, exam });
}
