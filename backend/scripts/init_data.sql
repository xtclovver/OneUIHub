-- Создание базы данных OneUIHub
-- Выполнять от имени пользователя с правами создания БД

CREATE DATABASE IF NOT EXISTS oneui_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oneui_hub;

-- Создание таблицы тарифов (должна быть первой, так как на неё ссылаются пользователи)
CREATE TABLE IF NOT EXISTS tiers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы компаний (должна быть перед моделями)
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  description TEXT,
  external_id VARCHAR(255) UNIQUE,  -- ID в системе LiteLLM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы пользователей (после тарифов)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NULL,
  password_hash VARCHAR(255) NOT NULL,
  tier_id VARCHAR(36) NOT NULL,
  role ENUM('customer', 'enterprise', 'support', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES tiers(id)
);

-- Создание таблицы валют
CREATE TABLE IF NOT EXISTS currencies (
  id VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL
);

-- Создание таблицы курсов валют
CREATE TABLE IF NOT EXISTS exchange_rates (
  id VARCHAR(36) PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,8) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (from_currency) REFERENCES currencies(id),
  FOREIGN KEY (to_currency) REFERENCES currencies(id),
  UNIQUE KEY unique_currency_pair (from_currency, to_currency)
);

-- Создание таблицы трат пользователей (для автоматического повышения тарифа)
CREATE TABLE IF NOT EXISTS user_spendings (
  user_id VARCHAR(36) PRIMARY KEY,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы моделей (после компаний)
CREATE TABLE IF NOT EXISTS models (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  features TEXT,
  external_id VARCHAR(255) UNIQUE,  -- ID в системе LiteLLM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Создание таблицы конфигураций моделей (после моделей)
CREATE TABLE IF NOT EXISTS model_configs (
  id VARCHAR(36) PRIMARY KEY,
  model_id VARCHAR(36) NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  is_enabled BOOLEAN DEFAULT TRUE,
  input_token_cost DECIMAL(10, 6),
  output_token_cost DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Создание таблицы лимитов (после моделей и тарифов)
CREATE TABLE IF NOT EXISTS rate_limits (
  id VARCHAR(36) PRIMARY KEY,
  model_id VARCHAR(36) NOT NULL,
  tier_id VARCHAR(36) NOT NULL,
  requests_per_minute INT DEFAULT 0,
  requests_per_day INT DEFAULT 0,
  tokens_per_minute INT DEFAULT 0,
  tokens_per_day INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
  FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE CASCADE,
  UNIQUE KEY unique_model_tier (model_id, tier_id)
);

-- Создание таблицы API ключей (после пользователей)
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  external_id VARCHAR(255),  -- ID в системе LiteLLM
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы запросов (после пользователей и моделей)
CREATE TABLE IF NOT EXISTS requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  model_id VARCHAR(36) NOT NULL,
  input_tokens INT NOT NULL,
  output_tokens INT NOT NULL,
  input_cost DECIMAL(10, 6) NOT NULL,
  output_cost DECIMAL(10, 6) NOT NULL,
  total_cost DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- Создание таблицы лимитов пользователей (после пользователей)
CREATE TABLE IF NOT EXISTS user_limits (
  user_id VARCHAR(36) PRIMARY KEY,
  monthly_token_limit BIGINT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы бюджетов (если нужна)
CREATE TABLE IF NOT EXISTS budgets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  external_id VARCHAR(255),
  name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 
-- Миграция для добавления новых полей возможностей модели из LiteLLM
-- Дата: 2024-01-XX

-- Проверяем и добавляем поля только если они не существуют
-- Добавляем поле providers если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'providers');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN providers TEXT COMMENT ''JSON массив провайдеров''', 'SELECT ''Column providers already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле max_input_tokens если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'max_input_tokens');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN max_input_tokens INT COMMENT ''Максимальное количество входных токенов''', 'SELECT ''Column max_input_tokens already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле max_output_tokens если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'max_output_tokens');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN max_output_tokens INT COMMENT ''Максимальное количество выходных токенов''', 'SELECT ''Column max_output_tokens already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле mode если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'mode');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN mode VARCHAR(50) COMMENT ''Режим работы модели (chat, completion, etc)''', 'SELECT ''Column mode already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле supports_parallel_function_calling если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'supports_parallel_function_calling');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN supports_parallel_function_calling BOOLEAN DEFAULT FALSE COMMENT ''Поддержка параллельного вызова функций''', 'SELECT ''Column supports_parallel_function_calling already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле supports_vision если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'supports_vision');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN supports_vision BOOLEAN DEFAULT FALSE COMMENT ''Поддержка анализа изображений''', 'SELECT ''Column supports_vision already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле supports_web_search если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'supports_web_search');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN supports_web_search BOOLEAN DEFAULT FALSE COMMENT ''Поддержка веб поиска''', 'SELECT ''Column supports_web_search already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле supports_reasoning если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'supports_reasoning');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN supports_reasoning BOOLEAN DEFAULT FALSE COMMENT ''Поддержка аналитического мышления''', 'SELECT ''Column supports_reasoning already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле supports_function_calling если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'supports_function_calling');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN supports_function_calling BOOLEAN DEFAULT FALSE COMMENT ''Поддержка вызова функций''', 'SELECT ''Column supports_function_calling already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем поле supported_openai_params если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'models' AND COLUMN_NAME = 'supported_openai_params');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE models ADD COLUMN supported_openai_params TEXT COMMENT ''JSON массив поддерживаемых параметров OpenAI API''', 'SELECT ''Column supported_openai_params already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Временно отключаем безопасный режим для обновления
SET SQL_SAFE_UPDATES = 0;

-- Обновляем существующие записи, устанавливая значения по умолчанию
UPDATE models SET 
  providers = '[]',
  mode = 'chat',
  supports_parallel_function_calling = FALSE,
  supports_vision = FALSE,
  supports_web_search = FALSE,
  supports_reasoning = FALSE,
  supports_function_calling = FALSE,
  supported_openai_params = '[]'
WHERE providers IS NULL;

-- Включаем обратно безопасный режим
SET SQL_SAFE_UPDATES = 1;

-- Миграция для добавления системы валют и отслеживания трат
-- Дата: 2024-01-XX

-- Создание таблицы валют
CREATE TABLE IF NOT EXISTS currencies (
  id VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL
);

-- Создание таблицы курсов валют
CREATE TABLE IF NOT EXISTS exchange_rates (
  id VARCHAR(36) PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15,8) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (from_currency) REFERENCES currencies(id),
  FOREIGN KEY (to_currency) REFERENCES currencies(id),
  UNIQUE KEY unique_currency_pair (from_currency, to_currency)
);

-- Создание таблицы для отслеживания общих трат пользователей
CREATE TABLE IF NOT EXISTS user_spendings (
  user_id VARCHAR(36) PRIMARY KEY,
  total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Вставляем базовые валюты
INSERT IGNORE INTO currencies (id, name, symbol) VALUES 
('USD', 'US Dollar', '$'),
('RUB', 'Russian Ruble', '₽');

-- Создаем базовые записи user_spendings для существующих пользователей
INSERT INTO user_spendings (user_id, total_spent)
SELECT id, 0.00 FROM users
WHERE id NOT IN (SELECT user_id FROM user_spendings); 

-- Инициализация базовых данных для OneUIHub
-- Выполнять после создания таблиц из create_database.sql

-- Создание базовых тарифов (price = сумма трат в USD для перехода на тариф)
INSERT INTO tiers (id, name, description, is_free, price, created_at) VALUES
('tier-free-001', 'Free', 'Бесплатный тариф с базовыми возможностями', true, 0.00, NOW()),
('tier-starter-001', 'Starter', 'Стартовый тариф - открывается после трат на $10', false, 10.00, NOW()),
('tier-pro-001', 'Pro', 'Профессиональный тариф - открывается после трат на $100', false, 100.00, NOW()),
('tier-enterprise-001', 'Enterprise', 'Корпоративный тариф - открывается после трат на $1000', false, 1000.00, NOW());

-- Создание базовых валют
INSERT INTO currencies (id, name, symbol) VALUES 
('USD', 'US Dollar', '$'),
('RUB', 'Russian Ruble', '₽');

-- Создание базовых компаний AI провайдеров (администратор может редактировать)
INSERT INTO companies (id, name, logo_url, description, external_id, created_at, updated_at) VALUES
('company-openai-001', 'OpenAI', 'https://openai.com/favicon.ico', 'Создатель GPT моделей', 'openai', NOW(), NOW()),
('company-anthropic-001', 'Anthropic', 'https://anthropic.com/favicon.ico', 'Создатель Claude моделей', 'anthropic', NOW(), NOW()),
('company-google-001', 'Google', 'https://google.com/favicon.ico', 'Создатель Gemini моделей', 'google', NOW(), NOW()),
('company-meta-001', 'Meta', 'https://meta.com/favicon.ico', 'Создатель Llama моделей', 'meta', NOW(), NOW()),
('company-mistral-001', 'Mistral AI', 'https://mistral.ai/favicon.ico', 'Создатель Mistral моделей', 'mistral', NOW(), NOW()),
('company-cohere-001', 'Cohere', 'https://cohere.ai/favicon.ico', 'Создатель Command моделей', 'cohere', NOW(), NOW());

-- Создание администратора по умолчанию
-- Пароль: admin123 (хеш bcrypt)
INSERT INTO users (id, email, password_hash, tier_id, role, created_at, updated_at) VALUES
('user-admin-001', 'admin@oneaihub.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjPeGvGzluqHveYfnwdq6hfOuFq/9G', 'tier-enterprise-001', 'admin', NOW(), NOW());

-- Создание записи трат для администратора
INSERT INTO user_spendings (user_id, total_spent, created_at, updated_at) VALUES
('user-admin-001', 0.00, NOW(), NOW());

-- Создание лимитов для администратора
INSERT INTO user_limits (user_id, monthly_token_limit, balance) VALUES
('user-admin-001', NULL, 1000.00);

-- Модели будут синхронизироваться автоматически из LiteLLM через эндпоинт /model_group/info
-- Конфигурации моделей и лимиты тарифов также создаются автоматически при синхронизации 