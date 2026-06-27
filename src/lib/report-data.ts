import { prisma } from "@/lib/prisma";
import type { ReportData } from "@/lib/pdf";

export async function loadReportData(attemptId: string): Promise<ReportData | null> {
  const a = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { candidate: true, exam: { select: { name: true } } },
  });
  if (!a) return null;

  const payload =
    (a.payload as {
      questions?: ReportData["questions"];
      answers?: Record<string, string>;
    }) || {};

  return {
    examName: a.exam.name,
    candidate: {
      fullName: a.candidate.fullName,
      phone: a.candidate.phone,
      organization: a.candidate.organization,
      department: a.candidate.department,
      candidateRef: a.candidate.candidateRef,
    },
    total: a.total,
    correct: a.correct,
    wrong: a.wrong,
    score: a.score,
    percentage: a.percentage,
    timeUsedSec: a.timeUsedSec,
    finishedAt: a.finishedAt ? a.finishedAt.toISOString() : null,
    questions: Array.isArray(payload.questions) ? payload.questions : [],
    answers: payload.answers || {},
  };
}

export function safeName(s: string) {
  return s.replace(/[^a-zA-Z0-9_\-]+/g, "_").slice(0, 40) || "nomzod";
}
