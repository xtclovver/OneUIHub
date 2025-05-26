# Исправление ошибки "Incorrect datetime value: '0000-00-00'"

## Описание проблемы

Ошибка `Error 1292 (22007): Incorrect datetime value: '0000-00-00' for column 'created_at' at row 1` возникает при попытке сохранить модель в базу данных MySQL.

Причина: GORM пытается вставить нулевое значение времени Go (`time.Time{}`), которое конвертируется в недопустимое для MySQL значение `'0000-00-00'`.

## Решение

### 1. Обновление структур моделей

Добавлены правильные GORM теги для автоматического управления временными метками:

```go
type Model struct {
    // ... другие поля ...
    CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
    UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
```

Исправлены следующие модели:
- `Model`
- `ModelConfig`
- `Company`
- `User`
- `RateLimit`
- `ApiKey`
- `Request`
- `Budget`
- `ExchangeRate`
- `UserSpending`
- `Tier`

### 2. Обновление конфигурации базы данных

В `pkg/database/database.go` добавлены:

1. **Настройка NowFunc** для GORM:
```go
NowFunc: func() time.Time {
    return time.Now().Local()
}
```

2. **SQL режим для MySQL**:
```sql
SET sql_mode = 'TRADITIONAL,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'
```

3. **Автоматическое исправление** существующих некорректных значений при миграции.

### 3. Автоматическое исправление данных

Функция `fixDatetimeValues()` автоматически исправляет:
- Значения `'0000-00-00 00:00:00'`
- NULL значения
- Значения `'0001-01-01 00:00:00'` (нулевое время Go)

## Применение исправлений

### Автоматическое исправление

Исправления применяются автоматически при запуске приложения через миграцию:

```bash
cd backend
go run cmd/server/main.go
```

### Ручное исправление (опционально)

Если нужно применить исправления вручную:

```bash
cd backend
mysql -u username -p oneui_hub < scripts/fix_datetime_migration.sql
```

### Тестирование

Запустите тестовый скрипт для проверки:

```bash
cd backend
go run scripts/test_datetime_fix.go
```

## Что изменилось

### До исправления:
```go
CreatedAt time.Time `json:"created_at"`
UpdatedAt time.Time `json:"updated_at"`
```

### После исправления:
```go
CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
```

## Преимущества

1. **Автоматическое управление временными метками** - GORM автоматически устанавливает текущее время
2. **Предотвращение ошибок** - исключает возможность вставки некорректных значений
3. **Совместимость с MySQL** - правильная работа с режимами SQL
4. **Автоматическое исправление** - существующие данные исправляются при миграции

## Проверка результата

После применения исправлений:

1. Новые записи автоматически получают корректные временные метки
2. Существующие записи с некорректными значениями исправляются
3. Операции создания и обновления моделей работают без ошибок

## Дополнительные настройки MySQL

Для предотвращения подобных проблем в будущем рекомендуется настроить MySQL:

```sql
-- В my.cnf или my.ini
[mysqld]
sql_mode = "TRADITIONAL,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"
``` 