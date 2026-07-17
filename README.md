# 🚗 غەسلی هەولێر | Ghassle Hawler Car Wash System

سیستەمێکی تەواوی بەڕێوەبردنی غەسلی سەیارە بە ستانداردی جیهانی، گونجاو بۆ مۆبایل و ئامادە بۆ دامەزراندن لەسەر Vercel.

## ✨ تایبەتمەندییەکان

### بەڕێوەبردنی داواکاری
- زیادکردنی داواکاری نوێ بە خێرایی
- ڕیزی چاوەڕوانی بە شوێنکەوتنی قۆناغەکان
- ٨ قۆناغی ستاندارد: چاوەڕوانی → تۆمار → غەسڵ → وشککردن → وردەکاری → پشکنین → ئامادە → تەواو

### خزمەتگوزارییەکان
- ٨ جۆری خزمەتگوزاری (سادە، تەواو، پڕیمیەم، ناوەوە، واکس، ئەنجام، ژێرەوە، پەنجەرە)
- ٥ زیادەی داخڵ (بۆنخۆش، تایەر، داشبۆرد، ئارۆما، قاپ)
- نرخی جیاواز بەپێی جۆری سەیارە (سەدان، SUV، بارهەڵگر، ڤان، ماتۆرسکیل، لوکس)

### کڕیار و ئەندامێتی
- تۆمارکردنی کڕیار و سەیارەکان
- سیستەمی خاڵی دڵسۆزی
- پلانی ئەندامێتی مانگانە

### کات و ڕاپۆرت
- بەڕێوەبردنی کاتی پێشوەختە
- ڕاپۆرتی داهات (ڕۆژانە، هەفتانە، مانگانە)
- شیکردنەوەی خزمەتگوزاری و جۆری سەیارە

### مۆبایل و PWA
- دیزاینی Mobile-First
- دەتوانیت وەک ئەپ لە Home Screen دابنێیت
- ناوچەی خوارەوەی گەڕان بۆ مۆبایل

---

## 🚀 دامەزراندنی یەک-کلیک لەسەر Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjujamnm-hash%2F-currency-exchange&project-name=ghassle-hawler&env=DATABASE_URL&envDescription=PostgreSQL%20connection%20string%20from%20Vercel%20Postgres%20or%20Neon)

### هەنگاوەکانی خێرا (٣ خولەک):

1. **کلیک لە دوگمەی سەرەوە بکە** → Vercel پڕۆژەکە import دەکات
2. **Storage زیاد بکە:** Vercel Dashboard → Storage → **Create Database** → **Postgres** → Connect to Project
3. **Deploy** بکە — داتابەیس خۆکار ڕێکدەخرێت
4. بڕۆ بۆ: `https://your-app.vercel.app/setup` — دڵنیابە لە ئامادەیی
5. **مۆبایل:** لینکەکە لە وێبگەڕ بکەرەوە → Add to Home Screen

### دوای دامەزراندن

| پەڕە | لینک |
|------|------|
| داشبۆرد | `/dashboard` |
| ڕێکخستن | `/setup` |
| داواکاری نوێ | `/new-order` |

---

## 🚀 دامەزراندن لەسەر Vercel (وردەکاری)

### هەنگاو ١: داتابەیس دروست بکە

لە [Vercel Dashboard](https://vercel.com) → Storage → Create Database → **Postgres**

یان لە [Neon](https://neon.tech) / [Supabase](https://supabase.com) داتابەیسێکی بەخۆڕایی دروست بکە.

### هەنگاو ٢: پڕۆژەکە بەرز بکەرەوە

1. ئەم repository ـە بەرز بکەرەوە بۆ GitHub
2. بڕۆ بۆ [vercel.com/new](https://vercel.com/new)
3. Repository هەڵبژێرە
4. لە **Environment Variables** زیاد بکە:
   ```
   DATABASE_URL=postgresql://...
   ```
5. کلیک لە **Deploy** بکە

### هەنگاو ٣: داتابەیس ڕێکبخە

دوای دامەزراندن، لە Vercel Terminal یان لە local:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## 💻 گەشەپێدان لە Local

```bash
# دامەزراندنی پاکێجەکان
npm install

# ڕێکخستنی .env
cp .env.example .env
# DATABASE_URL بنووسە

# داتابەیس
npm run db:setup

# دەستپێکردن
npm run dev
```

بڕۆ بۆ: http://localhost:3000

---

## 📱 بەکارهێنان وەک ئەپ لە مۆبایل

1. لینکی Vercel لە وێبگەڕی مۆبایل بکەرەوە
2. **iOS**: Share → Add to Home Screen
3. **Android**: Menu → Add to Home Screen / Install App

---

## 🗂️ پێکهاتەی پڕۆژە

```
ghassle-hawler/
├── prisma/
│   ├── schema.prisma    # مۆدێلی داتابەیس
│   └── seed.ts          # داتای سەرەتایی
├── public/
│   ├── manifest.json    # PWA
│   └── icon.svg
├── src/
│   ├── app/
│   │   ├── api/         # API Routes
│   │   ├── dashboard/   # داشبۆرد
│   │   ├── queue/       # ڕیز
│   │   ├── new-order/   # داواکاری نوێ
│   │   ├── customers/   # کڕیارەکان
│   │   ├── appointments/# کاتەکان
│   │   ├── services/    # خزمەتگوزارییەکان
│   │   ├── reports/     # ڕاپۆرت
│   │   └── settings/    # ڕێکخستن
│   ├── components/
│   └── lib/
└── vercel.json
```

---

## 🔧 تەکنەلۆژیا

- **Next.js 15** - React Framework
- **Prisma** - ORM بۆ داتابەیس
- **PostgreSQL** - داتابەیس
- **Tailwind CSS** - ستایل
- **TypeScript** - جۆری پارێزراو
- **PWA** - ئەپ لە مۆبایل

---

## 📞 زانیاری دوکان (سەرەتایی)

- **ناو:** غەسلی هەولێر
- **ناونیشان:** هەولێر، کوردستان
- **کاتەکانی کار:** 08:00 - 22:00
- **دراو:** دیناری عێراقی (IQD)

---

دروستکراوە بە ❤️ بۆ غەسلی هەولێر
