"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Bank = { id: string; name: string; count: number };
type Exam = {
  id: string;
  name: string;
  bankName: string;
  numQuestions: number;
  durationMin: number;
  attempts: number;
};

export default function ExamsClient({ banks, exams }: { banks: Bank[]; exams: Exam[] }) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [name, setName] = useState("");
  const [bankId, setBankId] = useState("");
  const [num, setNum] = useState("");
  const [dur, setDur] = useState("45");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => setOrigin(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin), []);

  const selectedBank = banks.find((b) => b.id === bankId);

  async function createExam(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bankId, numQuestions: num, durationMin: dur }),
    });
    setBusy(false);
    if (res.ok) {
      setName("");
      setNum("");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Xatolik");
    }
  }

  async function deleteExam(id: string, n: string) {
    if (!confirm(`"${n}" imtihoni o'chirilsinmi?`)) return;
    const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "O'chirib bo'lmadi");
    }
  }

  function copyLink(id: string) {
    const link = `${origin}/exam/${id}`;
    navigator.clipboard?.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div className="mt-6">
      {banks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-5 text-slate-500 text-sm">
          Avval <b>Savol banklari</b> bo'limidan bank yarating va savol yuklang, keyin imtihon
          yaratasiz.
        </div>
      ) : (
        <form
          onSubmit={createExam}
          className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold mb-1">Imtihon nomi *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="masalan: CNC Milling — Bazaviy test"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Savol banki *</label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="">Tanlang…</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.count} savol)
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Savollar soni *</label>
              <input
                type="number"
                min={1}
                max={selectedBank?.count || undefined}
                value={num}
                onChange={(e) => setNum(e.target.value)}
                placeholder={selectedBank ? `1–${selectedBank.count}` : "30"}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Vaqt (daqiqa) *</label>
              <input
                type="number"
                min={1}
                value={dur}
                onChange={(e) => setDur(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
          <div className="sm:col-span-2">
            <button
              disabled={busy}
              className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-600 transition disabled:opacity-60"
            >
              {busy ? "..." : "Imtihon yaratish"}
            </button>
          </div>
        </form>
      )}

      {/* Imtihonlar ro'yxati */}
      <div className="mt-6 space-y-4">
        {exams.length === 0 && (
          <p className="text-slate-400 text-sm">Hali imtihon yo'q.</p>
        )}
        {exams.map((e) => (
          <div key={e.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{e.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  Bank: {e.bankName} · {e.numQuestions} savol · {e.durationMin} daqiqa · Urinishlar:{" "}
                  {e.attempts}
                </div>
              </div>
              <button
                onClick={() => deleteExam(e.id, e.name)}
                className="text-sm text-red-600 hover:underline shrink-0"
              >
                O'chirish
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <code className="text-xs bg-slate-100 rounded-lg px-3 py-2 break-all">
                {origin}/exam/{e.id}
              </code>
              <button
                onClick={() => copyLink(e.id)}
                className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-semibold text-brand"
              >
                {copied === e.id ? "Nusxalandi ✓" : "Havolani nusxalash"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Nomzodlar uchun bu havola 4-modulда (imtihon oqimi) faollashadi.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
