/**
 * МАЙСТЕР-СЕРВІС | TELEGRAM BOT API ІНТЕГРАЦІЯ
 * Чистий нативний JavaScript (Vanilla fetch)
 * Підтримка графічних карток техніки, блоків цитат та inline-кнопок
 */

function escapeTelegramHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Визначає фото техніки за її назвою
 */
function getDevicePhotoUrl(device) {
  const baseUrl = "https://raw.githubusercontent.com/nickson4k-svg/bosh/main/images/";
  const d = (device || '').toLowerCase();

  if (/прал|сушил/.test(d)) return baseUrl + "pralka.webp";
  if (/холод/.test(d)) return baseUrl + "holodos.webp";
  if (/посуд/.test(d)) return baseUrl + "posud.webp";
  if (/духов|варильн|плит|піч/.test(d)) return baseUrl + "duhowka.webp";
  if (/кав/.test(d)) return baseUrl + "kava.webp";
  if (/пилос/.test(d)) return baseUrl + "pulosos.webp";
  if (/комбайн|блендер|міксер/.test(d)) return baseUrl + "blender.webp";
  return baseUrl + "logo.png";
}

/**
 * Нормалізує номер для прямих посилань месенджерів
 */
function normalizePhoneNumber(phone) {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('0')) {
    digits = '38' + digits;
  } else if (digits.length === 9) {
    digits = '380' + digits;
  }
  return digits;
}

/**
 * Відправляє заявку на ремонт у Telegram-чат сервісного центру
 * @param {Object} data { name, phone, device, message, source }
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function sendTelegramLead({ name, phone, device, message, source }) {
  const cfg = window.SITE_CONFIG || {};
  const botToken = (cfg.telegram && cfg.telegram.botToken) || "8768247342:AAHJcR4m_z7AjmJdKoW0IbVCc7cL4mLPlxo";
  const chatId = (cfg.telegram && cfg.telegram.chatId) || "-5310506440";

  const now = new Date();
  const timeString = now.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });

  // Формування красивого повідомлення
  const lines = [
    '⚡️ <b>НОВА ЗАЯВКА НА РЕМОНТ</b>',
    '──────────────────────────',
    `👤 <b>Клієнт:</b> ${escapeTelegramHtml(name || 'Клієнт')}`,
    `📞 <b>Телефон:</b> <code>${escapeTelegramHtml(phone)}</code>`,
    `🏷 <b>Прилад:</b> <b>${escapeTelegramHtml(device || 'Не вказано')}</b>`,
    `📍 <b>Джерело:</b> ${escapeTelegramHtml(source || 'Форма на сайті')}`,
    `⏱ <b>Час:</b> ${timeString}`
  ];

  if (message && message.trim() && message.trim() !== '—') {
    lines.push('');
    lines.push(`<blockquote>📝 <b>Опис несправності:</b>\n${escapeTelegramHtml(message.trim())}</blockquote>`);
  }

  const textPayload = lines.join('\n');

  // Інтерактивні кнопки швидкого зв'язку
  const digits = normalizePhoneNumber(phone);
  const inline_keyboard = [];
  if (digits.length >= 10) {
    inline_keyboard.push([
      { text: '💬 Написати в Telegram', url: `https://t.me/+${digits}` },
      { text: '🟢 Написати у WhatsApp', url: `https://wa.me/${digits}` }
    ]);
  }

  const reply_markup = inline_keyboard.length > 0 ? { inline_keyboard } : undefined;
  const photoUrl = getDevicePhotoUrl(device);

  try {
    // 1. Спроба відправити графічне фото-повідомлення (sendPhoto)
    const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: textPayload,
        parse_mode: 'HTML',
        reply_markup: reply_markup
      })
    });

    const photoResult = await photoResponse.json();
    if (photoResult.ok) {
      return { ok: true };
    }

    console.warn('sendPhoto failed, falling back to sendMessage:', photoResult);

    // 2. Fallback на звичайне текстове повідомлення (якщо фото недоступне)
    const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textPayload,
        parse_mode: 'HTML',
        reply_markup: reply_markup
      })
    });

    const textResult = await textResponse.json();
    if (textResult.ok) {
      return { ok: true };
    } else {
      console.error('Telegram API error:', textResult);
      return { ok: false, error: textResult.description || 'Помилка Telegram API' };
    }
  } catch (err) {
    console.error('Network error sending to Telegram:', err);
    return { ok: false, error: 'Помилка мережі при відправці заявки' };
  }
}

// Експорт у глобальну область для vanilla скриптів
window.sendTelegramLead = sendTelegramLead;