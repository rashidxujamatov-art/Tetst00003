import * as XLSX from "xlsx";

export type ParsedQuestion = {
  number: number | null;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: "A" | "B" | "C" | "D";
};

export type ParseResult =
  | { ok: true; questions: ParsedQuestion[] }
  | { ok: false; errors: string[] };

/**
 * Kutilgan ustunlar: №, Savol, A, B, C, D, To'g'ri javob
 * Birinchi qator sarlavha bo'lsa avtomatik tashlanadi.
 */
export function parseQuestionsXlsx(buf: ArrayBuffer): ParseResult {
  let wb: XLSX.WorkBook;
  try {
    wb = XLSX.read(buf, { type: "array" });
  } catch {
    return { ok: false, errors: ["Faylni o'qib bo'lmadi. .xlsx formatда yuklang."] };
  }
  const sheetName = wb.SheetNames[0];
  const sheet = sheetName ? wb.Sheets[sheetName] : null;
  if (!sheet) return { ok: false, errors: ["Faylда varaq topilmadi."] };

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  if (rows.length === 0) return { ok: false, errors: ["Fayl bo'sh."] };

  // sarlavha qatorini aniqlash
  let start = 0;
  const first = (rows[0] as unknown[]).map((c) => String(c).toLowerCase());
  if (first.some((c) => c.includes("savol") || c.includes("question"))) start = 1;

  const out: ParsedQuestion[] = [];
  const errors: string[] = [];

  for (let i = start; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    const excelRow = i + 1;
    const text = String(r[1] ?? "").trim();
    const a = String(r[2] ?? "").trim();
    const b = String(r[3] ?? "").trim();
    const c = String(r[4] ?? "").trim();
    const d = String(r[5] ?? "").trim();
    const correctRaw = String(r[6] ?? "").trim().toUpperCase();

    // butunlay bo'sh qatorni o'tkazib yuborish
    if (!text && !a && !b && !c && !d && !correctRaw) continue;

    const rowErr: string[] = [];
    if (!text) rowErr.push("savol matni yo'q");
    if (!a || !b || !c || !d) rowErr.push("A/B/C/D variantlaridan biri bo'sh");
    if (!["A", "B", "C", "D"].includes(correctRaw))
      rowErr.push(`to'g'ri javob A/B/C/D bo'lishi kerak (hozir: "${String(r[6] ?? "")}")`);

    if (rowErr.length) {
      errors.push(`${excelRow}-qator: ${rowErr.join(", ")}`);
      continue;
    }

    const numVal = Number(r[0]);
    out.push({
      number: Number.isFinite(numVal) && String(r[0]).trim() !== "" ? numVal : null,
      text,
      optionA: a,
      optionB: b,
      optionC: c,
      optionD: d,
      correct: correctRaw as "A" | "B" | "C" | "D",
    });
  }

  if (errors.length) return { ok: false, errors: errors.slice(0, 50) };
  if (out.length === 0)
    return {
      ok: false,
      errors: ["Savol topilmadi. Ustunlar: №, Savol, A, B, C, D, To'g'ri javob."],
    };
  return { ok: true, questions: out };
}
