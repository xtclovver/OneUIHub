#!/bin/bash

# Скрипт для тестирования синхронизации моделей с LiteLLM
# Убедитесь, что сервер запущен на localhost:8080

BASE_URL="http://localhost:8080/api/v1"
ADMIN_TOKEN="your-admin-token-here"

echo "🔄 Тестирование синхронизации моделей с LiteLLM..."

# Функция для выполнения HTTP запросов
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "$data" \
            "$BASE_URL$endpoint"
    else
        curl -s -X $method \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            "$BASE_URL$endpoint"
    fi
}

echo "📡 Получение информации о model_group из LiteLLM..."
response=$(make_request GET "/admin/models/litellm/model-group")
echo "Ответ: $response"
echo ""

echo "🔄 Синхронизация моделей из model_group..."
response=$(make_request POST "/admin/models/sync-model-group")
echo "Ответ: $response"
echo ""

echo "📋 Получение списка синхронизированных моделей..."
response=$(make_request GET "/admin/models")
echo "Ответ: $response"
echo ""

echo "✅ Тестирование завершено!" 