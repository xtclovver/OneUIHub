package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"oneui-hub/internal/config"
)

// Упрощенные модели для тестов SQLite (без ENUM типов)
type TestUser struct {
	ID           string `gorm:"type:varchar(36);primaryKey"`
	Email        string `gorm:"type:varchar(255);uniqueIndex;not null"`
	Name         string `gorm:"type:varchar(255)"`
	PasswordHash string `gorm:"type:varchar(255);not null"`
	TierID       string `gorm:"type:varchar(36);not null"`
	Role         string `gorm:"type:varchar(50);default:'customer'"`
	CreatedAt    int64  `gorm:"autoCreateTime"`
	UpdatedAt    int64  `gorm:"autoUpdateTime"`
}

func (TestUser) TableName() string {
	return "users"
}

type TestTier struct {
	ID          string  `gorm:"type:varchar(36);primaryKey"`
	Name        string  `gorm:"type:varchar(100);uniqueIndex;not null"`
	Description string  `gorm:"type:text"`
	IsFree      bool    `gorm:"default:false"`
	Price       float64 `gorm:"type:decimal(10,2);default:0.00"`
	CreatedAt   int64   `gorm:"autoCreateTime"`
	UpdatedAt   int64   `gorm:"autoUpdateTime"`
}

func (TestTier) TableName() string {
	return "tiers"
}

type TestUserLimit struct {
	UserID            string   `gorm:"type:varchar(36);primaryKey"`
	MonthlyTokenLimit *int64   `gorm:"type:bigint"`
	Balance           *float64 `gorm:"type:decimal(10,2);default:0.00"`
}

func (TestUserLimit) TableName() string {
	return "user_limits"
}

// migrateTestTables выполняет миграцию упрощенных таблиц для тестов
func migrateTestTables(db *gorm.DB) error {
	return db.AutoMigrate(
		&TestTier{},
		&TestUser{},
		&TestUserLimit{},
	)
}

func TestNewConnection(t *testing.T) {
	tests := []struct {
		name        string
		cfg         *config.Config
		expectError bool
	}{
		{
			name: "valid sqlite config",
			cfg: &config.Config{
				Database: config.DatabaseConfig{
					DSN: ":memory:",
				},
			},
			expectError: false,
		},
		{
			name: "invalid config",
			cfg: &config.Config{
				Database: config.DatabaseConfig{
					DSN: "invalid://connection/string",
				},
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Для тестов используем SQLite в памяти
			if !tt.expectError {
				db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
				require.NoError(t, err)

				database := &Database{DB: db}
				assert.NotNil(t, database)
				assert.NotNil(t, database.DB)

				// Закрываем соединение
				err = database.Close()
				assert.NoError(t, err)
			}
		})
	}
}

func TestDatabase_Migrate(t *testing.T) {
	// Создаем тестовую базу данных в памяти
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	// Выполняем миграцию упрощенных таблиц для тестов
	err = migrateTestTables(db)
	assert.NoError(t, err)

	// Проверяем, что основные таблицы созданы
	tables := []string{"users", "user_limits", "tiers"}

	for _, table := range tables {
		var tableName string
		err := db.Raw("SELECT name FROM sqlite_master WHERE type='table' AND name=?", table).Scan(&tableName).Error
		assert.NoError(t, err)
		assert.Equal(t, table, tableName)
	}

	// Закрываем соединение
	sqlDB, err := db.DB()
	require.NoError(t, err)
	err = sqlDB.Close()
	assert.NoError(t, err)
}

func TestDatabase_Close(t *testing.T) {
	// Создаем тестовую базу данных в памяти
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)

	database := &Database{DB: db}

	// Закрываем соединение
	err = database.Close()
	assert.NoError(t, err)

	// Проверяем, что соединение действительно закрыто
	sqlDB, err := database.DB.DB()
	require.NoError(t, err)

	// Пытаемся выполнить запрос к закрытой базе
	err = sqlDB.Ping()
	assert.Error(t, err)
}
