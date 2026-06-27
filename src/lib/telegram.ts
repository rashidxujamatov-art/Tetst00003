import type { ReportData } from "@/lib/pdf";
import { BRAND } from "@/lib/brand";

const token = () => process.env.TELEGRAM_BOT_TOKEN || "";
const chatId = () => process.env.TELEGRAM_CHAT_ID || "";
const api = (method: string) => `https://api.telegram.org/bot${token()}/${method}`;

export function telegramConfigured(): boolean {
  return !!(token() && chatId());
}

function esc(s: string): string {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] || c));
}

export async function tgSendMessage(text: string): Promise<{ ok: boolean; description?: string }> {
  if (!telegramConfigured()) return { ok: false, description: "Telegram ENV o'rnatilmagan" };
  const res = await fetch(api("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId(),
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  return res.json().catch(() => ({ ok: false }));
}

export async function tgSendDocument(
  bytes: Uint8Array,
  filename: string,
  caption?: string
): Promise<{ ok: boolean }> {
  if (!telegramConfigured()) return { ok: false };
  const fd = new FormData();
  fd.append("chat_id", chatId());
  if (caption) fd.append("caption", caption);
  fd.append("document", new Blob([bytes], { type: "application/pdf" }), filename);
  const res = await fetch(api("sendDocument"), { method: "POST", body: fd });
  return res.json().catch(() => ({ ok: false }));
}

export function formatResultMessage(d: ReportData): string {
  const tm = `${Math.floor(d.timeUsedSec / 60)} daq ${d.timeUsedSec % 60} son`;
  const date = d.finishedAt ? new Date(d.finishedAt).toLocaleString() : "";
  return [
    `🎓 <b>${esc(BRAND.title)}</b>`,
    `🏛 ${esc(BRAND.agencyNote)}`,
    `🏫 ${esc(BRAND.org)}`,
    `━━━━━━━━`,
    `📝 ${esc(d.examName)}`,
    `👤 <b>${esc(d.candidate.fullName)}</b>`,
    d.candidate.email ? `✉️ ${esc(d.candidate.email)}` : "",
    `📞 ${esc(d.candidate.phone)}`,
    d.candidate.organization ? `🏢 ${esc(d.candidate.organization)}` : "",
    d.candidate.department ? `🎯 ${esc(d.candidate.department)}` : "",
    `🕒 ${esc(date)} · ${tm}`,
    `━━━━━━━━`,
    `✅ To'g'ri: <b>${d.correct} / ${d.total}</b>`,
    `🏅 Ball: <b>${d.score} / 100</b> (${d.percentage}%)`,
  ]
    .filter(Boolean)
    .join("\n");
}
