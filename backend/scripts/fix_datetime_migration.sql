-- Миграция для исправления некорректных значений datetime
-- Дата: 2024-01-XX
-- Описание: Исправляет значения '0000-00-00' в полях created_at и updated_at

USE oneui_hub;

-- Временно отключаем безопасный режим для массовых обновлений
SET SQL_SAFE_UPDATES = 0;

-- Устанавливаем правильный SQL режим
SET sql_mode = 'TRADITIONAL,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Исправляем таблицу models
UPDATE models 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE models 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу model_configs
UPDATE model_configs 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE model_configs 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу companies
UPDATE companies 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE companies 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу users
UPDATE users 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE users 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу rate_limits
UPDATE rate_limits 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE rate_limits 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу api_keys
UPDATE api_keys 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

-- Исправляем таблицу requests
UPDATE requests 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

-- Исправляем таблицу budgets
UPDATE budgets 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE budgets 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу exchange_rates
UPDATE exchange_rates 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу user_spendings
UPDATE user_spendings 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Исправляем таблицу tiers
UPDATE tiers 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

-- Включаем обратно безопасный режим
SET SQL_SAFE_UPDATES = 1;

-- Изменяем структуру таблиц для предотвращения будущих проблем
-- Устанавливаем DEFAULT CURRENT_TIMESTAMP для полей created_at и updated_at

-- Модели
ALTER TABLE models 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Конфигурации моделей
ALTER TABLE model_configs 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Компании
ALTER TABLE companies 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Пользователи
ALTER TABLE users 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Лимиты
ALTER TABLE rate_limits 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- API ключи
ALTER TABLE api_keys 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Запросы
ALTER TABLE requests 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Бюджеты
ALTER TABLE budgets 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Курсы валют
ALTER TABLE exchange_rates 
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Траты пользователей
ALTER TABLE user_spendings 
MODIFY COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Тарифы
ALTER TABLE tiers 
MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

COMMIT; 