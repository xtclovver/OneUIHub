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