import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExamsClient from "./exams-client";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const banksRaw = await prisma.questionBank.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });
  const examsRaw = await prisma.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bank: { select: { name: true } },
      _count: { select: { attempts: true } },
    },
  });

  const banks = banksRaw.map((b: (typeof banksRaw)[number]) => ({
    id: b.id,
    name: b.name,
    count: b._count.questions,
  }));
  const exams = examsRaw.map((e: (typeof examsRaw)[number]) => ({
    id: e.id,
    name: e.name,
    bankName: e.bank.name,
    numQuestions: e.numQuestions,
    durationMin: e.durationMin,
    attempts: e._count.attempts,
  }));

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">WorldSkills · Admin</span>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-brand">
            ← Boshqaruv paneli
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">Imtihonlar</h1>
        <p className="text-slate-500 mt-1">
          Bankdan tasodifiy N ta savolli, vaqt belgilangan imtihon yarating. Har bir imtihon uchun
          nomzodlarga beriladigan havola hosil bo'ladi.
        </p>
        <ExamsClient banks={banks} exams={exams} />
      </div>
    </main>
  );
}
