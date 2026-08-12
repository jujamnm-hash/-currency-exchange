# نیشانە | Nishana — تێبینی AR لەڕێی کامێرا

سیستەمێکی پڕۆفیشناڵ: کامێرای مۆبایلەکەت بخە سەر هەر شتێک، تێبینی بنووسە، و کاتێ دووبارە هەمان شوێن/شت دەبینیتەوە نوسینەکەت پیشان دەدات.

## چۆن کار دەکات

1. **جێگیرکردن** — کامێرا + GPS + ئاراستەی ئامێر + نیشانەی بینراو (dHash و پرۆفایلی ڕەنگ) پاشەکەوت دەکرێت لەگەڵ تێبینییەکە.
2. **گەڕانەوە** — کاتێ کامێراکە دەخەیتە سەر هەمان شت، سیستەم کاندیدە نزیکەکان لە داتابەیس دەعێنێت و بە هاوشێوەیی بینراو + دووری + ئاراستە دەیانپێوانێت.
3. **پیشاندان** — تێبینییەکە وەک overlay لەسەر کامێرا دەردەکەوێت.

## تەکنەلۆژیا

- **Next.js 15** (App Router) — فرۆنت و API
- **PostgreSQL** لە **Vercel Postgres / Neon**
- **Prisma** — ORM
- **PWA** — Add to Home Screen لە مۆبایل
- کامێرا (`getUserMedia`) + Geolocation + DeviceOrientation

## دامەزراندن لەسەر Vercel (سیستەم + داتابەیس)

### ١) داتابەیس

لە [Vercel Dashboard](https://vercel.com) → **Storage** → **Create Database** → **Postgres**  
یان Neon / Supabase. `DATABASE_URL` کۆپی بکە.

### ٢) پرۆژە

1. ئەم repo ـە ببەستە بە Vercel
2. Environment Variable زیاد بکە:
   ```
   DATABASE_URL=postgresql://...
   ```
3. **Deploy**

`vercel-build` خۆکارانە `prisma db push` جێبەجێ دەکات بۆ دروستکردنی خشتەکان.

### ٣) تاقیکردنەوە

- `https://YOUR-APP.vercel.app/api/health` → دەبێت `{"ok":true,"database":"connected"}` بگەڕێنێتەوە
- لە **مۆبایل** (HTTPS) بڕۆ بۆ `/scan`، مۆڵەتی کامێرا و شوێن بدە

## گەشەپێدانی local

```bash
npm install
cp .env.example .env
# DATABASE_URL بنووسە
npm run db:setup
npm run dev
```

تێبینی: کامێرا و GPS لە localhost سنووردارن؛ باشترین تاقیکردنەوە لەسەر مۆبایل بە لینکی Vercel ـە.

## API

| ڕێگا | وەسف |
|------|------|
| `GET /api/health` | پشکنینی داتابەیس |
| `GET /api/notes?deviceId=` | لیستی تێبینییەکان |
| `POST /api/notes` | دروستکردنی نیشانە |
| `POST /api/match` | گەڕان بە fingerprint + GPS |
| `DELETE /api/notes/:id?deviceId=` | سڕینەوە |

## پەڕەکان

- `/` — سەرەتا
- `/scan` — کامێرای AR
- `/notes` — لیستی تێبینییەکان

---

دروستکراوە بۆ بەکارهێنانی ڕاستەوخۆ لەسەر مۆبایل لەڕێی وێبگەڕ (PWA).
