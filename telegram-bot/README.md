# 🤖 Telegram Bot بۆ نوێکردنەوەی نرخەکانی بۆرسەی هەتوان

بۆتێکی Telegram کە ڕێگەت پێدەدات نرخەکانی بۆرسەی هەتوان بە خێرایی لە مۆبایلەوە نوێ بکەیتەوە.

---

## 🎯 تایبەتمەندییەکان

- ✅ نوێکردنەوەی خێرای نرخەکان لە Telegram
- ✅ بینینی نرخەکانی ئێستا
- ✅ سیستەمی ڕێگەپێدان (تەنها بەکارهێنەرە مۆڵەتدراوەکان)
- ✅ پاشەکەوتکردنی خۆکار لە فایل
- ✅ API بۆ پەیوەندی لەگەڵ Frontend
- ✅ فۆرماتی ئاسان بۆ نوێکردنەوە

---

## 📋 پێداویستییەکان

- Node.js (v16 یان بەرزتر)
- حسابی Telegram
- بۆتی Telegram (لە @BotFather دا)

---

## 🚀 دامەزراندن

### **1. دروستکردنی بۆتی Telegram**

1. لە Telegram، بڕۆ بۆ [@BotFather](https://t.me/BotFather)
2. بنێرە: `/newbot`
3. ناوێک بۆ بۆتەکەت هەڵبژێرە، بۆ نموونە: `Hetwan Rates Bot`
4. ناوی بەکارهێنەری بۆتەکە هەڵبژێرە، بۆ نموونە: `hetwan_rates_bot`
5. **Bot Token** وەردەگریت، بیپارێزە!

### **2. وەرگرتنی User ID ت**

1. بڕۆ بۆ [@userinfobot](https://t.me/userinfobot)
2. Start بکە
3. **User ID** ت پیشان دەدات، بیپارێزە!

### **3. دامەزراندنی کۆد**

```bash
cd telegram-bot
npm install
```

### **4. ڕێکخستنی Environment Variables**

```bash
# کۆپی کردنی فایلی نموونە
cp .env.example .env

# دەستکاریکردنی .env
notepad .env
```

فایلی `.env` بگۆڕە:

```env
# Bot Token ی تۆ (لە BotFather وەریگرتووە)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# User ID ی تۆ (لە userinfobot وەریگرتووە)
AUTHORIZED_USERS=123456789

# پۆرت
PORT=3000
```

### **5. کردنەوەی بۆتەکە**

```bash
npm start
```

دەبینیت:
```
🚀 Server started on port 3000
🤖 Telegram Bot is running
📡 API available at http://localhost:3000
✅ Ready to receive rate updates!
```

---

## 📱 بەکارهێنان

### **فەرمانەکان:**

#### **1. بینینی نرخەکان**
```
/rates
```

#### **2. نوێکردنەوەی نرخەکان**

**شێوەی تەواو:**
```
/update USD:1505 EUR:1645 GBP:1910 TRY:44.50 SAR:401 AED:410 IRR:0.036
```

**شێوەی کورت (تەنها دراوە پێویستەکان):**
```
/update USD:1505 EUR:1645 GBP:1910
```

**بێ /update (ئاسانترە!):**
```
USD:1505 EUR:1645 GBP:1910 TRY:44.50 SAR:401 AED:410 IRR:0.036
```

#### **3. یارمەتی**
```
/help
```

---

## 🌐 پەیوەندیکردنی لەگەڵ Frontend

بۆتەکە API ـێک دابین دەکات کە Frontend ـەکەت پەیوەندی پێوە بکات:

### **وەرگرتنی نرخەکان:**

```javascript
// لە frontend ـەکەتدا
async function fetchHetwanRates() {
    const response = await fetch('http://localhost:3000/api/rates');
    const data = await response.json();
    
    if (data.success) {
        const rates = data.data;
        // نوێکردنەوەی UI
        updateHetwanRatesInUI(rates);
    }
}

// هەر 30 خولەک جارێک نرخەکان نوێ بکەرەوە
setInterval(fetchHetwanRates, 30 * 60 * 1000);
```

### **ناردنی نرخەکان لە Admin Panel:**

```javascript
async function saveAdminRates() {
    const rates = {
        USD: parseFloat(document.getElementById('hetwan_USD').value),
        EUR: parseFloat(document.getElementById('hetwan_EUR').value),
        // ... باقی دراوەکان
    };
    
    const response = await fetch('http://localhost:3000/api/rates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            rates: rates,
            updatedBy: 'Admin Panel'
        })
    });
    
    const data = await response.json();
    if (data.success) {
        showSimpleNotification('نرخەکان نوێ کرانەوە ✅', 'success');
    }
}
```

---

## 🚀 جێگیرکردن (Deployment)

### **بژاردە 1: Railway**

1. بڕۆ بۆ [Railway.app](https://railway.app)
2. پەیوەندی بە GitHub بکە
3. New Project → Deploy from GitHub Repo
4. لایەنەکەت هەڵبژێرە
5. Environment Variables زیاد بکە:
   - `TELEGRAM_BOT_TOKEN`
   - `AUTHORIZED_USERS`
6. Deploy!

**تێچوون:** $5/مانگ (یان بێ بەلاش بۆ پرۆژەی بچووک)

### **بژاردە 2: Heroku**

```bash
# Login to Heroku
heroku login

# Create app
heroku create hetwan-rates-bot

# Set environment variables
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set AUTHORIZED_USERS=your_user_id

# Deploy
git push heroku main
```

**تێچوون:** $7/مانگ

### **بژاردە 3: Render**

1. بڕۆ بۆ [Render.com](https://render.com)
2. New → Web Service
3. پەیوەندی بە GitHub بکە
4. Environment Variables زیاد بکە
5. Deploy!

**تێچوون:** بێ بەلاش (ئەگەر بچووک بێت)

---

## 📊 نموونەی بەکارهێنان

### **سیناریۆی ڕۆژانە:**

**کاتژمێر 9:00 بەیانی:**
1. وێبسایتی بۆرسەی هەتوان بکەرەوە
2. نرخەکان ببینە
3. بڕۆ بۆ Telegram
4. بنێرە بۆ بۆتەکە:
   ```
   USD:1505 EUR:1645 GBP:1910 TRY:44.50 SAR:401 AED:410 IRR:0.036
   ```
5. تەواو! ✅ (تەنها **30 چرکە** وەریگرت!)

---

## 🔐 ئاسایش

- تەنها بەکارهێنەرە مۆڵەتدراوەکان دەتوانن نرخەکان نوێ بکەنەوە
- هەموو نوێکردنەوەیەک لۆگ دەکرێت (کێ و کەی)
- Bot Token لە .env دا پارێزراوە (نابێتە کۆمیت لە Git)

---

## ❓ پرسیار و وەڵام

### **پرسیار: بۆتەکە وەڵام نادات؟**
```bash
# چێککردنی لۆگەکان
npm start

# دڵنیابە Bot Token دروستە
```

### **پرسیار: User ID چۆن دەست دەکەوێت؟**
لە Telegram بڕۆ بۆ [@userinfobot](https://t.me/userinfobot)

### **پرسیار: چۆن زیاتر لە یەک کەس مۆڵەت بدەم؟**
لە `.env`:
```env
AUTHORIZED_USERS=123456789,987654321,456789123
```

### **پرسیار: نرخەکان لە کوێ پاشەکەوت دەکرێن؟**
لە `rates.json` (خۆکار دروست دەبێت)

---

## 🎉 ئامادەیت!

ئێستا دەتوانیت:
- ✅ هەر بەیانییەک لە Telegram نرخەکان نوێ بکەیتەوە (30 چرکە)
- ✅ لە Admin Panel ـەوە نرخەکان دەستکاری بکەیت
- ✅ Frontend خۆکار نرخەکان لە API وەردەگرێت

---

## 📞 پشتگیری

ئەگەر پرسیارت هەیە یان کێشەیەکت هەیە:
- چێککردنی فایلی لۆگ
- دڵنیابوون لە Environment Variables
- دڵنیابوون لە ئینتەرنێت

---

**دروستکراوە لە: کانونی دووەمی ٢٠٢٦**
