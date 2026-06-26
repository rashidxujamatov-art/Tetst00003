"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportClient({ bankId }: { bankId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    setMsg("");
    setErrors([]);
    if (!file) {
      setMsg("Avval .xlsx fayl tanlang.");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/banks/${bankId}/import`, { method: "POST", body: fd });
    setBusy(false);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMsg(`✓ ${data.imported} ta savol muvaffaqiyatli yuklandi.`);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } else {
      setMsg(data.error || "Yuklashda xatolik.");
      setErrors(Array.isArray(data.details) ? data.details : []);
    }
  }

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl p-5">
      <div className="font-semibold">Excel'dan savol yuklash (.xlsx)</div>
      <p className="text-sm text-slate-500 mt-1">
        Ustunlar tartibi: <b>№, Savol, A, B, C, D, To'g'ri javob</b>. To'g'ri javob A/B/C/D
        harflaridan biri bo'lishi kerak.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx"
          className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:font-semibold file:text-brand"
        />
        <button
          onClick={upload}
          disabled={busy}
          className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-600 transition disabled:opacity-60"
        >
          {busy ? "Yuklanmoqda…" : "Yuklash"}
        </button>
      </div>

      {msg && (
        <p className={`mt-3 text-sm ${msg.startsWith("✓") ? "text-green-700" : "text-red-600"}`}>
          {msg}
        </p>
      )}
      {errors.length > 0 && (
        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-3 max-h-48 overflow-auto">
          <ul className="text-sm text-red-700 list-disc pl-5 space-y-0.5">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
