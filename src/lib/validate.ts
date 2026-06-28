// Umumiy validatsiya — ham nomzod formasi (brauzer), ham server (start route) ishlatadi.

// Telefonni O'zbekiston formatiga keltiradi: 998XXXXXXXXX (12 raqam).
// Kiritish "+998 90 123 45 67", "998901234567", "901234567" — barchasini qabul qiladi.
export function normalizeUzPhone(input: string): string | null {
  const d = (input || "").replace(/\D/g, "");
  let n = d;
  if (n.length === 9) n = "998" + n; // mahalliy format → davlat kodi qo'shiladi
  if (n.length === 12 && n.startsWith("998")) return n;
  return null;
}

// O'zbekiston raqami to'g'rimi: 998 + operator/region kodi (2–9) + 8 raqam.
export function isValidUzPhone(input: string): boolean {
  const n = normalizeUzPhone(input);
  if (!n) return false;
  return /^998[2-9]\d{8}$/.test(n);
}

// Chiroyli ko'rinish: +998 90 123 45 67
export function formatUzPhone(input: string): string {
  const n = normalizeUzPhone(input);
  if (!n) return input;
  const p = n.slice(3);
  return `+998 ${p.slice(0, 2)} ${p.slice(2, 5)} ${p.slice(5, 7)} ${p.slice(7, 9)}`;
}

export function isValidEmail(input: string): boolean {
  const s = (input || "").trim();
  return s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}
