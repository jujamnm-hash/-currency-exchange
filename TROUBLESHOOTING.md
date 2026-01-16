# 🔧 چارەسەرکردنی کێشەکان

## ❌ کێشە: داتا تۆمار نابێت لەسەر مۆبایل

### چارەسەرەکان:

#### 1️⃣ چێککردنی Console

**بۆ ئەندرۆید (Chrome):**
1. کردنەوەی لینکەکە لە Chrome
2. ناونیشانەکە بنووسە: `chrome://inspect`
3. بەدواداچوون بۆ errors

**بۆ Safari (iPhone):**
1. Settings → Safari → Advanced → Web Inspector چالاک بکە
2. لە کۆمپیوتەر، Safari → Develop → [ئامێرەکەت]

---

#### 2️⃣ پاککردنەوەی Cache

**بۆ Chrome (ئەندرۆید):**
1. Chrome → Settings
2. Privacy → Clear browsing data
3. Cached images and files هەڵبژێرە
4. Clear data

**بۆ Safari (iPhone):**
1. Settings → Safari
2. Clear History and Website Data

---

#### 3️⃣ چێککردنی LocalStorage

1. **کردنەوەی Developer Tools**
   - Chrome: دوگمەی Menu → More tools → Developer tools
   - Safari: Develop → Show Web Inspector

2. **بڕۆ بۆ Application/Storage**
   - Local Storage هەڵبژێرە
   - بینینی `transactions`, `settings`

3. **تاقیکردنەوە:**
   ```javascript
   localStorage.setItem('test', 'hello');
   console.log(localStorage.getItem('test'));
   ```

---

#### 4️⃣ دەستکاری کردنی Permissions

**بۆ Chrome:**
1. لە ناونیشانەکە، کلیک لە 🔒 یا ⓘ
2. Site settings
3. دڵنیابەرەوە:
   - ✅ JavaScript: Allowed
   - ✅ Cookies: Allowed

**بۆ Safari:**
1. Settings → Safari
2. دڵنیابەرەوە:
   - ✅ JavaScript ON
   - ✅ Block All Cookies OFF

---

#### 5️⃣ حاڵەتی تایبەتی (Private/Incognito)

⚠️ **ئاگادارباش:** لە حاڵەتی تایبەتیدا LocalStorage کار ناکات یان سنووردارە.

**چارەسەر:**
- کردنەوە لە حاڵەتی ئاسایی (Normal Mode)
- هەڵنەبژێرە "Private" یان "Incognito"

---

#### 6️⃣ تاقیکردنەوەی بنەڕەتی

**JavaScript کار دەکات؟**

لە Console بنووسە:
```javascript
alert('JavaScript works!');
```

**فۆرم بەدرووستی کاردەکات؟**

1. کردنەوەی Console (F12)
2. پڕکردنەوەی فۆرم
3. کلیک لە "زیادکردن"
4. بینینی messages لە console:
   ```
   Adding new transaction...
   Transaction added successfully: {...}
   Total transactions: 1
   ```

---

#### 7️⃣ چێککردنی ڕێکوپێکی فایلەکان

**دڵنیابەرەوە هەموو ئەم فایلانە لە GitHub هەن:**

- ✅ index.html
- ✅ style.css
- ✅ app.js
- ✅ advanced-features.js
- ✅ premium-features.js
- ✅ sw.js (Service Worker)
- ✅ manifest.json

**چێککردن لە Console:**
```javascript
console.log('Files loaded check');
```

---

#### 8️⃣ HTTPS پێویستە

⚠️ **گرنگ:** GitHub Pages بە ئۆتۆماتیک HTTPS بەکاردەهێنێت.

ئەگەر لەسەر سێرڤەری خۆت دایتناوە:
- پێویستە HTTPS بێت
- HTTP تەنها نابێت (بۆ ServiceWorker)

---

#### 9️⃣ مانەوەیەکی کاتی

**یەکێک لەمانە تاقی بکەرەوە:**

