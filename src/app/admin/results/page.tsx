import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ResultsClient from "./results-client";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const attemptsRaw = await prisma.attempt.findMany({
    where: { finishedAt: { not: null } },
    orderBy: { finishedAt: "desc" },
    include: { candidate: true, exam: { select: { name: true } } },
  });

  const rows = attemptsRaw.map((a: (typeof attemptsRaw)[number]) => ({
    id: a.id,
    name: a.candidate.fullName,
    email: a.candidate.email || "",
    phone: a.candidate.phone,
    org: a.candidate.organization || "",
    examName: a.exam.name,
    score: a.score,
    percentage: a.percentage,
    correct: a.correct,
    total: a.total,
    finishedAt: a.finishedAt ? a.finishedAt.toISOString() : "",
  }));

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">Xalqaro standartlarga mos ta'lim</span>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-brand">
            ← Boshqaruv paneli
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Natijalar</h1>
            <p className="text-slate-500 mt-1">Jami topshirilgan: {rows.length} ta urinish.</p>
          </div>
          {rows.length > 0 && (
            <a
              href="/api/results/export"
              className="rounded-xl bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800 transition"
            >
              Excel'ga eksport
            </a>
          )}
        </div>
        <ResultsClient rows={rows} />
      </div>
    </main>
  );
}
