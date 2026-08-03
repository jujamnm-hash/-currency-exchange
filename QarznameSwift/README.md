# 🍎 بیلدی Swift ـی ڕاستەقینە — قەرزنامە

ئەم فۆڵدەرە **ئەپی native SwiftUI** ـە (نەک وێب). دەتوانیت لە Xcode بیلدی بکەیت و ڕاستەوخۆ لەسەر ئایپاد دایبمەزرێنیت.

## پێداویستی

| شت | وردەکاری |
|----|----------|
| Mac | macOS 14+ |
| Xcode | 15+ (لە App Store) |
| iPad | iPadOS 17+ (یان Simulator) |
| Apple ID | بەخۆڕایی بۆ دامەزراندن لەسەر ئامێرەکەت (٧ ڕۆژ). بۆ App Store: Developer $99/ساڵ |

> ⚠️ لەم سێرڤەرە (Linux) **ناتوانرێت** `xcodebuild` جێبەجێ بکرێت. بیلدی IPA تەنها لەسەر Mac دەکرێت.

## هەنگاوەکان (٥ خولەک)

```bash
git clone https://github.com/jujamnm-hash/-currency-exchange.git
cd -currency-exchange/QarznameSwift
open Qarzname.xcodeproj
```

لە Xcode:

1. لەسەرەوە **Qarzname** target هەڵبژێرە
2. Signing & Capabilities → **Team** ـەکەت هەڵبژێرە (Apple ID)
3. Bundle ID: `com.qarzname.debtledger` (ئەگەر هەبوو، بیگۆڕە بۆ ناوی تایبەت)
4. ئامێر: **iPad** ـەکەت (USB یان هەمان Wi‑Fi) یان iPad Simulator
5. کرتە لە ▶️ **Run**

ئەپەکە وەک **قەرزنامە** لەسەر ئایپاد دادەمەزرێت.

## چی تێدایە (Swift)

- `SwiftUI` + `SwiftData`
- کەسەکان، قەرز، پارەدان
- داشبۆرد و باڵانس
- RTL کوردی
- گونجاو بۆ ئایپاد (Sidebar) و مۆبایل (Tab)

## فۆڵدەرەکان

```
QarznameSwift/
├── Qarzname.xcodeproj      ← ئەمە بکەرەوە لە Xcode
└── Qarzname/
    ├── QarznameApp.swift
    ├── Models/DebtModels.swift
    ├── Services/Formatters.swift
    └── Views/…             ← Dashboard, People, Debts, …
```
