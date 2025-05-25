package database

import (
	"fmt"
	"log"

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
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
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
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}

func (db *Database) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
