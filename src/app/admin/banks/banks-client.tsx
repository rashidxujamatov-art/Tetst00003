"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Bank = {
  id: string;
  name: string;
  skill: string | null;
  count: number;
  createdAt: string;
};

export default function BanksClient({ banks }: { banks: Bank[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function createBank(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const res = await fetch("/api/banks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, skill }),
    });
    setBusy(false);
    if (res.ok) {
      setName("");
      setSkill("");
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error || "Xatolik");
    }
  }

  async function deleteBank(id: string, bankName: string) {
    if (!confirm(`"${bankName}" banki va undagi barcha savollar o'chiriladi. Davom etasizmi?`)) return;
    const res = await fetch(`/api/banks/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "O'chirib bo'lmadi");
    }
  }

  return (
    <div className="mt-6">
      {/* Yangi bank */}
      <form
        onSubmit={createBank}
        className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Bank nomi *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="masalan: CNC Milling Skill 07"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Kasb / skill (ixtiyoriy)</label>
          <input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="masalan: Skill 07"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button
          disabled={busy}
          className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-600 transition disabled:opacity-60"
        >
          {busy ? "..." : "Bank yaratish"}
        </button>
        {err && <p className="text-sm text-red-600 sm:col-span-3">{err}</p>}
      </form>

      {/* Banklar ro'yxati */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {banks.length === 0 && (
          <p className="text-slate-400 text-sm">Hali bank yo'q. Yuqoridan birinchisini yarating.</p>
        )}
        {banks.map((b) => (
          <div key={b.id} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{b.name}</div>
                {b.skill && <div className="text-xs text-slate-400 mt-0.5">{b.skill}</div>}
                <div className="text-sm text-slate-500 mt-2">
                  Savollar: <b>{b.count}</b>
                </div>
              </div>
              <button
                onClick={() => deleteBank(b.id, b.name)}
                className="text-sm text-red-600 hover:underline"
              >
                O'chirish
              </button>
            </div>
            <a
              href={`/admin/banks/${b.id}`}
              className="mt-4 inline-block rounded-lg bg-brand-50 px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-50"
            >
              Ochish / savol yuklash →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
