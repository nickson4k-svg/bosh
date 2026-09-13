/**
 * МАЙСТЕР-СЕРВІС | TELEGRAM BOT API ІНТЕГРАЦІЯ
 * Чистий нативний JavaScript (Vanilla fetch)
 */

function escapeTelegramHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Відправляє заявку на ремонт у Telegram-чат сервісного центру
 * @param {Object} data { name, phone, device, message, source }
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
async function sendTelegramLead({ name, phone, device, message, source }) {
  const cfg = window.SITE_CONFIG || {};
  const botToken = (cfg.telegram && cfg.telegram.botToken) || "8903060860:AAFKSB4OSIJMmKnf8FlRlCOZUdu8_4xc_Cs";
  const chatId = (cfg.telegram && cfg.telegram.chatId) || "-5342810428";

  const now = new Date();
  const timeString = now.toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });

  const textPayload = 
`🔧 <b>НОВА ЗАЯВКА НА РЕМОНТ | МАЙСТЕР-СЕРВІС</b>
──────────────────────────
👤 <b>Клієнт:</b> ${escapeTelegramHtml(name || 'Клієнт')}
📞 <b>Телефон:</b> <code>${escapeTelegramHtml(phone)}</code>
🏷️ <b>Прилад:</b> ${escapeTelegramHtml(device || 'Не вказано')}
📝 <b>Опис несправності:</b> ${escapeTelegramHtml(message || '—')}
📍 <b>Джерело:</b> ${escapeTelegramHtml(source || 'Форма на сайті')}
⏱️ <b>Час:</b> ${timeString}
──────────────────────────
<i>Заявка надійшла з сайту сервісного центру</i>`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: textPayload,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();
    if (result.ok) {
      return { ok: true };
    } else {
      console.error('Telegram API error:', result);
      return { ok: false, error: result.description || 'Помилка Telegram API' };
    }
  } catch (err) {
    console.error('Network error sending to Telegram:', err);
    return { ok: false, error: 'Помилка мережі при відправці заявки' };
  }
}

// Експорт у глобальну область для vanilla скриптів
window.sendTelegramLead = sendTelegramLead;