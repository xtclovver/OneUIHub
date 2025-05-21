-- Создание базы данных
CREATE DATABASE IF NOT EXISTS oneaihub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE oneaihub;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  tier_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица тиров
CREATE TABLE IF NOT EXISTS tiers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица компаний
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(255),
  description TEXT,
  external_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица моделей
CREATE TABLE IF NOT EXISTS models (
  id VARCHAR(36) PRIMARY KEY,
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  features TEXT,
  external_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Таблица конфигураций моделей
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

-- Таблица ограничений запросов
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

-- Таблица API ключей
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  external_id VARCHAR(255),
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица запросов
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

-- Таблица лимитов пользователей
CREATE TABLE IF NOT EXISTS user_limits (
  user_id VARCHAR(36) PRIMARY KEY,
  monthly_token_limit BIGINT,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Добавление базовых тиров
INSERT INTO tiers (id, name, description, is_free, price) VALUES
('00000000-0000-0000-0000-000000000001', 'Free', 'Бесплатный план с базовыми возможностями', TRUE, 0.00),
('00000000-0000-0000-0000-000000000002', 'Starter', 'Стартовый план для небольших проектов', FALSE, 9.99),
('00000000-0000-0000-0000-000000000003', 'Pro', 'Профессиональный план для малого и среднего бизнеса', FALSE, 49.99),
('00000000-0000-0000-0000-000000000004', 'Enterprise', 'Корпоративный план для крупных компаний', FALSE, 199.99);

-- Добавление начального пользователя-администратора
INSERT INTO users (id, email, password_hash, tier_id) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@oneaihub.com', '$2a$10$i7J/1UbSiQR1jYnVPzjV2uQ6NT/KKaZWwVpE1y7s.Y4.SWdLU2o5y', '00000000-0000-0000-0000-000000000004');

-- Добавление лимитов для администратора
INSERT INTO user_limits (user_id, monthly_token_limit, balance) VALUES
('00000000-0000-0000-0000-000000000001', 1000000000, 1000.00); 