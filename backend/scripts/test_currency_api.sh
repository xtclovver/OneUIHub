#!/bin/bash

# Скрипт для тестирования API валют
# Использование: ./test_currency_api.sh [BASE_URL] [ADMIN_TOKEN]

BASE_URL=${1:-"http://localhost:8080"}
ADMIN_TOKEN=${2:-""}

echo "🔄 Тестирование API валют..."
echo "Base URL: $BASE_URL"
echo ""

# Тест 1: Получение поддерживаемых валют
echo "1️⃣ Получение поддерживаемых валют:"
curl -s "$BASE_URL/api/v1/currencies" | jq '.' || echo "❌ Ошибка при получении валют"
echo ""

# Тест 2: Получение курсов валют
echo "2️⃣ Получение курсов валют:"
curl -s "$BASE_URL/api/v1/currencies/exchange-rates" | jq '.' || echo "❌ Ошибка при получении курсов"
echo ""

# Тест 3: Получение конкретного курса
echo "3️⃣ Получение курса USD -> RUB:"
curl -s "$BASE_URL/api/v1/currencies/exchange-rates?from=USD&to=RUB" | jq '.' || echo "❌ Ошибка при получении курса USD->RUB"
echo ""

# Тест 4: Конвертация валют
echo "4️⃣ Конвертация 100 USD в RUB:"
curl -s -X POST "$BASE_URL/api/v1/currencies/convert" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from_currency": "USD", "to_currency": "RUB"}' | jq '.' || echo "❌ Ошибка при конвертации"
echo ""

# Тест 5: Обновление курсов (требует админский токен)
if [ -n "$ADMIN_TOKEN" ]; then
  echo "5️⃣ Обновление курсов валют (админский доступ):"
  curl -s -X POST "$BASE_URL/api/v1/admin/currencies/update-rates" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.' || echo "❌ Ошибка при обновлении курсов"
  echo ""
else
  echo "5️⃣ Пропуск обновления курсов (не указан админский токен)"
  echo "   Для тестирования обновления курсов запустите:"
  echo "   ./test_currency_api.sh $BASE_URL YOUR_ADMIN_TOKEN"
  echo ""
fi

echo "✅ Тестирование завершено!" 