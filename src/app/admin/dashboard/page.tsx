import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-button";

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
            <span className="font-bold text-brand">WorldSkills · Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{String(session.email || "")}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">Boshqaruv paneli</h1>
        <p className="text-slate-500 mt-1">
          Kirish muvaffaqiyatli. 1-modul tayyor — keyingi modullarda savol import, imtihon
          yaratish va natijalar qo'shiladi.
        </p>

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
          {[
            ["Imtihon yaratish", "Modul 3 — tez orada"],
            ["Natijalar", "Modul 5–8 — tez orada"],
            ["Telegram sozlamalari", "Modul 7 — tez orada"],
          ].map(([t, s]) => (
            <div
              key={t}
              className="bg-white border border-dashed border-slate-300 rounded-xl p-5 text-slate-400"
            >
              <div className="font-semibold text-slate-600">{t}</div>
              <div className="text-sm mt-1">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
