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
 * Форматує поточну дату та час у вигляді: "31.08 о 13:28"
 */
function formatKyivDateTime(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month} о ${hours}:${minutes}`;
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

  const timeString = formatKyivDateTime(new Date());
  const locationName = source || 'Home';

  // Лаконічний формат заявки
  const lines = [
    '<b>[BOSCH]</b>',
    '',
    `🟢 <b>НОВА ЗАЯВКА:</b> ${timeString}`,
    `📍 <b>${escapeTelegramHtml(locationName)}</b>`,
    '📋 <b>Форма:</b>',
    '',
    `🔻 <b>Ваше Ім’я:</b> ${escapeTelegramHtml(name || 'Не вказано')}`,
    `🔻 <b>Телефон:</b> <code>${escapeTelegramHtml(phone)}</code>`,
    `🔻 <b>Тип приладу:</b> ${escapeTelegramHtml(device || 'Не вказано')}`,
    `🔻 <b>Коментар майстру:</b> ${escapeTelegramHtml((message && message.trim() && message.trim() !== '—') ? message.trim() : 'Немає')}`
  ];

  const textPayload = lines.join('\n');

  try {
    const textResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textPayload,
        parse_mode: 'HTML'
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