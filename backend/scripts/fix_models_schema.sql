-- Исправление схемы таблицы models
-- Добавляем недостающие колонки

USE oneui_hub;

-- Проверяем и добавляем недостающие колонки в таблицу models
ALTER TABLE models 
ADD COLUMN IF NOT EXISTS providers TEXT,
ADD COLUMN IF NOT EXISTS max_input_tokens INT,
ADD COLUMN IF NOT EXISTS max_output_tokens INT,
ADD COLUMN IF NOT EXISTS mode VARCHAR(50),
ADD COLUMN IF NOT EXISTS supports_parallel_function_calling BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supports_vision BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supports_web_search BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supports_reasoning BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supports_function_calling BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supported_openai_params TEXT;

-- Если колонка с неправильным именем существует, переименовываем её
-- (MySQL не поддерживает IF EXISTS для CHANGE COLUMN, поэтому используем процедуру)
DELIMITER $$
CREATE PROCEDURE FixColumnName()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists 
    FROM information_schema.columns 
    WHERE table_schema = 'oneui_hub' 
    AND table_name = 'models' 
    AND column_name = 'supported_open_a_iparams';
    
    IF column_exists > 0 THEN
        ALTER TABLE models CHANGE COLUMN supported_open_a_iparams supported_openai_params TEXT;
    END IF;
END$$
DELIMITER ;

CALL FixColumnName();
DROP PROCEDURE FixColumnName; 