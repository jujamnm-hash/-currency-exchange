# هەیکەلی ئیداری | سیستەمی ڕێکخستنی کارمەندان

سیستەمێک بۆ دروستکردن و ڕێکخستنی کارمەندان، هەیکەلی ئیداری، پۆستەکان و مارکێتەکان.

## تایبەتمەندییەکان

- **کارمەندان**: زیادکردن، دەستکاری، گەڕان، سڕینەوە
- **مارکێتەکان**: ناوی مارکێت زیاد بکە و کارمەندیان دابەش بکە
- **هەیکەلی ئیداری**: بەش و ژێربەشی ئیداری بە شێوەی دار دروست بکە
- **پۆستەکان**: پۆست و پلەکان پێناسە بکە
- **نەخشەی ڕێکخستن**: بینینی هەیکەلی سەرپەرشتیاری
- **داشبۆرد**: پوختەی ژمارەی کارمەند بەپێی مارکێت و بەش

## 🌐 لینکی ئەپ (لەسەر Vercel)

**https://heikali-edari.vercel.app**

بڕۆ بۆ: https://heikali-edari.vercel.app/dashboard

داتابەیس: **Neon Postgres** لەسەر Vercel (داتا لە سێرڤەر پاشەکەوت دەبێت).

## دامەزراندن لەسەر Vercel

### خێراترین ڕێگا (یەک کلیک)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjujamnm-hash%2F-currency-exchange&project-name=org-structure&framework=nextjs)

1. کلیک لە دوگمەکە بکە
2. حسابی Vercel / GitHub هەڵبژێرە
3. **Deploy** بکە — پێویست بە داتابەیس ناکات

### یان لە Vercel Dashboard

1. بڕۆ بۆ [vercel.com/new](https://vercel.com/new)
2. Repositoryی `-currency-exchange` هەڵبژێرە
3. Build Command: `npm run vercel-build`
4. Deploy

دوای دامەزراندن لینکێکی وەک `https://org-structure.vercel.app` دەستت دەکەوێت.

## بەکارهێنان لە Local

```bash
npm install
npm run dev
```

بڕۆ بۆ: http://localhost:3000

داتاکان لەسەر ئامێرەکەت پاشەکەوت دەبن (localStorage) — پێویست بە داتابەیس ناکات بۆ کارکردنی ئاسایی.

## داتابەیس (ئارەزوومەندانە — Vercel)

ئەگەر PostgreSQL دەتەوێت:

```bash
cp .env.example .env
# DATABASE_URL بنووسە
npm run db:setup
```

## پێکهاتە

```
src/app/
  dashboard/     # داشبۆرد
  employees/     # کارمەندان
  markets/       # مارکێتەکان
  structure/     # هەیکەلی ئیداری
  positions/     # پۆستەکان
  org-chart/     # نەخشەی ڕێکخستن
  settings/      # ڕێکخستنەکان
```

## تەکنەلۆژیا

- Next.js 15 · React 19 · Tailwind · Prisma · TypeScript · PWA · RTL Kurdish
