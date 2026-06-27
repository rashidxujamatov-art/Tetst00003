import { PDFDocument, PDFFont, PDFPage, rgb, RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { DEJAVU_REGULAR_B64, DEJAVU_BOLD_B64 } from "./fonts";
import { BRAND } from "./brand";
import { computeLevel } from "./scoring";

const BLUE = rgb(0.122, 0.306, 0.475); // #1F4E79
const INK = rgb(0.043, 0.122, 0.2);
const GREY = rgb(0.35, 0.42, 0.48);
const GREEN = rgb(0.12, 0.48, 0.3);
const RED = rgb(0.7, 0.15, 0.12);
const LINE = rgb(0.84, 0.87, 0.9);

export type ReportData = {
  examName: string;
  candidate: {
    fullName: string;
    email: string | null;
    phone: string;
    gender: string | null;
    birthDate: string | null;
    organization: string | null;
    department: string | null;
  };
  total: number;
  correct: number;
  wrong: number;
  score: number;
  percentage: number;
  timeUsedSec: number;
  finishedAt: string | null;
  questions: { id: string; n: number; text: string; options: { letter: string; text: string }[]; correct: string }[];
  answers: Record<string, string>;
};

const A4 = { w: 595.28, h: 841.89 };
const M = 48;

class Doc {
  doc!: PDFDocument;
  reg!: PDFFont;
  bold!: PDFFont;
  page!: PDFPage;
  y = 0;

  async init() {
    this.doc = await PDFDocument.create();
    this.doc.registerFontkit(fontkit);
    this.reg = await this.doc.embedFont(Buffer.from(DEJAVU_REGULAR_B64, "base64"), { subset: true });
    this.bold = await this.doc.embedFont(Buffer.from(DEJAVU_BOLD_B64, "base64"), { subset: true });
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([A4.w, A4.h]);
    this.page.drawRectangle({ x: 0, y: A4.h - 6, width: A4.w, height: 6, color: BLUE });
    // Pastki kolontitul — har sahifada homiy (agentlik)
    this.page.drawLine({
      start: { x: M, y: 34 },
      end: { x: A4.w - M, y: 34 },
      thickness: 0.5,
      color: LINE,
    });
    this.page.drawText(`${BRAND.title} · ${BRAND.org}`, { x: M, y: 22, size: 8, font: this.reg, color: GREY });
    this.y = A4.h - M;
  }
  ensure(h: number) {
    if (this.y - h < M) this.newPage();
  }
  wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const words = String(text).split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }
  text(
    str: string,
    opts: { x?: number; size?: number; bold?: boolean; color?: RGB; maxW?: number; gap?: number } = {}
  ) {
    const size = opts.size ?? 11;
    const font = opts.bold ? this.bold : this.reg;
    const color = opts.color ?? INK;
    const x = opts.x ?? M;
    const maxW = opts.maxW ?? A4.w - M - x;
    const lines = this.wrap(str, font, size, maxW);
    for (const ln of lines) {
      this.ensure(size + 4);
      this.page.drawText(ln, { x, y: this.y - size, size, font, color });
      this.y -= size + (opts.gap ?? 4);
    }
  }
  hr() {
    this.ensure(10);
    this.page.drawLine({
      start: { x: M, y: this.y },
      end: { x: A4.w - M, y: this.y },
      thickness: 0.7,
      color: LINE,
    });
    this.y -= 10;
  }
  space(h = 8) {
    this.y -= h;
  }
}

function header(d: Doc, title: string, sub: string) {
  d.text(BRAND.titleUpper, { size: 11, bold: true, color: BLUE });
  d.space(1);
  d.text(BRAND.agencyNote, { size: 8.5, color: GREY });
  d.text(BRAND.org, { size: 8.5, color: GREY });
  d.space(7);
  d.text(title, { size: 16, bold: true, color: INK });
  d.text(sub, { size: 9.5, color: GREY });
  d.space(4);
  d.hr();
}

function infoRows(d: Doc, rows: [string, string][]) {
  for (const [k, v] of rows) {
    d.ensure(15);
    d.page.drawText(k + ":", { x: M, y: d.y - 11, size: 10.5, font: d.bold, color: INK });
    const lines = d.wrap(v, d.reg, 10.5, A4.w - M - (M + 120));
    lines.forEach((ln, i) => {
      d.page.drawText(ln, { x: M + 120, y: d.y - 11, size: 10.5, font: d.reg, color: INK });
      if (i < lines.length - 1) d.y -= 14;
    });
    d.y -= 16;
  }
}

