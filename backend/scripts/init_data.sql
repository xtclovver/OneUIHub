-- Инициализация базовых данных для OneUIHub
-- Выполнять после создания таблиц из create_database.sql

-- Создание базовых тарифов (price = сумма трат в USD для перехода на тариф)
INSERT INTO tiers (id, name, description, is_free, price, created_at) VALUES
('tier-free-001', 'Free', 'Бесплатный тариф с базовыми возможностями', true, 0.00, NOW()),
('tier-starter-001', 'Starter', 'Стартовый тариф - открывается после трат на $10', false, 10.00, NOW()),
('tier-pro-001', 'Pro', 'Профессиональный тариф - открывается после трат на $100', false, 100.00, NOW()),
('tier-enterprise-001', 'Enterprise', 'Корпоративный тариф - открывается после трат на $1000', false, 1000.00, NOW());

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
('user-admin-001', 'admin@oneui-hub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tier-enterprise-001', 'admin', NOW(), NOW());

-- Создание записи трат для администратора
INSERT INTO user_spendings (user_id, total_spent, created_at, updated_at) VALUES
('user-admin-001', 0.00, NOW(), NOW());

-- Создание лимитов для администратора
INSERT INTO user_limits (user_id, monthly_token_limit, balance) VALUES
('user-admin-001', NULL, 1000.00);

-- Модели будут синхронизироваться автоматически из LiteLLM через эндпоинт /model_group/info
-- Конфигурации моделей и лимиты тарифов также создаются автоматически при синхронизации 