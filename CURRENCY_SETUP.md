# Настройка системы валют

## 1. Получение API ключа

1. Перейдите на https://exchangerate-api.com/
2. Зарегистрируйтесь и получите бесплатный API ключ
3. Бесплатный план включает 1500 запросов в месяц

## 2. Настройка переменных окружения

Скопируйте файл env.example в .env:
```bash
cp backend/env.example backend/.env
```

Отредактируйте .env файл и добавьте ваш API ключ:
```
EXCHANGE_RATE_API_KEY=your_actual_api_key_here
```

## 3. Инициализация базы данных

Убедитесь, что в базе данных созданы таблицы currencies и exchange_rates:
```sql
-- Валюты
INSERT IGNORE INTO currencies (id, name, symbol) VALUES 
('USD', 'US Dollar', '$'),
('RUB', 'Russian Ruble', '₽');
```

## 4. Тестирование API

### Получение поддерживаемых валют:
```bash
curl http://localhost:8080/api/v1/currencies
```

### Получение курсов валют:
```bash
curl http://localhost:8080/api/v1/currencies/exchange-rates
```

### Обновление курсов (требует авторизации админа):
```bash
curl -X POST http://localhost:8080/api/v1/admin/currencies/update-rates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 5. Использование в интерфейсе

- Цены моделей автоматически отображаются в USD и RUB
- В админской панели есть раздел "Управление валютами"
- Курсы можно обновлять вручную через интерфейс

## Структура API ответа

API exchangerate-api.com возвращает данные в формате:
```json
{
  "result": "success",
  "base_code": "USD",
  "conversion_rates": {
    "USD": 1,
    "RUB": 95.0,
    "EUR": 0.85
  }
}
```

Система автоматически сохраняет курс USD->RUB и обратный курс RUB->USD.

## Реализованные функции

### Backend:
- ✅ Конфигурация API ключа через переменные окружения
- ✅ Сервис для работы с курсами валют
- ✅ API эндпоинты для получения и обновления курсов
- ✅ Автоматическое создание прямых и обратных курсов
- ✅ Админский эндпоинт для обновления курсов

### Frontend:
- ✅ Хук useCurrency для работы с валютами
- ✅ Отображение цен в USD и RUB на карточках моделей
- ✅ Отображение цен в USD и RUB на странице модели
- ✅ Компонент CurrencyManagement для админской панели
- ✅ Автоматическое обновление курсов через интерфейс

## Примеры использования

### В компонентах React:
```typescript
import { useCurrency } from '../hooks/useCurrency';

const MyComponent = () => {
  const { getPriceInBothCurrencies, loading } = useCurrency();
  
  const usdPrice = 0.00003; // цена за токен в USD
  const prices = getPriceInBothCurrencies(usdPrice * 1000); // за 1K токенов
  
  return (
    <div>
      <p>USD: {prices.usd}</p>
      <p>RUB: {prices.rub}</p>
    </div>
  );
};
```

### Обновление курсов:
```typescript
const { updateExchangeRates } = useCurrency();

const handleUpdate = async () => {
  const success = await updateExchangeRates();
  if (success) {
    console.log('Курсы обновлены!');
  }
};
``` 