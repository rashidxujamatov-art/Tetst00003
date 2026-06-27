import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [questions, exams, candidates] = await Promise.all([
    prisma.question.count(),
    prisma.exam.count(),
    prisma.candidate.count(),
  ]);

  const stats = [
    { k: "Savollar", v: questions },
    { k: "Imtihonlar", v: exams },
    { k: "Nomzodlar", v: candidates },
  ];

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">Xalqaro standartlarga mos ta'lim</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{String(session.email || "")}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">Boshqaruv paneli</h1>
        <p className="text-slate-500 mt-1">{BRAND.org}</p>
        <p className="text-xs text-slate-400 mt-0.5">{BRAND.agencyNote}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {stats.map((s) => (
            <div key={s.k} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-sm text-slate-500">{s.k}</div>
              <div className="text-3xl font-bold mt-1">{s.v}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/admin/banks"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand transition"
          >
            <div className="font-semibold text-brand">Savol banklari</div>
            <div className="text-sm mt-1 text-slate-500">
              Excel'dan savol yuklash va banklarni boshqarish
            </div>
          </a>
          <a
            href="/admin/exams"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand transition"
          >
            <div className="font-semibold text-brand">Imtihon yaratish</div>
            <div className="text-sm mt-1 text-slate-500">
              Bankdan tasodifiy savolli, vaqtli imtihon
            </div>
          </a>
          <a
            href="/admin/results"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand transition"
          >
            <div className="font-semibold text-brand">Natijalar</div>
            <div className="text-sm mt-1 text-slate-500">
              Topshirilgan imtihonlar, ball va qidiruv
            </div>
          </a>
          <a
            href="/admin/settings"
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-brand transition"
          >
            <div className="font-semibold text-brand">Telegram sozlamalari</div>
            <div className="text-sm mt-1 text-slate-500">
              Natijalarni kanalga avtomatik yuborish va sinov
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
