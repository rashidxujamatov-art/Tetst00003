import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-brand" />
        <h1 className="text-2xl font-bold text-brand">{BRAND.title}</h1>
        <p className="mt-3 text-sm text-slate-500">{BRAND.agencyNote}</p>
        <p className="text-sm font-medium text-slate-700">{BRAND.org}</p>
        <Link
          href="/admin/login"
          className="mt-6 inline-block w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-600 transition"
        >
          Admin panelga kirish
        </Link>
        <p className="mt-5 text-xs text-slate-400 border-t border-slate-100 pt-4">
          Imtihon va natijalar platformasi
        </p>
      </div>
    </main>
  );
}
