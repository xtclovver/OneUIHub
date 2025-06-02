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

# OneUI Hub

Платформа для управления AI моделями с поддержкой множественных валют и курсов обмена.

## Основные функции

- 🤖 Управление AI моделями и компаниями
- 💰 Система тарифов и лимитов
- 💱 **Поддержка множественных валют (USD/RUB)**
- 📊 Отслеживание использования и расходов
- 🔐 Система аутентификации и авторизации
- ⚙️ Интеграция с LiteLLM

## Система валют

### Возможности:
- Автоматическое получение курсов валют через внешний API
- Отображение цен моделей в USD и RUB
- Админская панель для управления курсами
- Автоматическое создание прямых и обратных курсов

### Настройка:
1. Получите API ключ на https://exchangerate-api.com/
2. Добавьте `EXCHANGE_RATE_API_KEY=your_key` в файл `.env`
3. Запустите сервер и обновите курсы через админскую панель

Подробная инструкция: [CURRENCY_SETUP.md](CURRENCY_SETUP.md)

## Быстрый старт

### Backend
```bash
cd backend
cp env.example .env
# Отредактируйте .env файл
go run cmd/server/main.go
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Тестирование API валют
```bash
./backend/scripts/test_currency_api.sh
```

## Структура проекта

```
OneUIHub/
├── backend/           # Go API сервер
│   ├── cmd/          # Точки входа
│   ├── internal/     # Внутренняя логика
│   │   ├── api/      # HTTP обработчики
│   │   ├── service/  # Бизнес-логика
│   │   └── domain/   # Доменные модели
│   └── scripts/      # Утилиты и скрипты
├── frontend/         # React приложение
│   ├── src/
│   │   ├── components/ # React компоненты
│   │   ├── hooks/     # Пользовательские хуки
│   │   └── types/     # TypeScript типы
└── uploads/          # Загруженные файлы
```

## API Endpoints

### Валюты
- `GET /api/v1/currencies` - Поддерживаемые валюты
- `GET /api/v1/currencies/exchange-rates` - Курсы валют
- `POST /api/v1/currencies/convert` - Конвертация валют
- `POST /api/v1/admin/currencies/update-rates` - Обновление курсов (админ)

### Модели
- `GET /api/v1/models` - Список моделей
- `GET /api/v1/models/:id` - Информация о модели

### Компании
- `GET /api/v1/companies` - Список компаний
- `GET /api/v1/companies/:id` - Информация о компании

## Технологии

### Backend:
- Go 1.21+
- Gin (HTTP framework)
- GORM (ORM)
- MySQL
- JWT аутентификация

### Frontend:
- React 18
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Framer Motion

## Лицензия

MIT License 

# OneUIHub

Унифицированный хаб для доступа к множественным AI моделям через единый API.

## Возможности

- 🔐 Аутентификация и авторизация пользователей
- 👥 Управление пользователями и ролями  
- 🏢 Управление компаниями и AI моделями
- 💰 Система тарифов и лимитов
- 🔑 Управление API ключами
- 📊 Отслеживание использования и затрат
- 🚀 Интеграция с LiteLLM
- 📱 Адаптивный дизайн для мобильных устройств

## Технологии

### Frontend
- **React 18** с TypeScript
- **Tailwind CSS** для стилизации
- **Redux Toolkit** для управления состоянием
- **React Router** для навигации
- **Framer Motion** для анимаций
- **Heroicons** для иконок

### Backend
- **Go 1.21** - основной язык
- **Gin** - веб-фреймворк
- **GORM** - ORM для работы с базой данных
- **MySQL** - база данных
- **JWT** - аутентификация
- **LiteLLM** - прокси для AI моделей

## Быстрый старт

### Предварительные требования

- Node.js 18+
- Go 1.21+
- MySQL 8.0+
- LiteLLM сервер (опционально)

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd OneUIHub
```

2. Настройте бэкенд:
```bash
cd backend
cp env.example .env
# Отредактируйте .env файл с вашими настройками
go mod tidy
```

3. Настройте фронтенд:
```bash
cd frontend
npm install
```

4. Создайте базу данных MySQL:
```sql
CREATE DATABASE oneui_hub;
```

5. Запустите бэкенд:
```bash
cd backend
go run cmd/server/main.go
```

6. Запустите фронтенд:
```bash
cd frontend
npm start
```

Приложение будет доступно по адресу `http://localhost:3000`

## Настройка для локальной сети и мобильных устройств

### Бэкенд

1. В файле `backend/.env` установите:
```env
SERVER_HOST=0.0.0.0
SERVER_PORT=8080
```

2. Узнайте IP адрес вашего компьютера:
```bash
# На macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# На Windows
ipconfig | findstr "IPv4"
```

### Фронтенд

1. Создайте файл `frontend/.env`:
```env
# Замените 192.168.1.100 на IP адрес вашего компьютера
REACT_APP_API_URL=http://192.168.1.100:8080/api/v1
HOST=0.0.0.0
PORT=3000
```

2. Запустите фронтенд:
```bash
cd frontend
npm start
```

Теперь приложение будет доступно с мобильных устройств по адресу `http://192.168.1.100:3000`

### Мобильная адаптивность

Приложение полностью адаптировано для мобильных устройств:

- ✅ Адаптивная навигация с мобильным меню
- ✅ Оптимизированные размеры кнопок и текста
- ✅ Улучшенная читаемость на маленьких экранах
- ✅ Сенсорно-дружественные элементы интерфейса
- ✅ Адаптивные сетки и отступы

## Структура проекта

```
OneUIHub/
├── frontend/          # React приложение
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── redux/         # Redux store и slices
│   │   ├── api/           # API клиент
│   │   ├── types/         # TypeScript типы
│   │   └── utils/         # Утилиты
│   └── public/
├── backend/           # Go сервер
│   ├── cmd/server/        # Точка входа
│   ├── internal/          # Внутренняя логика
│   │   ├── api/           # HTTP handlers и routes
│   │   ├── domain/        # Модели данных
│   │   ├── service/       # Бизнес-логика
│   │   └── repository/    # Доступ к данным
│   └── pkg/               # Общие пакеты
└── uploads/           # Загруженные файлы
```

## API Документация

### Аутентификация

#### Регистрация
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "tier_name": "free"
}
```

#### Вход
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Компании
```
GET /api/v1/companies          # Список компаний
GET /api/v1/companies/:id      # Детали компании
```

### Модели
```
GET /api/v1/models             # Список моделей
GET /api/v1/models/:id         # Детали модели
```

## Разработка

### Запуск в режиме разработки

Бэкенд:
```bash
cd backend
go run cmd/server/main.go
```

Фронтенд:
```bash
cd frontend
npm start
```

### Тестирование

```bash
# Бэкенд
cd backend
go test ./...

# Фронтенд
cd frontend
npm test
```

### Сборка для продакшена

```bash
# Фронтенд
cd frontend
npm run build

# Бэкенд
cd backend
go build -o bin/server cmd/server/main.go
```

## Docker

Запуск с помощью Docker Compose:

```bash
docker-compose up -d
```

## Лицензия

MIT 