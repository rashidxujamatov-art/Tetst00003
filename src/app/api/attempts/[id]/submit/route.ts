import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const answers: Record<string, string> =
    body.answers && typeof body.answers === "object" ? body.answers : {};
  const timeUsedSec = parseInt(String(body.timeUsedSec || 0), 10) || 0;

  const attempt = await prisma.attempt.findUnique({ where: { id: params.id } });
  if (!attempt) return NextResponse.json({ error: "Urinish topilmadi" }, { status: 404 });
  if (attempt.finishedAt) {
    return NextResponse.json({ error: "Bu imtihon allaqachon yakunlangan" }, { status: 409 });
  }

  const payload = (attempt.payload as { questions?: Array<{ id: string; correct: string }> }) || {};
  const questions = Array.isArray(payload.questions) ? payload.questions : [];

  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] && answers[q.id] === q.correct) correct++;
  }
  const total = questions.length;
  const wrong = total - correct;
  const { score, percentage } = computeScore(correct, total);

  await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      finishedAt: new Date(),
      correct,
      wrong,
      score,
      percentage,
      timeUsedSec,
      payload: { ...(attempt.payload as object), answers },
    },
  });

  return NextResponse.json({ ok: true, total, correct, wrong, score, percentage });
}
