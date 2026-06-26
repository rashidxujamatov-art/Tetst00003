import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ImportClient from "./import-client";
import QuestionsClient from "./questions-client";

export const dynamic = "force-dynamic";

export default async function BankDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const bank = await prisma.questionBank.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!bank) notFound();

  const questions = bank.questions.map((q: (typeof bank.questions)[number], i: number) => ({
    id: q.id,
    index: i + 1,
    text: q.text,
    optionA: q.optionA,
    optionB: q.optionB,
    optionC: q.optionC,
    optionD: q.optionD,
    correct: q.correct,
  }));

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">WorldSkills · Admin</span>
          </div>
          <Link href="/admin/banks" className="text-sm text-slate-500 hover:text-brand">
            ← Banklar
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">{bank.name}</h1>
        {bank.skill && <p className="text-slate-400 mt-0.5">{bank.skill}</p>}
        <p className="text-slate-500 mt-1">
          Jami savollar: <b>{questions.length}</b>
        </p>

        <ImportClient bankId={bank.id} />
        <QuestionsClient questions={questions} />
      </div>
    </main>
  );
}
