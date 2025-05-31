# OneUI Hub - Реализация отображения запросов пользователя

## Новая функциональность

Реализована полная система отображения истории запросов пользователя к LiteLLM API с детальной информацией о каждом запросе.

### Что было добавлено

#### Backend

1. **Обновлен LiteLLM клиент** (`backend/internal/litellm/client.go`):
   - Добавлен метод `GetSpendLogsByAPIKey()` для получения логов по API ключу
   - Обновлен метод `newRequest()` для правильной авторизации с LiteLLM
   - Добавлена поддержка заголовка `x-litellm-api-key`

2. **Обновлен User Handler** (`backend/internal/api/handlers/user_handler.go`):
   - Полностью переписан метод `GetRequestHistory()`
   - Добавлена поддержка получения логов через API ключи пользователя
   - Реализована пагинация и сортировка
   - Добавлена обработка всех полей из LiteLLM ответа

#### Frontend

1. **Обновлен API клиент** (`frontend/src/api/litellm.ts`):
   - Добавлены новые интерфейсы `LiteLLMRequest` и `LiteLLMRequestHistoryResponse`
   - Обновлен метод `getRequestHistory()` с поддержкой пагинации

2. **Обновлен Redux slice** (`frontend/src/redux/slices/litellmSlice.ts`):
   - Добавлена поддержка метаданных пагинации
   - Реализована функция добавления данных (append) для пагинации
   - Добавлен action `clearRequestHistory`

3. **Обновлена страница профиля** (`frontend/src/pages/Profile/ProfilePage.tsx`):
   - Полностью переписана секция отображения запросов
   - Добавлено модальное окно для детального просмотра запросов
   - Реализована пагинация с кнопкой "Загрузить ещё"
   - Добавлены фильтры и детальная информация о каждом запросе

### Особенности реализации

#### Получение данных
- Система получает логи через API ключи пользователя, а не через user_id
- Это соответствует примеру curl запроса: `curl -X 'GET' 'http://localhost:4000/spend/logs?api_key=sk-2ZjrQ9ZjzpQ2ehC6ivjXPA'`
- Поддерживается авторизация через заголовок `x-litellm-api-key`

#### Отображение данных
Каждый запрос показывает:
- **Основная информация**: модель, провайдер, статус, время выполнения
- **Токены**: входящие, исходящие, общее количество
- **Стоимость**: точная стоимость запроса в долларах
- **Метаданные**: API ключ, сессия, кэширование
- **Теги**: пользовательские теги запроса
- **Детали**: полная информация в модальном окне

#### Пагинация
- Загрузка по 50 запросов за раз
- Кнопка "Загрузить ещё" для дополнительных данных
- Счетчик показанных/общих запросов
- Сортировка по времени (новые сначала)

#### Модальное окно деталей
- Обзор основных параметров запроса
- Метаданные в JSON формате
- Сообщения запроса (если доступны)
- Ответ сервера (если доступен)
- Возможность копирования данных

### API Endpoints

#### GET `/api/v1/users/{user_id}/requests`

Получает историю запросов пользователя.

**Параметры запроса:**
- `limit` (optional): количество запросов (по умолчанию 50)
- `offset` (optional): смещение для пагинации (по умолчанию 0)

**Ответ:**
```json
{
  "requests": [
    {
      "id": "chatcmpl-d1ce4d4b-72dc-42e5-a12e-9575fa4febe1",
      "request_id": "chatcmpl-d1ce4d4b-72dc-42e5-a12e-9575fa4febe1",
      "call_type": "acompletion",
      "api_key": "db9041132426059d9a81431986c230ca2ebcc27c28b19e6c9d4b6e55be104f04",
      "api_key_name": "Test Key",
      "api_key_id": "uuid",
      "model": "gemini-2.5-flash-preview-05-20",
      "model_group": "gemini/gemini-2.5-flash-preview-05-20",
      "custom_llm_provider": "gemini",
      "user": "user-admin-001",
      "cost": 0.00000465,
      "spend": 0.00000465,
      "total_tokens": 10,
      "input_tokens": 3,
      "output_tokens": 7,
      "prompt_tokens": 3,
      "completion_tokens": 7,
      "start_time": "2025-05-31T07:45:33.343000Z",
      "end_time": "2025-05-31T07:45:35.807000Z",
      "completion_start_time": "2025-05-31T07:45:35.728000Z",
      "created_at": "2025-05-31T07:45:33.343000Z",
      "session_id": "c52d43cc-debe-4654-877d-dd9231749d0f",
      "status": "success",
      "cache_hit": "False",
      "cache_key": "Cache OFF",
      "request_tags": [],
      "team_id": "",
      "end_user": "",
      "requester_ip_address": "",
      "api_base": "https://generativelanguage.googleapis.com/...",
      "metadata": { ... },
      "messages": { ... },
      "response": { ... },
      "proxy_server_request": { ... }
    }
  ],
  "total_count": 150,
  "limit": 50,
  "offset": 0,
  "has_more": true
}
```

### Использование

1. Перейдите на страницу профиля
2. Выберите вкладку "Запросы"
3. Просмотрите список ваших запросов к AI моделям
4. Нажмите "Детали" или "Просмотр" для подробной информации
5. Используйте "Загрузить ещё" для просмотра дополнительных запросов

### Технические детали

#### Авторизация с LiteLLM
```go
req.Header.Set("Authorization", "Bearer "+c.apiKey)
req.Header.Set("x-litellm-api-key", c.apiKey)
```

#### Получение логов по API ключам
```go
func (h *UserHandler) GetRequestHistory(c *gin.Context) {
    // Получаем API ключи пользователя
    apiKeys, err := h.apiKeyRepo.GetByUserID(c.Request.Context(), userID)
    
    // Собираем логи со всех ключей
    for _, apiKey := range apiKeys {
        logs, err := h.litellmClient.GetSpendLogsByAPIKey(c.Request.Context(), apiKey.ExternalID)
        // Обрабатываем логи...
    }
}
```

#### Пагинация на фронтенде
```typescript
dispatch(fetchRequestHistory({ 
  userId: user.id, 
  limit: 50, 
  offset: nextOffset,
  append: true  // Добавляем к существующим данным
}) as any);
```

Эта реализация обеспечивает полную функциональность просмотра истории запросов пользователя с детальной информацией о каждом запросе, включая метаданные, сообщения и ответы от AI моделей. 