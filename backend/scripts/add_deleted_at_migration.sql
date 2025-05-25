-- Миграция для добавления поля deleted_at в таблицу users
-- Дата: 2025-01-25

-- Проверяем и добавляем поле deleted_at только если его нет
SET @column_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'deleted_at');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL', 'SELECT ''Column deleted_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Добавляем индекс для поля deleted_at для оптимизации запросов soft delete
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_deleted_at');
SET @sql = IF(@index_exists = 0, 'ALTER TABLE users ADD INDEX idx_users_deleted_at (deleted_at)', 'SELECT ''Index idx_users_deleted_at already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 