**A. هەموویان لەلایەن خۆیەوە:**
```html
<!DOCTYPE html>
<html lang="ku" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تاقیکردنەوە</title>
</head>
<body>
    <h1>تاقیکردنەوەی تۆمارکردن</h1>
    <button onclick="testSave()">تاقیکردنەوە</button>
    <div id="result"></div>
    
    <script>
        function testSave() {
            try {
                // تاقیکردنەوەی localStorage
                localStorage.setItem('test', 'working');
                const result = localStorage.getItem('test');
                
                if (result === 'working') {
                    document.getElementById('result').innerHTML = 
                        '✅ LocalStorage کاردەکات!';
                    
                    // تاقیکردنەوەی تۆماری داتا
                    let data = JSON.parse(localStorage.getItem('testData')) || [];
                    data.push({
                        id: Date.now(),
                        text: 'تاقیکردنەوە',
                        date: new Date().toISOString()
                    });
                    localStorage.setItem('testData', JSON.stringify(data));
                    
                    document.getElementById('result').innerHTML += 
                        '<br>✅ تۆماری داتا کاردەکات!<br>ژمارەی داتا: ' + data.length;
                } else {
                    document.getElementById('result').innerHTML = 
                        '❌ کێشە لە localStorage';
                }
            } catch(e) {
                document.getElementById('result').innerHTML = 
                    '❌ هەڵە: ' + e.message;
            }
        }
    </script>
</body>
</html>
```

ئەم فایلە وەک `test.html` پاشەکەوت بکە و تاقی بکەرەوە.

---

## 🔍 لۆگەکانی چێککردن

لە Console دەبینیت:
```
App initialized
LocalStorage available: true
Adding new transaction...
Transaction added successfully: {id: 1234567890, type: "buy", ...}
Total transactions: 1
Service Worker registered successfully
```

---

## ✅ لیستی چێککردن

قەرز بکە هەموو ئەمانە:

- [ ] وێبگەڕەکە نوێکراوەتەوە (نەک Incognito)
- [ ] JavaScript چالاکە
- [ ] Cookies ڕێگەپێدراوە
- [ ] لە HTTPS ـە (GitHub Pages بە ئۆتۆماتیک)
- [ ] Cache پاککرایەوە
- [ ] Console چێککرا بۆ errors
- [ ] LocalStorage تاقیکرایەوە
- [ ] هەموو فایلەکان بارکراون

---

## 📞 پشتگیری

ئەگەر هێشتا کێشەکە چارەسەر نەبوو:

1. **Screenshot بنێرە لە:**
   - Console (errors)
   - Application → Local Storage
   - Network tab

2. **زانیاری بدە:**
   - جۆری ئامێر (ئەندرۆید/ئایفۆن)
   - وێبگەڕ (Chrome/Safari)
   - وەشانی وێبگەڕ

3. **لینکی GitHub Pages:**
   - لینکەکە بنێرە بۆ چێککردن

---

## 💡 ڕاسپاردەکان

### بۆ بەکارهێنانی باش:

1. **بەکارهێنان لە حاڵەتی ئاسایی** (نەک Private/Incognito)
2. **ڕێگەپێدان بە JavaScript و Cookies**
3. **نوێکردنەوەی وێبگەڕ** (Ctrl+Shift+R یان Cmd+Shift+R)
4. **زیادکردن بە Home Screen** بۆ دەستگەیشتنی خێرا

### بۆ سەلامەتیی داتا:

1. **هەناردەی بەردەوام** (Export) بە JSON
2. **پاشەکەوتی ئۆتۆماتیک چالاک بکە** لە Settings
3. **تاقیکردنەوەی دووبارە** دوای گۆڕانکاری گرنگ

---

**کاردەکات ئێستا؟ 🎉**

ئەگەر کێشەکە چارەسەر بوو، دەتوانیت:
- ⭐ Star بدە لە GitHub
- 📢 بڵاوی بکەرەوە
- 💝 بەشداری بکە

**هێشتا کێشەت هەیە؟ 😟**

دەتوانیت Issue بکەیتەوە لە GitHub بە ووردەکاری!
