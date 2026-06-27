import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { telegramConfigured, tgSendMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  if (!telegramConfigured()) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID o'rnatilmagan" },
      { status: 400 }
    );
  }
  const r = await tgSendMessage(
    "✅ <b>Sinov xabari</b>\nWorldSkills Test Platform — Telegram ulanishi ishlayapti."
  );
  if (r.ok) return NextResponse.json({ ok: true });
  return NextResponse.json(
    { error: r.description || "Telegram xatosi. Token/chat_id va bot admin ekanini tekshiring." },
    { status: 400 }
  );
}
