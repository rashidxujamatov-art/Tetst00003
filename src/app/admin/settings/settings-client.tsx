"use client";

import { useState } from "react";

export default function SettingsClient({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function sendTest() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/telegram/test", { method: "POST" });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      setOk(true);
      setMsg("✓ Sinov xabari yuborildi. Telegram kanalingizni tekshiring.");
    } else {
      setOk(false);
      setMsg(d.error || "Yuborilmadi.");
    }
  }

  return (
    <div className="mt-5">
      <button
        onClick={sendTest}
        disabled={busy || !configured}
        className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-600 transition disabled:opacity-50"
      >
        {busy ? "Yuborilmoqda…" : "Test xabar yuborish"}
      </button>
      {msg && (
        <p className={`mt-3 text-sm ${ok ? "text-green-700" : "text-red-600"}`}>{msg}</p>
      )}
    </div>
  );
}
