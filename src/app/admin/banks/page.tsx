import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BanksClient from "./banks-client";

export const dynamic = "force-dynamic";

export default async function BanksPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const banksRaw = await prisma.questionBank.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  const banks = banksRaw.map((b: (typeof banksRaw)[number]) => ({
    id: b.id,
    name: b.name,
    skill: b.skill,
    count: b._count.questions,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">Xalqaro standartlarga mos ta'lim</span>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-brand">
            ← Boshqaruv paneli
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">Savol banklari</h1>
        <p className="text-slate-500 mt-1">
          Har bir kasb uchun alohida bank yarating va Excel (.xlsx) orqali savollarni yuklang.
        </p>
        <BanksClient banks={banks} />
      </div>
    </main>
  );
}
