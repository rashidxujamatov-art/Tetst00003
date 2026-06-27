import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type PQ = {
  id: string;
  n: number;
  text: string;
  options: { letter: string; text: string }[];
  correct: string;
};

export default async function ResultDetailPage({ params }: { params: { attemptId: string } }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const a = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: { candidate: true, exam: { select: { name: true } } },
  });
  if (!a) notFound();

  const payload = (a.payload as { questions?: PQ[]; answers?: Record<string, string> }) || {};
  const questions: PQ[] = Array.isArray(payload.questions) ? payload.questions : [];
  const answers: Record<string, string> = payload.answers || {};

  const c = a.candidate;
  const info: [string, string][] = [
    ["F.I.Sh", c.fullName],
    ["Elektron pochta", c.email || "—"],
    ["Telefon", c.phone],
    ["Jins", c.gender || "—"],
    ["Tug'ilgan sana", c.birthDate || "—"],
    ["Tashkilot", c.organization || "—"],
    ["Yo'nalish", c.department || "—"],
    ["Imtihon", a.exam.name],
    ["Sana", a.finishedAt ? new Date(a.finishedAt).toLocaleString() : "—"],
    ["Sarflangan vaqt", `${Math.floor(a.timeUsedSec / 60)} daq ${a.timeUsedSec % 60} son`],
  ];

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">Xalqaro standartlarga mos ta'lim</span>
          </div>
          <Link href="/admin/results" className="text-sm text-slate-500 hover:text-brand">
            ← Natijalar
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">{c.fullName}</h1>

        {/* PDF tugmalari */}
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`/api/attempts/${a.id}/report1`}
            target="_blank"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            PDF 1 — Javoblar varaqasi
          </a>
          <a
            href={`/api/attempts/${a.id}/report2`}
            target="_blank"
            className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
          >
            PDF 2 — Rasmiy hisobot
          </a>
        </div>

        {/* Ball */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat k="Ball (100)" v={String(a.score)} big />
          <Stat k="Foiz" v={`${a.percentage}%`} big />
          <Stat k="To'g'ri" v={`${a.correct} / ${a.total}`} />
          <Stat k="Xato" v={String(a.wrong)} />
        </div>

        {/* Ma'lumot */}
        <div className="mt-5 bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {info.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 text-sm border-b border-slate-50 py-1">
              <span className="text-slate-500">{k}</span>
              <span className="font-medium text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Savol-javob tahlili */}
        <h2 className="text-lg font-bold mt-8 mb-3">Savol-javob tahlili</h2>
        <div className="space-y-3">
          {questions.map((q) => {
            const chosen = answers[q.id] || null;
            const isCorrect = chosen === q.correct;
            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">
                    <span className="text-brand mr-1">{q.n}.</span>
                    {q.text}
                  </div>
                  <span
                    className={`shrink-0 text-xs font-semibold rounded-md px-2 py-1 ${
                      isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isCorrect ? "To'g'ri" : chosen ? "Xato" : "Belgilanmagan"}
                  </span>
                </div>
                <ul className="mt-2 text-sm space-y-0.5">
                  {q.options.map((o) => {
                    const isAns = o.letter === q.correct;
                    const isChosen = o.letter === chosen;
                    return (
                      <li
                        key={o.letter}
                        className={
                          isAns
                            ? "text-green-700 font-semibold"
                            : isChosen
                            ? "text-red-700"
                            : "text-slate-600"
                        }
                      >
                        {o.letter}) {o.text}
                        {isAns && " ✓ (to'g'ri javob)"}
                        {isChosen && !isAns && " ← tanlagan"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Stat({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="border border-slate-200 bg-white rounded-lg p-3">
      <div className="text-xs text-slate-500">{k}</div>
      <div className={`font-mono font-bold ${big ? "text-2xl" : "text-lg"}`}>{v}</div>
    </div>
  );
}
