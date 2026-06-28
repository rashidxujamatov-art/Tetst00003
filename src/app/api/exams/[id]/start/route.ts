import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pickRandom } from "@/lib/random";
import { normalizeUzPhone, isValidUzPhone, isValidEmail, formatUzPhone } from "@/lib/validate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type DbQuestion = {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: "A" | "B" | "C" | "D";
};

// Variantlarni aralashtirib, to'g'ri javob harfini saqlaydi.
function buildOptions(q: DbQuestion) {
  const base = [
    { text: q.optionA, correct: q.correct === "A" },
    { text: q.optionB, correct: q.correct === "B" },
    { text: q.optionC, correct: q.correct === "C" },
    { text: q.optionD, correct: q.correct === "D" },
  ];
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  const letters = ["A", "B", "C", "D"];
  const options = base.map((o, i) => ({ letter: letters[i], text: o.text }));
  const correctLetter = letters[base.findIndex((o) => o.correct)];
  return { options, correctLetter };
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const phoneRaw = String(body.phone || "").trim();
  const gender = String(body.gender || "").trim();
  const birthDate = String(body.birthDate || "").trim();
  const organization = String(body.organization || "").trim() || null;

  const phoneNorm = normalizeUzPhone(phoneRaw);

  if (!fullName) return NextResponse.json({ error: "F.I.Sh kiriting" }, { status: 400 });
  if (!isValidEmail(email)) return NextResponse.json({ error: "To'g'ri elektron pochta kiriting" }, { status: 400 });
  if (!phoneNorm || !isValidUzPhone(phoneRaw))
    return NextResponse.json({ error: "Telefon raqami O'zbekiston formatида emas (+998 va 9 ta raqam)" }, { status: 400 });
  if (!gender) return NextResponse.json({ error: "Jinsni tanlang" }, { status: 400 });
  if (!birthDate) return NextResponse.json({ error: "Tug'ilgan sanani kiriting" }, { status: 400 });

  const phone = formatUzPhone(phoneRaw);

  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: { bank: { include: { questions: true } } },
  });
  if (!exam) return NextResponse.json({ error: "Imtihon topilmadi" }, { status: 404 });

  // Yo'nalish — imtihon bankidan avtomatik
  const department = exam.bank.skill || exam.bank.name;

  // Bir martalik: shu imtihonni shu email yoki telefon bilan allaqachon topshirganmi?
  const prior = await prisma.attempt.findFirst({
    where: {
      examId: exam.id,
      finishedAt: { not: null },
      candidate: { OR: [{ email }, { phone }] },
    },
  });
  if (prior) {
    return NextResponse.json(
      { error: "Siz bu imtihonni allaqachon topshirgansiz. Qayta topshirish mumkin emas." },
      { status: 409 }
    );
  }

  const pool = exam.bank.questions as DbQuestion[];
  if (pool.length < exam.numQuestions) {
    return NextResponse.json({ error: "Bankда yetarli savol yo'q" }, { status: 400 });
  }

  const picked = pickRandom(pool, exam.numQuestions);
  const payloadQuestions = picked.map((q, i) => {
    const { options, correctLetter } = buildOptions(q);
    return { id: q.id, n: i + 1, text: q.text, options, correct: correctLetter };
  });

  const candidate = await prisma.candidate.create({
    data: { fullName, email, phone, gender, birthDate, organization, department },
  });
  const attempt = await prisma.attempt.create({
    data: {
      examId: exam.id,
      candidateId: candidate.id,
      total: payloadQuestions.length,
      payload: { questions: payloadQuestions, answers: {} },
    },
  });

  // Mijozga TO'G'RI JAVOBSIZ yuboriladi
  const clientQuestions = payloadQuestions.map((q) => ({
    id: q.id,
    n: q.n,
    text: q.text,
    options: q.options,
  }));

  return NextResponse.json({
    attemptId: attempt.id,
    examName: exam.name,
    durationMin: exam.durationMin,
    total: payloadQuestions.length,
    questions: clientQuestions,
  });
}
