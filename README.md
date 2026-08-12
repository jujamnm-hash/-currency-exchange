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

## 🌐 لینکی زیندوو (دامەزراوە)

**ئەپ:** https://heikali-edari-jujamnm-hashs-projects.vercel.app  

**کامێرا:** https://heikali-edari-jujamnm-hashs-projects.vercel.app/scan  

**تاقیکردنی داتابەیس:** https://heikali-edari-jujamnm-hashs-projects.vercel.app/api/health  

داتابەیس بەستراوە (`ok: true`). لە مۆبایل لینکەکە بکەرەوە → مۆڵەتی کامێرا و GPS بدە.

## دامەزراندنەوە لەسەر Vercel

1. [Vercel](https://vercel.com) → Storage → Postgres → بە پرۆژەکە ببەستە (`DATABASE_URL`)
2. Deploy بکە — خشتەکان لە یەکەم داواکاری API خۆکار دروست دەبن
3. `/api/health` بپشکنە

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
