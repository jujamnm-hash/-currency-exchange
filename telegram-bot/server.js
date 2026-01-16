// ======================================
// 🤖 TELEGRAM BOT FOR HETWAN RATES
// ======================================

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Authorized users (add Telegram user IDs here)
const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS 
    ? process.env.AUTHORIZED_USERS.split(',').map(id => parseInt(id.trim()))
    : [];

// Current rates storage
let currentRates = {
    USD: 0,
    EUR: 0,
    GBP: 0,
    TRY: 0,
    SAR: 0,
    AED: 0,
    IRR: 0,
    lastUpdate: null,
    updatedBy: null
};

// Load rates from file
async function loadRates() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'rates.json'), 'utf8');
        currentRates = JSON.parse(data);
        console.log('✅ Rates loaded from file');
    } catch (error) {
        console.log('⚠️ No existing rates file, starting fresh');
    }
}

// Save rates to file
async function saveRates() {
    try {
        await fs.writeFile(
            path.join(__dirname, 'rates.json'),
            JSON.stringify(currentRates, null, 2)
        );
        console.log('✅ Rates saved to file');
    } catch (error) {
        console.error('❌ Error saving rates:', error);
    }
}

// Check if user is authorized
function isAuthorized(userId) {
    if (AUTHORIZED_USERS.length === 0) return true; // If no users specified, allow all
    return AUTHORIZED_USERS.includes(userId);
}

// Parse rates from message
function parseRatesMessage(text) {
    const rates = {};
    const pairs = text.match(/[A-Z]{3}:\d+\.?\d*/gi);
    
    if (!pairs || pairs.length === 0) {
        return null;
    }
    
    pairs.forEach(pair => {
        const [currency, value] = pair.split(':');
        rates[currency.toUpperCase()] = parseFloat(value);
    });
    
    return rates;
}

// Format rates for display
function formatRates(rates) {
    return `
💱 نرخەکانی بۆرسەی هەتوان

💵 USD: ${rates.USD || '-'} دینار
💶 EUR: ${rates.EUR || '-'} دینار
💷 GBP: ${rates.GBP || '-'} دینار
🇹🇷 TRY: ${rates.TRY || '-'} دینار
🇸🇦 SAR: ${rates.SAR || '-'} دینار
🇦🇪 AED: ${rates.AED || '-'} دینار
🇮🇷 IRR: ${rates.IRR || '-'} دینار

⏰ دوایین نوێکردنەوە: ${rates.lastUpdate ? new Date(rates.lastUpdate).toLocaleString('ku-IQ') : 'هەرگیز'}
👤 نوێکراوە لەلایەن: ${rates.updatedBy || 'ناناسراو'}
    `.trim();
}

// ==================== BOT COMMANDS ====================

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    
    bot.sendMessage(chatId, `
سڵاو ${username}! 👋

من بۆتی نوێکردنەوەی نرخەکانی بۆرسەی هەتوانم 🤖

**فەرمانەکان:**

/rates - بینینی نرخەکانی ئێستا
/update - نوێکردنەوەی نرخەکان
/help - یارمەتی

**نموونەی نوێکردنەوە:**
\`\`\`
/update USD:1505 EUR:1645 GBP:1910 TRY:44.50 SAR:401 AED:410 IRR:0.036
\`\`\`

یان بە شێوەی ساکارتر:
\`\`\`
USD:1505 EUR:1645 GBP:1910
\`\`\`
    `.trim(), { parse_mode: 'Markdown' });
});

// /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId, `
📖 **ڕێنمایی بەکارهێنان**

**1️⃣ بینینی نرخەکانی ئێستا:**
\`/rates\` - پیشاندانی هەموو نرخەکان

**2️⃣ نوێکردنەوەی نرخەکان:**
\`/update USD:1505 EUR:1645 GBP:1910 TRY:44.50 SAR:401 AED:410 IRR:0.036\`

دەتوانیت تەنها چەند دراوێک نوێ بکەیتەوە:
\`/update USD:1505 EUR:1645\`

یان بێ /update:
\`USD:1505 EUR:1645 GBP:1910\`

**3️⃣ دراوە پشتگیریکراوەکان:**
• USD - دۆلاری ئەمریکی 💵
• EUR - یۆرۆ 💶
• GBP - پاوەندی ئینگلیزی 💷
• TRY - لیرەی تورکی 🇹🇷
• SAR - ڕیاڵی سعودی 🇸🇦
• AED - دیرهەمی ئیماراتی 🇦🇪
• IRR - ڕیاڵی ئێرانی 🇮🇷

**تێبینی:** نرخەکان بە دینار عێراقی بۆ 1 یەکەی دراو
    `.trim(), { parse_mode: 'Markdown' });
});

