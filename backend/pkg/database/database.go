package database

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"oneui-hub/internal/config"
	"oneui-hub/internal/domain"
)

type Database struct {
	*gorm.DB
}

func NewConnection(cfg *config.Config) (*Database, error) {
	db, err := gorm.Open(mysql.Open(cfg.Database.DSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().Local()
		},
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Устанавливаем режим SQL для корректной работы с датами
	if err := db.Exec("SET sql_mode = 'TRADITIONAL,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'").Error; err != nil {
		log.Printf("Warning: failed to set SQL mode: %v", err)
	}

	return &Database{DB: db}, nil
}

func (db *Database) Migrate() error {
	err := db.AutoMigrate(
		&domain.User{},
		&domain.UserLimit{},
		&domain.Tier{},
		&domain.Company{},
		&domain.Model{},
		&domain.ModelConfig{},
		&domain.RateLimit{},
		&domain.ApiKey{},
		&domain.Request{},
		&domain.Budget{},
		&domain.Currency{},
		&domain.ExchangeRate{},
		&domain.UserSpending{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	// Исправляем отсутствующие deleted_at колонки
	if err := db.fixDeletedAtColumns(); err != nil {
		log.Printf("Warning: failed to fix deleted_at columns: %v", err)
	}

	// Исправляем некорректные значения datetime
	if err := db.fixDatetimeValues(); err != nil {
		log.Printf("Warning: failed to fix datetime values: %v", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}

func (db *Database) fixDeletedAtColumns() error {
	tables := []string{"companies", "models", "model_configs", "rate_limits", "api_keys", "requests", "budgets", "exchange_rates", "users"}

	for _, table := range tables {
		// Проверяем существование колонки deleted_at
		var count int64
		err := db.Raw("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'deleted_at'", table).Scan(&count).Error
		if err != nil {
			log.Printf("Error checking deleted_at column for table %s: %v", table, err)
			continue
		}

		if count == 0 {
			log.Printf("Adding deleted_at column to table %s", table)
			err = db.Exec(fmt.Sprintf("ALTER TABLE %s ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL", table)).Error
			if err != nil {
				log.Printf("Error adding deleted_at column to table %s: %v", table, err)
				continue
			}

			// Добавляем индекс
			err = db.Exec(fmt.Sprintf("ALTER TABLE %s ADD INDEX idx_%s_deleted_at (deleted_at)", table, table)).Error
			if err != nil {
				log.Printf("Error adding index for deleted_at column to table %s: %v", table, err)
			}
		}
	}

	return nil
}

func (db *Database) fixDatetimeValues() error {
	log.Println("Fixing incorrect datetime values...")

	// Список таблиц и их полей для исправления
	tables := map[string][]string{
		"models":         {"created_at", "updated_at"},
		"model_configs":  {"created_at", "updated_at"},
		"companies":      {"created_at", "updated_at"},
		"users":          {"created_at", "updated_at"},
		"rate_limits":    {"created_at", "updated_at"},
		"api_keys":       {"created_at"},
		"requests":       {"created_at"},
		"budgets":        {"created_at", "updated_at"},
		"exchange_rates": {"updated_at"},
		"user_spendings": {"updated_at"},
		"tiers":          {"created_at"},
	}

	for table, fields := range tables {
		for _, field := range fields {
			// Исправляем нулевые и некорректные значения
			query := fmt.Sprintf(
				"UPDATE %s SET %s = CURRENT_TIMESTAMP WHERE %s = '0000-00-00 00:00:00' OR %s IS NULL OR %s = '0001-01-01 00:00:00'",
				table, field, field, field, field,
			)

			if err := db.Exec(query).Error; err != nil {
				log.Printf("Error fixing %s.%s: %v", table, field, err)
				continue
			}
		}
	}

	log.Println("Datetime values fixed successfully")
	return nil
}

func (db *Database) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
