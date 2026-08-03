# 📱 ڕێنمایی دامەزراندن و بیلد — قەرزنامە بۆ ئایپاد

دوو ڕێگا هەیە بۆ بەکارهێنان لەسەر ئایپاد:

1. **PWA (خێرا و بەخۆڕایی)** — ئێستا دەتوانیت دامەزرێنیت
2. **ئەپی ڕاستەقینە (Xcode / App Store)** — پێویستی بە Mac هەیە

---

## 🚀 ڕێگای ١: Add to Home Screen (ئێستا)

1. لە **Safari** لەسەر ئایپادەکەت بکەرەوە:

```
https://jujamnm-hash.github.io/-currency-exchange/dashboard/
```

2. کرتە لە **Share** (⬆️) بکە
3. **Add to Home Screen** هەڵبژێرە
4. ناو بنووسە: **قەرزنامە** → **Add**

ئێستا وەک ئەپ لە Home Screen دەردەکەوێت، کاری دەکات لە fullscreen، و داتا لەسەر ئایپادەکەت دەمێنێتەوە.

### تێبینی
- باشترە Safari بەکاربهێنیت (نەک Chrome) بۆ Add to Home Screen
- دوای یەکەم کردنەوە، بەشێک لە پەڕەکان offline دەبن

---

## 🏗️ ڕێگای ٢: ئەپی ڕاستەقینە (Capacitor + Xcode)

| پێداویستی | وردەکاری |
|-----------|----------|
| Mac | macOS 13+ |
| Xcode | 15+ |
| Apple Developer | $99/ساڵ (بۆ ئامێری ڕاستەقینە / App Store) |
| Node.js | 18+ |

```bash
git clone https://github.com/jujamnm-hash/-currency-exchange.git
cd -currency-exchange
npm install
npm run ios:prepare
npm run cap:open:ios
```

لە Xcode:

1. Team هەڵبژێرە لە Signing & Capabilities
2. Bundle ID: `com.qarzname.debtledger`
3. ئامێر: **iPad** یان Simulator
4. ▶️ Run

بۆ App Store: Product → Archive → Distribute App

---

## 💾 پاراستنی داتا

- داتا لە **localStorage** ی ئامێرەکەتە
- لە ڕێکخستن → **داگرتنی باکئاپ** بۆ فایلێکی JSON
- دەتوانیت هەمان فایل هێنانەوە بکەیت لەسەر ئامێرێکی تر

---

## چی لە ئەپەکەدا هەیە؟

- کەسەکان
- قەرزی «بۆ من» / «لە من»
- پارەدان (بەشی یان تەواو)
- داشبۆردی باڵانس
- فلتەری قەرزەکان
