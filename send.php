<?php
/**
 * СЕРВЕРНИЙ ОБРОБНИК ВІДПРАВКИ ЗАЯВОК У TELEGRAM
 * МАЙСТЕР-СЕРВІС (Bosch / Siemens / Neff / Gaggenau)
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Дозволяємо лише POST запити
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// -----------------------------------------------------------------------------
// КОНФІГУРАЦІЯ TELEGRAM (Секретні ключі зберігаються виключно на бекенді)
// -----------------------------------------------------------------------------
$telegramBotToken = '8768247342:AAHJcR4m_z7AjmJdKoW0IbVCc7cL4mLPlxo';
$telegramChatId   = '-5310506440';

// -----------------------------------------------------------------------------
// ОДЕРЖАННЯ ДАНИХ (підтримка JSON та FormData/x-www-form-urlencoded)
// -----------------------------------------------------------------------------
$input = [];
$rawInput = file_get_contents('php://input');

if (!empty($rawInput)) {
    $jsonData = json_decode($rawInput, true);
    if (is_array($jsonData)) {
        $input = $jsonData;
    }
}

if (empty($input)) {
    $input = $_POST;
}

// -----------------------------------------------------------------------------
// 1. ЗАХИСТ ВІД СПАМУ (Honeypot trap)
// -----------------------------------------------------------------------------
$honeypot = trim((string)($input['website_hp'] ?? ''));
if ($honeypot !== '') {
    // Тихо повертаємо успіх для спам-ботів, не турбуючи Telegram
    echo json_encode(['ok' => true]);
    exit;
}

// -----------------------------------------------------------------------------
// 2. ВАЛІДАЦІЯ ТА ОЧИЩЕННЯ ПОЛІВ
// -----------------------------------------------------------------------------
$name    = trim((string)($input['name'] ?? ''));
$phone   = trim((string)($input['phone'] ?? ''));
$device  = trim((string)($input['device'] ?? ''));
$message = trim((string)($input['message'] ?? ''));
$source  = trim((string)($input['source'] ?? 'Форма на сайті'));

// Очищення номера телефону від зайвих символів для перевірки
$digitsOnly = preg_replace('/\D+/', '', $phone);

// Перевірка коректності номера (мінімум 9 цифр)
if ($digitsOnly === null || strlen($digitsOnly) < 9) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Будь ласка, введіть коректний номер телефону'
    ]);
    exit;
}

// Значення за замовчуванням
if ($name === '') {
    $name = 'Не вказано';
}
if ($device === '') {
    $device = 'Не вказано';
}
if ($message === '' || $message === '—') {
    $messageText = 'Немає';
} else {
    $messageText = $message;
}

// Поточний київський час
try {
    $kyivTz = new DateTimeZone('Europe/Kyiv');
    $dateObj = new DateTime('now', $kyivTz);
    $timeString = $dateObj->format('d.m \о H:i');
} catch (Exception $e) {
    $timeString = date('d.m \о H:i');
}

// -----------------------------------------------------------------------------
// 3. ФОРМУВАННЯ ПОВІДОМЛЕННЯ
// -----------------------------------------------------------------------------
function escapeTg(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$textLines = [
    '<b>[BOSCH]</b>',
    '',
    '🟢 <b>НОВА ЗАЯВКА:</b> ' . escapeTg($timeString),
    '📍 <b>' . escapeTg($source) . '</b>',
    '📋 <b>Форма:</b>',
    '',
    '🔻 <b>Ваше Ім’я:</b> ' . escapeTg($name),
    '🔻 <b>Телефон:</b> <code>' . escapeTg($phone) . '</code>',
    '🔻 <b>Тип приладу:</b> ' . escapeTg($device),
    '🔻 <b>Коментар майстру:</b> ' . escapeTg($messageText)
];

$payloadText = implode("\n", $textLines);

// -----------------------------------------------------------------------------
// 4. ВІДПРАВКА ЧЕРЕЗ cURL У TELEGRAM BOT API
// -----------------------------------------------------------------------------
$telegramApiUrl = 'https://api.telegram.org/bot' . $telegramBotToken . '/sendMessage';

$postFields = json_encode([
    'chat_id'    => $telegramChatId,
    'text'       => $payloadText,
    'parse_mode' => 'HTML'
], JSON_UNESCAPED_UNICODE);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $telegramApiUrl,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postFields,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($response === false || !empty($curlError)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Помилка надсилання на сервер Telegram'
    ]);
    exit;
}

$result = json_decode($response, true);

if ($httpCode === 200 && isset($result['ok']) && $result['ok'] === true) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'error' => $result['description'] ?? 'Помилка Telegram API'
    ]);
}
