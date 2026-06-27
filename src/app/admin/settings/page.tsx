import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { telegramConfigured } from "@/lib/telegram";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const tokenSet = !!process.env.TELEGRAM_BOT_TOKEN;
  const chatSet = !!process.env.TELEGRAM_CHAT_ID;
  const configured = telegramConfigured();

  return (
    <main className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">Xalqaro standartlarga mos ta'lim</span>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-slate-500 hover:text-brand">
            ← Boshqaruv paneli
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-bold">Telegram sozlamalari</h1>
        <p className="text-slate-500 mt-1">
          Har bir imtihon topshirilgach, natija (jadval + 2 PDF) avtomatik kanalga yuboriladi.
        </p>

        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <Row label="TELEGRAM_BOT_TOKEN" ok={tokenSet} />
          <Row label="TELEGRAM_CHAT_ID" ok={chatSet} />
        </div>

        {!configured && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            Yuborish uchun Vercel → Settings → Environment Variables да{" "}
            <b>TELEGRAM_BOT_TOKEN</b> va <b>TELEGRAM_CHAT_ID</b> ni qo'shing, so'ng Redeploy qiling.
            Bot kanalда <b>admin</b> bo'lishi shart.
          </div>
        )}

        <SettingsClient configured={configured} />
      </div>
    </main>
  );
}

function Row({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <code className="text-sm">{label}</code>
      <span
        className={`text-sm font-semibold rounded-md px-2 py-1 ${
          ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {ok ? "o'rnatilgan ✓" : "yo'q ✗"}
      </span>
    </div>
  );
}
