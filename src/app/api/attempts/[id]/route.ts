import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const a = await prisma.attempt.findUnique({
    where: { id: params.id },
    include: { candidate: true, exam: { select: { name: true } } },
  });
  if (!a) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json({
    attempt: {
      id: a.id,
      examName: a.exam.name,
      candidate: a.candidate,
      total: a.total,
      correct: a.correct,
      wrong: a.wrong,
      score: a.score,
      percentage: a.percentage,
      timeUsedSec: a.timeUsedSec,
      finishedAt: a.finishedAt,
      payload: a.payload,
    },
  });
}
