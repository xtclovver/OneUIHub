USE oneui_hub;

-- Процедура для безопасного добавления колонок
DELIMITER $$
CREATE PROCEDURE AddApiKeyFields()
BEGIN
    DECLARE original_key_exists INT DEFAULT 0;
    DECLARE api_key_preview_exists INT DEFAULT 0;
    
    -- Проверяем существование колонки original_key
    SELECT COUNT(*) INTO original_key_exists 
    FROM information_schema.columns 
    WHERE table_schema = 'oneui_hub' 
    AND table_name = 'api_keys' 
    AND column_name = 'original_key';
    
    -- Проверяем существование колонки api_key_preview
    SELECT COUNT(*) INTO api_key_preview_exists 
    FROM information_schema.columns 
    WHERE table_schema = 'oneui_hub' 
    AND table_name = 'api_keys' 
    AND column_name = 'api_key_preview';
    
    -- Добавляем колонку original_key если её нет
    IF original_key_exists = 0 THEN
        ALTER TABLE api_keys ADD COLUMN original_key TEXT COMMENT 'Зашифрованный оригинальный API ключ';
    END IF;
    
    -- Добавляем колонку api_key_preview если её нет
    IF api_key_preview_exists = 0 THEN
        ALTER TABLE api_keys ADD COLUMN api_key_preview VARCHAR(20) COMMENT 'Превью ключа для отображения (первые 5 и последние 5 символов)';
    END IF;
END$$
DELIMITER ;

-- Выполняем процедуру
CALL AddApiKeyFields();

-- Удаляем процедуру
DROP PROCEDURE AddApiKeyFields;

-- Добавляем комментарии к существующим полям для ясности
ALTER TABLE api_keys MODIFY COLUMN key_hash VARCHAR(255) NOT NULL COMMENT 'SHA256 хеш оригинального ключа';
ALTER TABLE api_keys MODIFY COLUMN external_id VARCHAR(255) COMMENT 'ID ключа в LiteLLM';

-- Создаем индекс для быстрого поиска по превью (если нужно)
-- CREATE INDEX IF NOT EXISTS idx_api_keys_preview ON api_keys(api_key_preview); 