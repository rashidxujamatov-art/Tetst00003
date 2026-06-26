"use client";

import { useRouter } from "next/navigation";

type Q = {
  id: string;
  index: number;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: "A" | "B" | "C" | "D";
};

export default function QuestionsClient({ questions }: { questions: Q[] }) {
  const router = useRouter();

  async function del(id: string) {
    if (!confirm("Bu savol o'chirilsinmi?")) return;
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("O'chirib bo'lmadi");
  }

  if (questions.length === 0) {
    return (
      <p className="mt-6 text-sm text-slate-400">
        Hali savol yo'q. Yuqoridan .xlsx fayl yuklang.
      </p>
    );
  }

  return (
    <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 font-semibold">
        Savollar ({questions.length})
      </div>
      <div className="divide-y divide-slate-100">
        {questions.map((q) => (
          <div key={q.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium">
                <span className="text-brand mr-1">{q.index}.</span>
                {q.text}
              </div>
              <button onClick={() => del(q.id)} className="text-sm text-red-600 hover:underline shrink-0">
                O'chirish
              </button>
            </div>
            <ul className="mt-2 text-sm text-slate-600 space-y-0.5">
              {(["A", "B", "C", "D"] as const).map((L) => {
                const val = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[L];
                const isCorrect = q.correct === L;
                return (
                  <li key={L} className={isCorrect ? "text-green-700 font-semibold" : ""}>
                    {L}) {val} {isCorrect && "✓"}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