function candidateInfo(d: Doc, data: ReportData): [string, string][] {
  const c = data.candidate;
  return [
    ["F.I.Sh", c.fullName],
    ["Elektron pochta", c.email || "—"],
    ["Telefon", c.phone],
    ["Jins", c.gender || "—"],
    ["Tug'ilgan sana", c.birthDate || "—"],
    ["Tashkilot", c.organization || "—"],
    ["Yo'nalish", c.department || "—"],
    ["Imtihon", data.examName],
    ["Sana", data.finishedAt ? new Date(data.finishedAt).toLocaleString() : "—"],
  ];
}

// ---------- PDF 1: Javoblar varaqasi ----------
export async function buildAnswerSheet(data: ReportData): Promise<Uint8Array> {
  const d = new Doc();
  await d.init();
  header(d, "Javoblar varaqasi", "Har bir savol bo'yicha tanlangan va to'g'ri javob");

  infoRows(d, candidateInfo(d, data));
  d.space(2);
  d.text(
    `Natija: ${data.correct} / ${data.total} to'g'ri · ${data.score} ball · ${data.percentage}%`,
    { size: 12, bold: true, color: BLUE }
  );
  d.hr();

  data.questions.forEach((q) => {
    const chosen = data.answers[q.id] || null;
    const isCorrect = chosen === q.correct;
    const chosenText = chosen ? q.options.find((o) => o.letter === chosen)?.text || "" : null;
    const correctText = q.options.find((o) => o.letter === q.correct)?.text || "";

    d.ensure(40);
    d.text(`${q.n}. ${q.text}`, { size: 10.5, bold: true });
    d.space(1);
    if (chosen) {
      d.text(`Javob: ${chosen}) ${chosenText}  ${isCorrect ? "✓" : "✗"}`, {
        x: M + 12,
        size: 10,
        color: isCorrect ? GREEN : RED,
      });
    } else {
      d.text("Javob: (belgilanmagan) ✗", { x: M + 12, size: 10, color: RED });
    }
    if (!isCorrect) {
      d.text(`To'g'ri: ${q.correct}) ${correctText}`, { x: M + 12, size: 10, color: GREEN });
    }
    d.space(6);
  });

  return d.doc.save();
}

// ---------- PDF 2: Rasmiy nomzod hisoboti ----------
export async function buildOfficialReport(data: ReportData): Promise<Uint8Array> {
  const d = new Doc();
  await d.init();
  header(d, "Nomzod imtihon hisoboti", "Rasmiy natija hujjati");

  infoRows(d, candidateInfo(d, data));
  d.hr();

  d.text("Yakuniy natija", { size: 13, bold: true, color: BLUE });
  d.space(4);
  const res: [string, string][] = [
    ["Savollar soni", String(data.total)],
    ["To'g'ri javoblar", String(data.correct)],
    ["Xato javoblar", String(data.wrong)],
    ["Foiz", `${data.percentage}%`],
    ["Yakuniy ball (100)", String(data.score)],
    ["Daraja", computeLevel(data.percentage).name],
    ["Sarflangan vaqt", `${Math.floor(data.timeUsedSec / 60)} daqiqa ${data.timeUsedSec % 60} soniya`],
  ];
  infoRows(d, res);

  d.space(30);
  d.hr();
  d.space(20);
  // Imzo joyi
  d.ensure(60);
  const colW = (A4.w - 2 * M - 30) / 2;
  d.page.drawText("Imtihon mas'uli:", { x: M, y: d.y - 11, size: 10.5, font: d.bold, color: INK });
  d.page.drawText("Sana:", { x: M + colW + 30, y: d.y - 11, size: 10.5, font: d.bold, color: INK });
  d.y -= 44;
  d.page.drawLine({ start: { x: M, y: d.y }, end: { x: M + colW, y: d.y }, thickness: 0.7, color: LINE });
  d.page.drawLine({
    start: { x: M + colW + 30, y: d.y },
    end: { x: A4.w - M, y: d.y },
    thickness: 0.7,
    color: LINE,
  });
  d.y -= 12;
  d.page.drawText("(imzo / F.I.Sh)", { x: M, y: d.y, size: 8.5, font: d.reg, color: GREY });

  return d.doc.save();
}
