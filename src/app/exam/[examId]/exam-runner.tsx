"use client";

import { useEffect, useRef, useState } from "react";
import { computeLevel } from "@/lib/scoring";

type Opt = { letter: string; text: string };
type Q = { id: string; n: number; text: string; options: Opt[] };
type Result = {
  total: number;
  correct: number;
  wrong: number;
  score: number;
  percentage: number;
};

export default function ExamRunner({
  examId,
  examName,
  numQuestions,
  durationMin,
  direction,
  ready,
}: {
  examId: string;
  examName: string;
  numQuestions: number;
  durationMin: number;
  direction: string;
  ready: boolean;
}) {
  const [phase, setPhase] = useState<"form" | "exam" | "done">("form");

  // forma
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [organization, setOrganization] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // imtihon
  const [attemptId, setAttemptId] = useState("");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const startRef = useRef(0);
  const endRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  // natija
  const [result, setResult] = useState<Result | null>(null);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const phoneDigits = phone.replace(/[^\d]/g, "");
    if (!fullName.trim()) return setErr("F.I.Sh kiriting.");
    if (!emailOk) return setErr("To'g'ri elektron pochta kiriting.");
    if (phoneDigits.length < 7 || phoneDigits.length > 15)
      return setErr("Telefon raqamini to'g'ri kiriting (masalan +998 90 123 45 67).");
    if (!gender) return setErr("Jinsni tanlang.");
    if (!birthDate) return setErr("Tug'ilgan sanani kiriting.");
    setBusy(true);
    const res = await fetch(`/api/exams/${examId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, phone, gender, birthDate, organization }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return setErr(d.error || "Imtihonni boshlab bo'lmadi.");
    }
    const data = await res.json();
    setAttemptId(data.attemptId);
    setQuestions(data.questions);
    startRef.current = Date.now();
    endRef.current = Date.now() + data.durationMin * 60000;
    setPhase("exam");
  }

  // taymer
  useEffect(() => {
    if (phase !== "exam") return;
    tickRef.current = setInterval(() => {
      const s = Math.max(0, Math.round((endRef.current - Date.now()) / 1000));
      setLeft(s);
      if (s <= 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        submit(true);
      }
    }, 250);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // sahifani yopishdan ogohlantirish
  useEffect(() => {
    function onUnload(e: BeforeUnloadEvent) {
      if (phase === "exam") {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [phase]);

  function choose(qid: string, letter: string) {
    setAnswers((a) => ({ ...a, [qid]: letter }));
  }

  async function submit(auto = false) {
    if (submittingRef.current) return;
    const answered = Object.keys(answers).length;
    if (!auto && answered < questions.length) {
      if (!confirm(`${questions.length - answered} ta savol belgilanmagan. Yakunlaysizmi?`)) return;
    }
    submittingRef.current = true;
    if (tickRef.current) clearInterval(tickRef.current);
    const timeUsedSec = Math.round((Date.now() - startRef.current) / 1000);
    const res = await fetch(`/api/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, timeUsedSec }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setResult(data);
      setPhase("done");
    } else {
      alert(data.error || "Yakunlashda xatolik");
      submittingRef.current = false;
    }
  }

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const answeredCount = Object.keys(answers).length;

  // ----- FORMA -----
  if (phase === "form") {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <form
          onSubmit={start}
          className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-brand" />
            <span className="font-bold text-brand">Xalqaro standartlarga mos ta'lim</span>
          </div>
          <h1 className="text-xl font-bold">{examName}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {numQuestions} savol · {durationMin} daqiqa. Boshlangach vaqt to'xtamaydi.
          </p>

          {!ready && (
            <p className="mt-4 text-sm text-red-600">
              Bu imtihon hozircha tayyor emas (bankда yetarli savol yo'q). Tashkilotchiga murojaat
              qiling.
            </p>
          )}

          <label className="block text-sm font-semibold mb-1 mt-5">F.I.Sh *</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="Familiya Ism Sharif" />

          <label className="block text-sm font-semibold mb-1 mt-4">Elektron pochta *</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="ism@example.com" />

          <label className="block text-sm font-semibold mb-1 mt-4">Telefon raqami *</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="+998 90 123 45 67" />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1 mt-4">Jins *</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand">
                <option value="">Tanlang…</option>
                <option>Erkak</option>
                <option>Ayol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 mt-4">Tug'ilgan sana *</label>
              <input value={birthDate} onChange={(e) => setBirthDate(e.target.value)} type="date"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand" />
            </div>
          </div>

          <label className="block text-sm font-semibold mb-1 mt-4">Tashkilot / texnikum</label>
          <input value={organization} onChange={(e) => setOrganization(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="masalan: Samarqand shahar 4-son texnikumi" />

          <label className="block text-sm font-semibold mb-1 mt-4">Yo'nalish</label>
          <input value={direction} readOnly
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-100 text-slate-600 cursor-not-allowed" />
          <p className="text-xs text-slate-400 mt-1">Yo'nalish imtihonга qarab avtomatik belgilanadi.</p>

          {err && <p className="text-sm text-red-600 mt-3">{err}</p>}
          <button disabled={busy || !ready}
            className="mt-5 w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-600 transition disabled:opacity-60">
            {busy ? "Boshlanmoqda…" : "Imtihonni boshlash"}
          </button>
        </form>
      </main>
    );
  }

  // ----- IMTIHON -----
  if (phase === "exam") {
    const q = questions[idx];
    return (
      <main className="min-h-screen pb-24">
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-slate-500">
              Savol <b className="text-slate-800">{idx + 1}</b> / {questions.length} · Belgilangan:{" "}
              {answeredCount}
            </div>
            <div
              className={`font-mono font-bold text-lg px-3 py-1 rounded-lg border ${
                left <= 60 ? "text-red-600 border-red-300 bg-red-50" : "border-slate-200 bg-white"
              }`}
            >
              {mm}:{ss}
            </div>
          </div>
          <div className="h-1.5 bg-slate-100">
            <div className="h-full bg-brand transition-all"
              style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="font-semibold text-lg">
              <span className="text-brand mr-1">{idx + 1}.</span>
              {q.text}
            </div>
            <div className="mt-4 space-y-2">
              {q.options.map((o) => {
                const sel = answers[q.id] === o.letter;
                return (
                  <label key={o.letter}
                    className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                      sel ? "border-brand bg-brand-50" : "border-slate-200 hover:border-brand"
                    }`}>
                    <input type="radio" name={q.id} checked={sel}
                      onChange={() => choose(q.id, o.letter)} className="mt-1 accent-[#1F4E79]" />
                    <span><b className="text-brand mr-1">{o.letter})</b>{o.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 font-semibold text-slate-700 disabled:opacity-40">
              ← Oldingi
            </button>
            {idx < questions.length - 1 ? (
              <button onClick={() => setIdx((i) => Math.min(questions.length - 1, i + 1))}
                className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-600">
                Keyingi →
              </button>
            ) : (
              <button onClick={() => submit(false)}
                className="rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white hover:bg-green-800">
                Yakunlash
              </button>
            )}
          </div>

          {/* tezkor navigatsiya */}
          <div className="mt-6 flex flex-wrap gap-2">
            {questions.map((qq, i) => (
              <button key={qq.id} onClick={() => setIdx(i)}
                className={`h-8 w-8 rounded-md text-sm font-semibold border ${
                  i === idx ? "border-brand text-brand"
                    : answers[qq.id] ? "bg-brand text-white border-brand"
                    : "bg-white text-slate-500 border-slate-200"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ----- NATIJA -----
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-7 shadow-sm text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-green-700 text-white grid place-items-center text-2xl">
          ✓
        </div>
        <h1 className="text-xl font-bold mt-4">Imtihon yakunlandi</h1>
        <p className="text-slate-500 mt-1">{fullName}</p>

        {result && (
          <div className="mt-5 grid grid-cols-2 gap-3 text-left">
            <Stat k="Ball (100)" v={String(result.score)} big />
            <Stat k="Foiz" v={`${result.percentage}%`} big />
            <Stat k="To'g'ri" v={`${result.correct} / ${result.total}`} />
            <Stat k="Daraja" v={computeLevel(result.percentage).name} />
          </div>
        )}

        <p className="text-xs text-slate-400 mt-6">
          Natija tashkilotchiga yuborildi.
        </p>
        <p className="text-[11px] text-slate-400 mt-3 border-t border-slate-100 pt-3">
          Oliy ta'lim vazirligi qoshidagi Kasbiy ta'lim agentligi ko'magida
        </p>
      </div>
    </main>
  );
}

function Stat({ k, v, big }: { k: string; v: string; big?: boolean }) {
  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <div className="text-xs text-slate-500">{k}</div>
      <div className={`font-mono font-bold ${big ? "text-2xl" : "text-lg"}`}>{v}</div>
    </div>
  );
}
