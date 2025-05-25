# OneUIHub Backend API Documentation

## Обзор

OneUIHub Backend предоставляет REST API для управления моделями ИИ и бюджетами через интеграцию с LiteLLM. Все административные эндпоинты требуют аутентификации и прав администратора.

## Базовый URL

```
http://localhost:8080/api/v1
```

## Аутентификация

Все защищенные эндпоинты требуют JWT токен в заголовке Authorization:

```
Authorization: Bearer <your-jwt-token>
```

## Эндпоинты для управления моделями

### Синхронизация моделей с LiteLLM

**POST** `/admin/models/sync`

Синхронизирует модели из LiteLLM с локальной базой данных.

**Ответ:**
```json
{
  "message": "Models synchronized successfully"
}
```

### Получение всех моделей из БД

**GET** `/admin/models`

**Ответ:**
```json
{
  "models": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "name": "gpt-4",
      "description": "GPT-4 model",
      "features": "Advanced language model",
      "external_id": "gpt-4",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Получение модели по ID

**GET** `/admin/models/{id}`

**Ответ:**
```json
{
  "model": {
    "id": "uuid",
    "company_id": "uuid",
    "name": "gpt-4",
    "description": "GPT-4 model",
    "features": "Advanced language model",
    "external_id": "gpt-4"
  }
}
```

### Создание модели в БД

**POST** `/admin/models`

**Тело запроса:**
```json
{
  "company_id": "uuid",
  "name": "custom-model",
  "description": "Custom AI model",
  "features": "Custom features"
}
```

### Обновление модели в БД

**PUT** `/admin/models/{id}`

**Тело запроса:**
```json
{
  "name": "updated-model-name",
  "description": "Updated description"
}
```

### Удаление модели

**DELETE** `/admin/models/{id}`

Удаляет модель из БД и LiteLLM (если есть external_id).

### Получение моделей из LiteLLM

**GET** `/admin/models/litellm`

**Ответ:**
```json
{
  "models": [
    {
      "id": "gpt-4",
      "object": "model",
      "owned_by": "openai",
      "max_tokens": 8192,
      "pricing": {
        "input_cost_per_token": 0.00003,
        "output_cost_per_token": 0.00006
      }
    }
  ]
}
```

### Получение информации о модели из LiteLLM

**GET** `/admin/models/litellm/{model_id}`

### Создание модели в LiteLLM

**POST** `/admin/models/litellm`

**Тело запроса:**
```json
{
  "model_name": "custom-model",
  "litellm_params": {
    "model": "openai/gpt-4",
    "api_key": "your-api-key"
  },
  "model_info": {
    "mode": "chat",
    "input_cost_per_token": 0.00003,
    "output_cost_per_token": 0.00006,
    "max_tokens": 8192
  }
}
```

### Обновление модели в LiteLLM

**PUT** `/admin/models/litellm`

**Тело запроса:**
```json
{
  "model_id": "model-id",
  "model_name": "updated-model-name",
  "model_info": {
    "input_cost_per_token": 0.00004
  }
}
```

### Удаление модели из LiteLLM

**DELETE** `/admin/models/litellm/{model_id}`

## Эндпоинты для управления бюджетами

### Синхронизация бюджетов с LiteLLM

**POST** `/admin/budgets/sync`

### Получение всех бюджетов из БД

**GET** `/admin/budgets`

**Ответ:**
```json
{
  "budgets": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "team_id": "uuid",
      "max_budget": 100.00,
      "spent_budget": 25.50,
      "budget_duration": "monthly",
      "reset_at": "2024-02-01T00:00:00Z",
      "external_id": "litellm-budget-id"
    }
  ]
}
```

### Получение бюджета по ID

**GET** `/admin/budgets/{id}`

### Получение бюджетов пользователя

**GET** `/admin/budgets/user/{user_id}`

### Создание бюджета в БД

**POST** `/admin/budgets`

**Тело запроса:**
```json
{
  "user_id": "uuid",
  "max_budget": 100.00,
  "budget_duration": "monthly",
  "reset_at": "2024-02-01T00:00:00Z"
}
```

### Обновление бюджета в БД

**PUT** `/admin/budgets/{id}`

**Тело запроса:**
```json
{
  "max_budget": 150.00,
  "budget_duration": "weekly"
}
```

### Удаление бюджета

**DELETE** `/admin/budgets/{id}`

### Получение бюджетов из LiteLLM

**GET** `/admin/budgets/litellm`

### Получение информации о бюджете из LiteLLM

**GET** `/admin/budgets/litellm/{budget_id}`

### Получение настроек бюджета из LiteLLM

**GET** `/admin/budgets/litellm/settings`

### Создание бюджета в LiteLLM

**POST** `/admin/budgets/litellm`

**Тело запроса:**
```json
{
  "user_id": "user-123",
  "max_budget": 100.00,
  "budget_duration": "monthly"
}
```

### Обновление бюджета в LiteLLM

**PUT** `/admin/budgets/litellm`

**Тело запроса:**
```json
{
  "id": "budget-id",
  "max_budget": 150.00,
  "budget_duration": "weekly"
}
```

### Удаление бюджета из LiteLLM

**DELETE** `/admin/budgets/litellm/{budget_id}`

## Коды ошибок

- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## Примеры использования

### Синхронизация моделей

```bash
curl -X POST http://localhost:8080/api/v1/admin/models/sync \
  -H "Authorization: Bearer your-jwt-token"
```

### Получение списка моделей из LiteLLM

```bash
curl -X GET http://localhost:8080/api/v1/admin/models/litellm \
  -H "Authorization: Bearer your-jwt-token"
```

### Создание бюджета

```bash
curl -X POST http://localhost:8080/api/v1/admin/budgets \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-123",
    "max_budget": 100.00,
    "budget_duration": "monthly"
  }'
```

## Конфигурация LiteLLM

Для работы с LiteLLM необходимо настроить следующие переменные окружения:

```env
LITELLM_BASE_URL=http://localhost:4000
LITELLM_API_KEY=sk-SZQ85Nd1gd0gkzIbjbAajg
LITELLM_TIMEOUT=30s
```

## Архитектура

Система построена на следующих принципах:

1. **Двойное хранение**: Модели и бюджеты хранятся как в локальной БД, так и в LiteLLM
2. **Синхронизация**: Администратор может синхронизировать данные между системами
3. **Прямое управление**: Возможность напрямую управлять ресурсами в LiteLLM
4. **Аудит**: Все изменения логируются и отслеживаются

Это позволяет администратору гибко управлять моделями и бюджетами, обеспечивая при этом надежность и контроль доступа. 