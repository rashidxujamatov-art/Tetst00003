// Massivdan n ta takrorlanmas elementni tasodifiy tanlaydi (Fisher–Yates).
export function pickRandom<T>(arr: T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, Math.min(n, a.length)));
}

// Variantlarni aralashtirib, har biriga harf (A/B/C/D) beradi.
export function shuffleOptions(opts: string[]): { letter: string; text: string }[] {
  const letters = ["A", "B", "C", "D", "E", "F"];
  const a = opts.map((text, i) => ({ text, _i: i }));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.map((o, i) => ({ letter: letters[i], text: o.text }));
}
