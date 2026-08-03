# قەرزنامە | سیستەمی تۆمارکردنی قەرز بۆ ئایپاد

ئەپێکی سادە و خێرا بۆ تۆمارکردنی قەرز — گونجاو بۆ ئایپاد، کوردی (RTL)، و کاری دەکات بەبێ ئینتەرنێت دوای یەکەم بارکردن.

## تایبەتمەندییەکان

- تۆمارکردنی کەسەکان
- قەرزی «بۆ من» و «لە من»
- پارەدانی بەشی یان تەواو
- داشبۆردی باڵانس
- باکئاپ / هێنانەوەی JSON
- دامەزراندن وەک ئەپ لەسەر ئایپاد (PWA)
- ئامادە بۆ بیلدی Capacitor / Xcode

## دامەزراندن لەسەر ئایپاد (خێرا)

1. لە Safari بکەرەوە:
   `https://jujamnm-hash.github.io/-currency-exchange/dashboard/`
2. Share → **Add to Home Screen**
3. ناو: **قەرزنامە**

وردەکاری زیاتر: [`IPAD-BUILD-GUIDE.md`](./IPAD-BUILD-GUIDE.md)

## گەشەپێدان

```bash
npm install
npm run icons:generate
npm run dev
```

بڕۆ بۆ http://localhost:3000

## بیلدی static (GitHub Pages)

```bash
STATIC_EXPORT=true npm run build
```

دەرچوون لە `out/`

## بیلدی Swift ـی ڕاستەقینە (پێشنیارکراو)

پێویستی بە Mac + Xcode هەیە:

```bash
cd QarznameSwift
open Qarzname.xcodeproj
```

پاشان لە Xcode: Team → iPad → ▶️ Run  
ڕێنمایی: [`QarznameSwift/README.md`](./QarznameSwift/README.md)

## بیلدی Capacitor (وێب لەناو iOS)

```bash
npm install
npm run ios:prepare
npm run cap:open:ios
```

## تەکنەلۆژیا

- Next.js 15 (static export)
- localStorage (داتا لەسەر ئامێر)
- Capacitor 7 (iOS / iPad)
- Tailwind CSS · TypeScript

دروستکراوە بۆ تۆمارکردنی قەرز لەسەر ئایپاد.
