-- Миграция для добавления новых полей возможностей модели из LiteLLM
-- Дата: 2024-01-XX

-- Добавляем новые поля в таблицу models
ALTER TABLE models 
ADD COLUMN providers TEXT COMMENT 'JSON массив провайдеров',
ADD COLUMN max_input_tokens INT COMMENT 'Максимальное количество входных токенов',
ADD COLUMN max_output_tokens INT COMMENT 'Максимальное количество выходных токенов',
ADD COLUMN mode VARCHAR(50) COMMENT 'Режим работы модели (chat, completion, etc)',
ADD COLUMN supports_parallel_function_calling BOOLEAN DEFAULT FALSE COMMENT 'Поддержка параллельного вызова функций',
ADD COLUMN supports_vision BOOLEAN DEFAULT FALSE COMMENT 'Поддержка анализа изображений',
ADD COLUMN supports_web_search BOOLEAN DEFAULT FALSE COMMENT 'Поддержка веб поиска',
ADD COLUMN supports_reasoning BOOLEAN DEFAULT FALSE COMMENT 'Поддержка аналитического мышления',
ADD COLUMN supports_function_calling BOOLEAN DEFAULT FALSE COMMENT 'Поддержка вызова функций',
ADD COLUMN supported_openai_params TEXT COMMENT 'JSON массив поддерживаемых параметров OpenAI API';

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