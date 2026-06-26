# WorldSkills Test Platform — Modul 1 (Setup + Admin login)

Bu — to'liq platformaning **1-moduli**: Next.js loyiha + PostgreSQL (Prisma) + xavfsiz
**admin login** tizimi. Ishlaganini tasdiqlagach, 2-modul (Excel'dan savol import) qo'shamiz.

## Bu modulda nima bor
- Admin login (email + parol, JWT cookie, parol bcrypt bilan shifrlangan)
- `/admin/*` sahifalar himoyalangan (kirmasdan ochilmaydi)
- Boshqaruv paneli (dashboard) — statistika joylari (hozircha 0)
- Butun ma'lumotlar bazasi sxemasi (keyingi modullar uchun tayyor)

---

## Ishga tushirish (qadam-baqadam, terminalsiz)

### 1. Bepul PostgreSQL — Neon
1. **neon.tech** ga kiring (GitHub bilan ro'yxatdan o'ting).
2. **New Project** → nom bering → **Create**.
3. **Connection string** ni nusxalang (shunday ko'rinadi:
   `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`).
   Bu — sizning `DATABASE_URL`.

### 2. Loyihani GitHubga yuklash
1. `ws-platform.zip` ni kompyuterда **oching (extract)**.
2. GitHubда **yangi repository** yarating (masalan `ws-platform`).
3. Ochilgan papka **ichidagi hamma narsani** GitHubга yuklang
   (`src`, `prisma`, `package.json`, `next.config.mjs`, va h.k.).
   - **node_modules** va **.next** YUKLANMAYDI (arxivда yo'q ham).
   - Ko'p papka bo'lgani uchun eng oson yo'l — **GitHub Desktop** (desktop.github.com)
     dasturi: papkani tanlab "Publish" bosasiz. Yoki web orqali "Upload files" ga
     papka ichidagilarni sudrab tashlaysiz.

### 3. Vercelga import + sozlamalar
1. **vercel.com → Add New → Project** → `ws-platform` ni **Import**.
2. **Environment Variables** ga quyidagilarni qo'shing (Key = nom, Value = qiymat):

| Key | Value (namuna) |
|---|---|
| `DATABASE_URL` | Neon'dan olingan connection string |
| `JWT_SECRET` | uzun tasodifiy satr (masalan 32+ belgi) |
| `ADMIN_EMAIL` | `admin@texnikum.uz` |
| `ADMIN_PASSWORD` | o'zingiz tanlagan kuchli parol |
| `SETUP_SECRET` | tasodifiy maxfiy kalit (faqat siz bilasiz) |

> `JWT_SECRET` va `SETUP_SECRET` uchun istalgan uzun tasodifiy matn yozing.

3. **Deploy** bosing. Vercel avtomatik: `prisma generate` → `prisma db push`
   (bazada jadvallarni yaratadi) → `next build`. 1-2 daqiqa.

### 4. Birinchi adminni yaratish (bir marta)
Deploy tugagach, brauzerда shu manzilni oching (SETUP_SECRET ni qo'yib):
```
https://SIZNING-DOMEN.vercel.app/api/setup?secret=SETUP_SECRET_qiymati
```
- `{"ok":true,"message":"Admin yaratildi: ..."}` chiqsa — admin tayyor.
- Keyin bu havola boshqa kerak emas.

### 5. Kirish
```
https://SIZNING-DOMEN.vercel.app/admin/login
```
`ADMIN_EMAIL` va `ADMIN_PASSWORD` bilan kiring → **Boshqaruv paneli** ochilishi kerak.

---

## ✅ Muvaffaqiyat belgisi
- `/admin/login` da kira olasiz va dashboard ochiladi.
- Kirmasdan `/admin/dashboard` ni ochsangiz — login sahifasiga qaytaradi.

Shu ishlasa — menга ayting, **2-modul (Excel'dan savol import + savol banki)** ga o'tamiz.

---

## Eslatma (texnik)
- Kod TypeScript bilan tekshirildi (0 xato). To'liq build Vercelда bajariladi.
- Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) keyingi modullarда ishlatiladi —
  hozir qo'shsangiz ham bo'ladi, oldingi botingiz tokeni mos keladi.
- Parollar bcrypt bilan shifrlanadi; sessiya JWT (httpOnly cookie) orqali.
