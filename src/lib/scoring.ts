// 100 ballik tizim: har bir savol = 100 / total
export function computeScore(correct: number, total: number) {
  const perQ = total > 0 ? 100 / total : 0;
  const score = Math.round(correct * perQ * 10) / 10; // 1 kasrgacha
  const percentage = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
  return { score, percentage };
}
