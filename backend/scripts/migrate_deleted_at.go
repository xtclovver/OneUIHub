package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

func main() {
	// Загружаем .env файл
	_ = godotenv.Load("../.env")

	// Получаем параметры подключения
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbName := getEnv("DB_NAME", "oneui_hub")

	// Создаем DSN
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// Подключаемся к базе данных
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Ошибка подключения к базе данных: %v", err)
	}
	defer db.Close()

	// Проверяем подключение
	if err := db.Ping(); err != nil {
		log.Fatalf("Ошибка проверки подключения: %v", err)
	}

	log.Println("Подключение к базе данных успешно")

	// Выполняем миграцию
	if err := runMigration(db); err != nil {
		log.Fatalf("Ошибка выполнения миграции: %v", err)
	}

	log.Println("Миграция выполнена успешно!")
}

func runMigration(db *sql.DB) error {
	// Проверяем существование колонки deleted_at
	var columnExists int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'deleted_at'
	`).Scan(&columnExists)
	if err != nil {
		return fmt.Errorf("ошибка проверки существования колонки: %v", err)
	}

	if columnExists == 0 {
		log.Println("Добавляем колонку deleted_at в таблицу users...")
		_, err = db.Exec("ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL")
		if err != nil {
			return fmt.Errorf("ошибка добавления колонки deleted_at: %v", err)
		}
		log.Println("Колонка deleted_at добавлена")
	} else {
		log.Println("Колонка deleted_at уже существует")
	}

	// Проверяем существование индекса
	var indexExists int
	err = db.QueryRow(`
		SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
		WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_deleted_at'
	`).Scan(&indexExists)
	if err != nil {
		return fmt.Errorf("ошибка проверки существования индекса: %v", err)
	}

	if indexExists == 0 {
		log.Println("Добавляем индекс idx_users_deleted_at...")
		_, err = db.Exec("ALTER TABLE users ADD INDEX idx_users_deleted_at (deleted_at)")
		if err != nil {
			return fmt.Errorf("ошибка добавления индекса: %v", err)
		}
		log.Println("Индекс idx_users_deleted_at добавлен")
	} else {
		log.Println("Индекс idx_users_deleted_at уже существует")
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
