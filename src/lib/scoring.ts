// 100 ballik tizim: har bir savol = 100 / total
export function computeScore(correct: number, total: number) {
  const perQ = total > 0 ? 100 / total : 0;
  const score = Math.round(correct * perQ * 10) / 10; // 1 kasrgacha
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  return { score, percentage };
}

// Foizga qarab daraja:
//   56–76% → A,  76–86% → B,  86%+ → C,  56% dan past → Saralanmadi
export function computeLevel(percentage: number): { code: string; name: string } {
  if (percentage >= 86) return { code: "C", name: "C daraja" };
  if (percentage >= 76) return { code: "B", name: "B daraja" };
  if (percentage >= 56) return { code: "A", name: "A daraja" };
  return { code: "—", name: "Saralanmadi" };
}
