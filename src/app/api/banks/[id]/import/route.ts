import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseQuestionsXlsx } from "@/lib/excel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const bank = await prisma.questionBank.findUnique({ where: { id: params.id } });
  if (!bank) return NextResponse.json({ error: "Bank topilmadi" }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fayl yuborilmadi" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".xlsx")) {
    return NextResponse.json({ error: "Faqat .xlsx fayl yuklang" }, { status: 400 });
  }

  const buf = await file.arrayBuffer();
  const parsed = parseQuestionsXlsx(buf);
  if (!parsed.ok) {
    return NextResponse.json({ error: "Faylda xatolar bor", details: parsed.errors }, { status: 400 });
  }

  await prisma.question.createMany({
    data: parsed.questions.map((q) => ({
      bankId: bank.id,
      number: q.number,
      text: q.text,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correct: q.correct,
    })),
  });

  return NextResponse.json({ ok: true, imported: parsed.questions.length });
}
