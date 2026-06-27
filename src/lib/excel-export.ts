import ExcelJS from "exceljs";
import { computeLevel } from "./scoring";
import { BRAND } from "./brand";

export type ResultRow = {
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  organization: string;
  department: string;
  examName: string;
  total: number;
  correct: number;
  wrong: number;
  percentage: number;
  score: number;
  finishedAt: string | null;
};

// Ranglar
const BRAND_HEX = "FF1F4E79";
const HEAD_TEXT = "FFFFFFFF";
const BORDER = "FFD7DEE7";
const ZEBRA = "FFF4F7FB";
const LEVEL_FILL: Record<string, { fill: string; font: string }> = {
  A: { fill: "FFDDEBF7", font: "FF1F4E79" },
  B: { fill: "FFFCEFC7", font: "FF8A6D00" },
  C: { fill: "FFD8EFDD", font: "FF1F7A4D" },
  "—": { fill: "FFEFEFEF", font: "FF777777" },
};

const COLS: { header: string; width: number; key: string }[] = [
  { header: "№", width: 5, key: "n" },
  { header: "F.I.Sh", width: 26, key: "fullName" },
  { header: "Elektron pochta", width: 26, key: "email" },
  { header: "Telefon", width: 18, key: "phone" },
  { header: "Jins", width: 8, key: "gender" },
  { header: "Tug'ilgan sana", width: 14, key: "birthDate" },
  { header: "Tashkilot", width: 26, key: "organization" },
  { header: "Yo'nalish", width: 22, key: "department" },
  { header: "Imtihon", width: 24, key: "examName" },
  { header: "Savollar", width: 10, key: "total" },
  { header: "To'g'ri", width: 9, key: "correct" },
  { header: "Xato", width: 8, key: "wrong" },
  { header: "Foiz", width: 9, key: "percentage" },
  { header: "Ball (100)", width: 11, key: "score" },
  { header: "Daraja", width: 14, key: "level" },
  { header: "Topshirilgan", width: 20, key: "finishedAt" },
];

const thin = (color: string) => ({ style: "thin" as const, color: { argb: color } });

export async function buildResultsWorkbook(rows: ResultRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = BRAND.title;
  const ws = wb.addWorksheet("Natijalar", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: { orientation: "landscape", fitToPage: true },
  });

  const lastCol = COLS.length; // 16
  const colLetter = ws.getColumn(lastCol).letter;

  // Sarlavha bloki (1–3 qatorlar)
  const titleRows: { text: string; size: number; color: string; bold: boolean }[] = [
    { text: BRAND.title, size: 16, color: BRAND_HEX, bold: true },
    { text: BRAND.agencyNote, size: 9.5, color: "FF5A6B7B", bold: false },
    { text: BRAND.org, size: 10, color: "FF0B1F33", bold: true },
  ];
  titleRows.forEach((t, i) => {
    const r = i + 1;
    ws.mergeCells(`A${r}:${colLetter}${r}`);
    const cell = ws.getCell(`A${r}`);
    cell.value = t.text;
    cell.font = { name: "Arial", size: t.size, bold: t.bold, color: { argb: t.color } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    ws.getRow(r).height = t.size + 8;
  });
  // 4-qator: natijalar jadvali sarlavhasi
  ws.mergeCells(`A4:${colLetter}4`);
  const sub = ws.getCell("A4");
  sub.value = `Ishtirokchilar natijalari jadvali · Jami: ${rows.length} · ${new Date().toLocaleString()}`;
  sub.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF5A6B7B" } };
  ws.getRow(4).height = 16;

  // 5-qator: ustun sarlavhalari
  const header = ws.getRow(5);
  COLS.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    cell.value = c.header;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: HEAD_TEXT } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_HEX } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = { top: thin(BRAND_HEX), bottom: thin(BRAND_HEX), left: thin(BORDER), right: thin(BORDER) };
  });
  header.height = 26;

  // Ma'lumot qatorlari
  rows.forEach((row, idx) => {
    const lvl = computeLevel(row.percentage);
    const values = [
      idx + 1,
      row.fullName,
      row.email || "—",
      row.phone,
      row.gender || "—",
      row.birthDate || "—",
      row.organization || "—",
      row.department || "—",
      row.examName,
      row.total,
      row.correct,
      row.wrong,
      row.percentage / 100, // foiz formati uchun
      row.score,
      lvl.code,
      row.finishedAt ? new Date(row.finishedAt).toLocaleString() : "—",
    ];
    const r = ws.addRow(values);
    r.height = 20;
    const zebra = idx % 2 === 1;
    r.eachCell((cell, col) => {
      cell.font = { name: "Arial", size: 10, color: { argb: "FF0B1F33" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: col === 2 || col === 7 || col === 9 ? "left" : "center",
        wrapText: false,
      };
      cell.border = { top: thin(BORDER), bottom: thin(BORDER), left: thin(BORDER), right: thin(BORDER) };
      if (zebra) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
    });
    // Foiz formati
    r.getCell(13).numFmt = "0.0%";
    r.getCell(14).numFmt = "0.0";
    // Daraja katakchasi — rangli
    const lc = r.getCell(15);
    const style = LEVEL_FILL[lvl.code] || LEVEL_FILL["—"];
    lc.value = lvl.code;
    lc.font = { name: "Arial", size: 11, bold: true, color: { argb: style.font } };
    lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: style.fill } };
    lc.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Ustun kengliklari
  COLS.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.width;
  });

  // Izoh / legenda (jadval ostida)
  const legendRow = ws.addRow([]);
  const lr = legendRow.number + 1;
  ws.mergeCells(`A${lr}:${colLetter}${lr}`);
  const legend = ws.getCell(`A${lr}`);
  legend.value =
    "Daraja: A = 56–76% · B = 76–86% · C = 86% dan yuqori · 56% dan past — saralanmadi";
  legend.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF5A6B7B" } };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
