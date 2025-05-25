-- Миграция 001: Создание начальной схемы БД
-- Дата: 2024-01-01
-- Описание: Создание всех базовых таблиц для OneUIHub

-- Создание таблицы тарифов (должна быть первой, так как на неё ссылаются пользователи)
CREATE TABLE tiers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы компаний (должна быть перед моделями)
CREATE TABLE companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  description TEXT,
  external_id VARCHAR(255) UNIQUE,  -- ID в системе LiteLLM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы пользователей (после тарифов)
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tier_id VARCHAR(36) NOT NULL,
  role ENUM('customer', 'enterprise', 'support', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES tiers(id)
);

-- Создание таблицы трат пользователей (для автоматического повышения тарифа)
CREATE TABLE user_spendings (
  user_id VARCHAR(36) PRIMARY KEY,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Создание таблицы моделей (после компаний)
CREATE TABLE models (
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
CREATE TABLE model_configs (
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
CREATE TABLE rate_limits (
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
CREATE TABLE api_keys (
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
CREATE TABLE requests (
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
CREATE TABLE user_limits (
  user_id VARCHAR(36) PRIMARY KEY,
  monthly_token_limit BIGINT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 