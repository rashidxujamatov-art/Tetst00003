import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-brand" />
        <h1 className="text-2xl font-bold text-brand">WorldSkills Test Platform</h1>
        <p className="mt-2 text-slate-500">
          Professional imtihon platformasi. Hozircha 1-modul: admin tizimi.
        </p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-600 transition"
        >
          Admin panelga kirish
        </Link>
        <p className="mt-4 text-xs text-slate-400">
          Imtihon havolasi (nomzodlar uchun) keyingi modullarda qo'shiladi.
        </p>
      </div>
    </main>
  );
}