// /rates command
bot.onText(/\/rates/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, formatRates(currentRates));
});

// /update command
bot.onText(/\/update (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    
    // Check authorization
    if (!isAuthorized(userId)) {
        bot.sendMessage(chatId, '❌ تۆ ڕێگەپێدراو نیت بۆ نوێکردنەوەی نرخەکان!');
        return;
    }
    
    const ratesText = match[1];
    const newRates = parseRatesMessage(ratesText);
    
    if (!newRates) {
        bot.sendMessage(chatId, `
❌ فۆرماتی هەڵە!

**فۆرماتی دروست:**
\`USD:1505 EUR:1645 GBP:1910\`

**نموونە:**
\`/update USD:1505 EUR:1645 GBP:1910 TRY:44.50 SAR:401 AED:410 IRR:0.036\`
        `.trim(), { parse_mode: 'Markdown' });
        return;
    }
    
    // Update rates
    Object.assign(currentRates, newRates);
    currentRates.lastUpdate = new Date().toISOString();
    currentRates.updatedBy = username;
    
    // Save to file
    await saveRates();
    
    // Send confirmation
    bot.sendMessage(chatId, `
✅ نرخەکان بە سەرکەوتوویی نوێ کرانەوە!

${formatRates(currentRates)}
    `.trim());
    
    console.log(`✅ Rates updated by ${username} (${userId})`);
});

// Handle any message with currency format (without /update)
bot.on('message', async (msg) => {
    // Skip if it's a command
    if (msg.text && msg.text.startsWith('/')) return;
    
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const text = msg.text;
    
    if (!text) return;
    
    // Check if message contains rate format
    const rates = parseRatesMessage(text);
    
    if (rates && Object.keys(rates).length > 0) {
        // Check authorization
        if (!isAuthorized(userId)) {
            bot.sendMessage(chatId, '❌ تۆ ڕێگەپێدراو نیت بۆ نوێکردنەوەی نرخەکان!');
            return;
        }
        
        // Update rates
        Object.assign(currentRates, rates);
        currentRates.lastUpdate = new Date().toISOString();
        currentRates.updatedBy = username;
        
        // Save to file
        await saveRates();
        
        // Send confirmation
        bot.sendMessage(chatId, `
✅ نرخەکان نوێ کرانەوە!

${formatRates(currentRates)}
        `.trim());
        
        console.log(`✅ Rates updated by ${username} (${userId})`);
    }
});

// ==================== API ENDPOINTS ====================

// Get current rates
app.get('/api/rates', (req, res) => {
    res.json({
        success: true,
        data: currentRates
    });
});

// Update rates via API (for frontend)
app.post('/api/rates', async (req, res) => {
    try {
        const { rates, updatedBy } = req.body;
        
        if (!rates || typeof rates !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid rates format'
            });
        }
        
        // Update rates
        Object.assign(currentRates, rates);
        currentRates.lastUpdate = new Date().toISOString();
        currentRates.updatedBy = updatedBy || 'API';
        
        // Save to file
        await saveRates();
        
        res.json({
            success: true,
            data: currentRates
        });
        
        console.log('✅ Rates updated via API');
    } catch (error) {
        console.error('❌ Error updating rates:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ==================== STARTUP ====================

const PORT = process.env.PORT || 3000;

async function start() {
    // Load existing rates
    await loadRates();
    
    // Start Express server
    app.listen(PORT, () => {
        console.log('🚀 Server started on port', PORT);
        console.log('🤖 Telegram Bot is running');
        console.log('📡 API available at http://localhost:' + PORT);
        console.log('');
        console.log('✅ Ready to receive rate updates!');
    });
}

start();
