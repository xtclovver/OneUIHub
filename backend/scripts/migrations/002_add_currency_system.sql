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