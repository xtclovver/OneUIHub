-- Инициализация базовых данных для OneUIHub

-- Создание базовых тарифов
INSERT INTO tiers (id, name, description, is_free, price, created_at) VALUES
('tier-free-001', 'Free', 'Бесплатный тариф с базовыми возможностями', true, 0.00, NOW()),
('tier-pro-001', 'Pro', 'Профессиональный тариф для разработчиков', false, 29.99, NOW()),
('tier-enterprise-001', 'Enterprise', 'Корпоративный тариф для больших команд', false, 99.99, NOW());

-- Создание администратора по умолчанию
-- Пароль: admin123 (хеш bcrypt)
INSERT INTO users (id, email, password_hash, tier_id, role, created_at, updated_at) VALUES
('user-admin-001', 'admin@oneui-hub.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tier-enterprise-001', 'admin', NOW(), NOW());

-- Создание лимитов для администратора
INSERT INTO user_limits (user_id, monthly_token_limit, balance) VALUES
('user-admin-001', NULL, 1000.00);

-- Создание базовых компаний AI провайдеров
INSERT INTO companies (id, name, logo_url, description, external_id, created_at, updated_at) VALUES
('company-openai-001', 'OpenAI', 'https://openai.com/favicon.ico', 'Создатель GPT моделей', 'openai', NOW(), NOW()),
('company-anthropic-001', 'Anthropic', 'https://anthropic.com/favicon.ico', 'Создатель Claude моделей', 'anthropic', NOW(), NOW()),
('company-google-001', 'Google', 'https://google.com/favicon.ico', 'Создатель Gemini моделей', 'google', NOW(), NOW()),
('company-meta-001', 'Meta', 'https://meta.com/favicon.ico', 'Создатель Llama моделей', 'meta', NOW(), NOW());

-- Создание базовых моделей
INSERT INTO models (id, company_id, name, description, features, external_id, created_at, updated_at) VALUES
-- OpenAI модели
('model-gpt-4-001', 'company-openai-001', 'GPT-4', 'Самая продвинутая модель OpenAI', 'Текст, код, анализ', 'gpt-4', NOW(), NOW()),
('model-gpt-3.5-001', 'company-openai-001', 'GPT-3.5 Turbo', 'Быстрая и эффективная модель', 'Текст, чат', 'gpt-3.5-turbo', NOW(), NOW()),

-- Anthropic модели
('model-claude-3-001', 'company-anthropic-001', 'Claude 3 Opus', 'Самая мощная модель Claude', 'Текст, анализ, код', 'claude-3-opus-20240229', NOW(), NOW()),
('model-claude-3-sonnet-001', 'company-anthropic-001', 'Claude 3 Sonnet', 'Сбалансированная модель Claude', 'Текст, анализ', 'claude-3-sonnet-20240229', NOW(), NOW()),

-- Google модели
('model-gemini-pro-001', 'company-google-001', 'Gemini Pro', 'Продвинутая модель Google', 'Текст, мультимодальность', 'gemini-pro', NOW(), NOW());

-- Конфигурации моделей
INSERT INTO model_configs (id, model_id, is_free, is_enabled, input_token_cost, output_token_cost, created_at, updated_at) VALUES
('config-gpt-4-001', 'model-gpt-4-001', false, true, 0.000030, 0.000060, NOW(), NOW()),
('config-gpt-3.5-001', 'model-gpt-3.5-001', true, true, 0.000001, 0.000002, NOW(), NOW()),
('config-claude-3-001', 'model-claude-3-001', false, true, 0.000015, 0.000075, NOW(), NOW()),
('config-claude-3-sonnet-001', 'model-claude-3-sonnet-001', false, true, 0.000003, 0.000015, NOW(), NOW()),
('config-gemini-pro-001', 'model-gemini-pro-001', true, true, 0.000001, 0.000002, NOW(), NOW());

-- Лимиты для тарифов
INSERT INTO rate_limits (id, model_id, tier_id, requests_per_minute, requests_per_day, tokens_per_minute, tokens_per_day, created_at, updated_at) VALUES
-- Free tier лимиты
('limit-free-gpt-3.5-001', 'model-gpt-3.5-001', 'tier-free-001', 3, 100, 1000, 10000, NOW(), NOW()),
('limit-free-gemini-001', 'model-gemini-pro-001', 'tier-free-001', 3, 100, 1000, 10000, NOW(), NOW()),

-- Pro tier лимиты
('limit-pro-gpt-4-001', 'model-gpt-4-001', 'tier-pro-001', 10, 1000, 5000, 100000, NOW(), NOW()),
('limit-pro-gpt-3.5-001', 'model-gpt-3.5-001', 'tier-pro-001', 20, 2000, 10000, 200000, NOW(), NOW()),
('limit-pro-claude-3-sonnet-001', 'model-claude-3-sonnet-001', 'tier-pro-001', 10, 1000, 5000, 100000, NOW(), NOW()),
('limit-pro-gemini-001', 'model-gemini-pro-001', 'tier-pro-001', 20, 2000, 10000, 200000, NOW(), NOW()),

-- Enterprise tier лимиты (без ограничений)
('limit-enterprise-gpt-4-001', 'model-gpt-4-001', 'tier-enterprise-001', 100, 10000, 50000, 1000000, NOW(), NOW()),
('limit-enterprise-gpt-3.5-001', 'model-gpt-3.5-001', 'tier-enterprise-001', 200, 20000, 100000, 2000000, NOW(), NOW()),
('limit-enterprise-claude-3-001', 'model-claude-3-001', 'tier-enterprise-001', 50, 5000, 25000, 500000, NOW(), NOW()),
('limit-enterprise-claude-3-sonnet-001', 'model-claude-3-sonnet-001', 'tier-enterprise-001', 100, 10000, 50000, 1000000, NOW(), NOW()),
('limit-enterprise-gemini-001', 'model-gemini-pro-001', 'tier-enterprise-001', 200, 20000, 100000, 2000000, NOW(), NOW()); 