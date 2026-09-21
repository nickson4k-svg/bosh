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
    viberLink: "viber://chat?number=%2B380688249527"
  },
  schedule: {
    weekdays: "Пн–Сб: 08:30 – 20:00",
    weekends: "Нд: 10:00 – 17:00 (черговий режим)",
    statusText: "Прийом викликів: на зв'язку щодня"
  },
  pricing: {
    diagnosticsHome: 250, // Інструментальна діагностика від 250 грн
    diagnosticsOnly: 350,
    departureKyiv: 250, // Виїзд інженера по Києву від 250 грн (окрема послуга)
    urgencySurcharge: 0
  }
};
