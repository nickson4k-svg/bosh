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
    address: "м. Київ, бульвар Вацлава Гавела, 16",
    mapUrl: "https://maps.google.com/?q=50.43685,30.41369"
  },
  contacts: {
    // [Заглушка: номер буде вказано після надання]
    phonePrimary: "+38 (0XX) XXX-XX-XX",
    phonePrimaryRaw: "",
    phoneSecondary: "+38 (0XX) XXX-XX-XX",
    phoneSecondaryRaw: "",
    telegramUsername: "smeg_service_lead_bot",
    telegramDirectLink: "https://t.me/smeg_service_lead_bot",
    viberLink: "#"
  },
  schedule: {
    weekdays: "Пн–Сб: 08:30 – 20:00",
    weekends: "Нд: 10:00 – 17:00 (черговий режим)",
    statusText: "Прийом викликів: на зв'язку щодня"
  },
  telegram: {
    botToken: "8903060860:AAFKSB4OSIJMmKnf8FlRlCOZUdu8_4xc_Cs",
    chatId: "-5342810428" // Перевірена тестова група
  },
  pricing: {
    diagnosticsHome: 250, // Інструментальна діагностика від 250 грн
    diagnosticsOnly: 350,
    departureKyiv: 250, // Виїзд інженера по Києву від 250 грн (окрема послуга)
    urgencySurcharge: 0
  }
};
