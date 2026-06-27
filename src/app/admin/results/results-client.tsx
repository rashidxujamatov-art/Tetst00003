"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = {
  id: string;
  name: string;
  email: string;
  phone: string;
  org: string;
  examName: string;
  score: number;
  percentage: number;
  correct: number;
  total: number;
  finishedAt: string;
};

export default function ResultsClient({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s) ||
        r.org.toLowerCase().includes(s) ||
        r.examName.toLowerCase().includes(s)
    );
  }, [q, rows]);

  async function deleteRow(id: string, name: string) {
    if (!confirm(`"${name}" natijasi o'chirilsinmi?`)) return;
    const res = await fetch(`/api/attempts/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("O'chirib bo'lmadi");
  }

  async function clearAll() {
    if (
      !confirm(
        "Barcha natijalar va ishtirokchilar o'chiriladi. Savollar, banklar va imtihonlar saqlanadi. Davom etasizmi?"
      )
    )
      return;
    if (!confirm("Bu amalni ortga qaytarib bo'lmaydi. Aniq tozalaysizmi?")) return;
    setBusy(true);
    const res = await fetch("/api/results/clear", { method: "POST" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Tozalab bo'lmadi");
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Qidiruv: F.I.Sh, pochta, telefon, tashkilot yoki imtihon…"
          className="w-full sm:max-w-md rounded-lg border border-slate-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {rows.length > 0 && (
          <button
            onClick={clearAll}
            disabled={busy}
            className="rounded-lg border border-red-300 text-red-700 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-red-50 disabled:opacity-50"
          >
            {busy ? "Tozalanmoqda…" : "Barchasini tozalash"}
          </button>
        )}
      </div>

      <div className="mt-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-semibold">F.I.Sh</th>
                <th className="px-4 py-3 font-semibold">Telefon</th>
                <th className="px-4 py-3 font-semibold">Imtihon</th>
                <th className="px-4 py-3 font-semibold text-center">Ball</th>
                <th className="px-4 py-3 font-semibold text-center">%</th>
                <th className="px-4 py-3 font-semibold text-center">To'g'ri</th>
                <th className="px-4 py-3 font-semibold">Sana</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Natija topilmadi.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{r.examName}</td>
                  <td className="px-4 py-3 text-center font-mono font-bold">{r.score}</td>
                  <td className="px-4 py-3 text-center font-mono">{r.percentage}%</td>
                  <td className="px-4 py-3 text-center">
                    {r.correct}/{r.total}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.finishedAt ? new Date(r.finishedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a href={`/admin/results/${r.id}`} className="text-brand font-semibold hover:underline">
                      Ko'rish →
                    </a>
                    <button
                      onClick={() => deleteRow(r.id, r.name)}
                      className="ml-3 text-red-600 font-semibold hover:underline"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
