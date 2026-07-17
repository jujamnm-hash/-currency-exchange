# 📱 ڕێنمایی دامەزراندن و بیلدکردن بۆ ئایفۆن

ئەم ڕێنماییە دوو ڕێگەت پیشان دەدات بۆ بەکارهێنانی سیستەمی گۆڕینەوەی دراو لەسەر ئایفۆن:

1. **PWA (خێرا و بەخۆڕایی)** — ئێستا دەتوانیت بەکاری بهێنیت
2. **ئەپی ڕاستەقینەی App Store** — پێویستی بە Mac و Xcode هەیە

---

## 🚀 ڕێگای ١: دامەزراندن لەسەر ئایفۆن (ئێستا — بەخۆڕایی)

ئەمە خێراترین ڕێگەیە و پێویستی بە Mac نییە.

### هەنگاوەکان:

1. لە **Safari** لەسەر ئایفۆنەکەت بکەرەوە:
   ```
   https://jujamnm-hash.github.io/-currency-exchange/
   ```

2. کرتە لە دوگمەی **Share** (⬆️) بکە لە خوارەوەی شاشە

3. بڕۆ بۆ **Add to Home Screen** (زیادکردن بۆ شاشەی سەرەکی)

4. ناوەکە بگۆڕە بۆ **گۆڕینەوەی دراو** و **Add** دابگرە

5. ئێستا ئایکۆنێک لەسەر شاشەی سەرەکیت هەیە وەک ئەپێکی ڕاستەقینە!

### تایبەتمەندیەکان:
- ✅ کار دەکات بەبێ ئینتەرنێت (دوای یەکەم بارکردن)
- ✅ شێوەی standalone — وەک ئەپێکی ڕاستەقینە
- ✅ Safe area بۆ iPhone X و نوێتر
- ✅ ڕێنمایی دامەزراندن خۆکار پیشان دەدرێت

---

## 🏗️ ڕێگای ٢: بیلدکردنی ئەپی ڕاستەقینە (App Store)

بۆ بڵاوکردنەوە لە App Store، پێویستت بە ئەم شتانەیە:

| پێداویستی | وردەکاری |
|-----------|----------|
| Mac | macOS 13+ |
| Xcode | 15+ (لە App Store داگرە) |
| Apple Developer | $99/ساڵ — [developer.apple.com](https://developer.apple.com) |
| Node.js | 18+ |

### هەنگاو ١: داگرتنی کۆد

```bash
git clone https://github.com/jujamnm-hash/-currency-exchange.git
cd -currency-exchange
```

### هەنگاو ٢: دامەزراندنی پاکێجەکان

```bash
npm install
```

### هەنگاو ٣: ئامادەکردنی ئایکۆن و فایلەکان

```bash
npm run ios:prepare
```

ئەم فەرمانە:
- ئایکۆنەکان دروست دەکات
- فایلەکان دەخاتە `www/`
- پڕۆژەی iOS لە Capacitor sync دەکات

### هەنگاو ٤: کردنەوەی Xcode

```bash
npm run cap:open:ios
```

پڕۆژەکە لە Xcode دەکرێتەوە.

### هەنگاو ٥: ڕێکخستن لە Xcode

1. لە چەپەوە **App** هەڵبژێرە
2. لە **Signing & Capabilities**:
   - Team ـەکەت هەڵبژێرە (Apple Developer Account)
   - Bundle Identifier: `com.hetwan.currencyexchange`
3. ئامێرێک هەڵبژێرە (iPhone یان Simulator)
4. کرتە لە ▶️ **Run** بکە

### هەنگاو ٦: ناردن بۆ App Store

1. لە Xcode: **Product → Archive**
2. **Distribute App → App Store Connect**
3. لە [appstoreconnect.apple.com](https://appstoreconnect.apple.com) مێتاداتا و وێنەکان زیاد بکە
4. بۆ پێداچوونەوە بنێرە

---

## 📁 پێکهاتەی فایلەکانی iOS

```
currency-exchange/
├── capacitor.config.json    # ڕێکخستنی Capacitor
├── package.json             # پاکێج و فەرمانەکان
├── ios-bridge.js            # پەیوەندی نێوان وێب و iOS
├── ios-install.js           # ڕێنمایی Add to Home Screen
├── ios-styles.css           # ستایلی تایبەتی iOS
├── scripts/
│   ├── generate-icons.js    # دروستکردنی ئایکۆن
│   └── prepare-www.js       # ئامادەکردن بۆ Capacitor
├── icons/                   # ئایکۆنەکانی جۆراوجۆر
├── www/                     # کۆپی فایلەکان بۆ بیلد
└── ios/                     # پڕۆژەی Xcode (دوای cap add ios)
```

---

## 🔧 فەرمانە بەسوودەکان

| فەرمان | کار |
|--------|-----|
| `npm run icons:generate` | دروستکردنی ئایکۆنەکان |
| `npm run www:prepare` | کۆپیکردنی فایلەکان بۆ www/ |
| `npm run ios:prepare` | ئامادەکردنی تەواو بۆ iOS |
| `npm run cap:open:ios` | کردنەوەی Xcode |
| `npm run cap:sync:ios` | sync کردن دوای گۆڕانکاری |

---

## ⚠️ تێبینی گرنگەکان

### لەم ژینگەیە (Cloud) ناتوانرێت بیلد بکرێت
بیلدکردنی ئەپی iOS تەنها لەسەر **Mac** دەکرێت. ئێمە هەموو پێکهاتەکە ئامادە کردووە — تۆ تەنها پێویستت بە Mac هەیە بۆ هەنگاوی کۆتایی.

### گۆڕانکاری دوای نوێکردنەوە
هەر جارێک فایلێکت گۆڕی:
```bash
npm run ios:prepare
npm run cap:open:ios
```
دووبارە Run بکە لە Xcode.

### زانیارییەکان
- زانیارییەکان لە **localStorage** پارێزراون
- لە نێوان ئامێرەکان sync ناکرێن (بەبێ backend)
- بۆ sync لە نێوان ئامێرەکان، Telegram Bot یان API پێویستە

---

## 🆘 کێشە باوەکان

### ئایکۆن پیشان نادرێت
```bash
npm run icons:generate
```

### ئەپ لە Simulator کار ناکات
- Xcode نوێ بکەرەوە
- `npm run ios:prepare` دووبارە بکە

### Signing Error
- Apple Developer Account چالاک بکە
- لە Xcode Team ـەکەت هەڵبژێرە

---

## 📞 پشتگیری

- **GitHub Issues**: کێشەکەت بنووسە
- **MOBILE-GUIDE.md**: ڕێنمایی گشتی مۆبایل
- **README.md**: ڕێنمایی گشتی سیستەم

---

**دروستکراوە بۆ ئایفۆن 📱 | PWA + Capacitor iOS**
