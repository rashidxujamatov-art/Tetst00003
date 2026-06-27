import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { buildResultsWorkbook, type ResultRow } from "@/lib/excel-export";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const attempts = await prisma.attempt.findMany({
    where: { finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
    include: { candidate: true, exam: { select: { name: true } } },
  });

  const rows: ResultRow[] = attempts.map((a: (typeof attempts)[number]) => ({
    fullName: a.candidate.fullName,
    email: a.candidate.email || "",
    phone: a.candidate.phone,
    gender: a.candidate.gender || "",
    birthDate: a.candidate.birthDate || "",
    organization: a.candidate.organization || "",
    department: a.candidate.department || "",
    examName: a.exam.name,
    total: a.total,
    correct: a.correct,
    wrong: a.wrong,
    percentage: a.percentage,
    score: a.score,
    finishedAt: a.finishedAt ? a.finishedAt.toISOString() : null,
  }));

  const buf = await buildResultsWorkbook(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="natijalar_${date}.xlsx"`,
    },
  });
}
