/**
 * Конфігурація сервісного центру
 * Усі контактні дані, графік роботи та налаштування сповіщень
 */
window.SITE_CONFIG = {
  brand: {
    name: "МАЙСТЕР-СЕРВІС",
    tagline: "Спеціалізований сервісний центр побутової техніки",
    badge: "НЕЗАЛЕЖНИЙ СЕРВІС",
    city: "Київ",
    address: "м. Київ, пр. Перемоги, 5а",
    mapUrl: "https://maps.google.com/?q=50.4475,30.4850"
  },
  contacts: {
    phonePrimary: "+38 (068) 824-95-27",
    phonePrimaryRaw: "+380688249527",
    phoneSecondary: "+38 (068) 824-95-27",
    phoneSecondaryRaw: "+380688249527",
    telegramUsername: "Hitech_00",
    telegramDirectLink: "https://t.me/Hitech_00",
    viberLink: "viber://chat?number=%2B380688249527"
  },
  schedule: {
    weekdays: "Пн–Сб: 08:30 – 20:00",
    weekends: "Нд: 10:00 – 17:00 (черговий режим)",
    statusText: "Прийом викликів: на зв'язку щодня"
  },
  telegram: {
    botToken: "8768247342:AAHJcR4m_z7AjmJdKoW0IbVCc7cL4mLPlxo",
    chatId: "-5310506440" // Перевірена тестова група
  },
  pricing: {
    diagnosticsHome: 250, // Інструментальна діагностика від 250 грн
    diagnosticsOnly: 350,
    departureKyiv: 250, // Виїзд інженера по Києву від 250 грн (окрема послуга)
    urgencySurcharge: 0
  }
};
