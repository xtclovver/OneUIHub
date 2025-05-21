package repository

import (
	"database/sql"

	"github.com/oneaihub/backend/internal/repository/mysql"
)

// NewUserRepository создает новую реализацию UserRepository
func NewUserRepository(db *sql.DB) UserRepository {
	return mysql.NewUserRepository(db)
}

// NewTierRepository создает новую реализацию TierRepository
func NewTierRepository(db *sql.DB) TierRepository {
	return mysql.NewTierRepository(db)
}

// NewCompanyRepository создает новую реализацию CompanyRepository
func NewCompanyRepository(db *sql.DB) CompanyRepository {
	return mysql.NewCompanyRepository(db)
}

// NewModelRepository создает новую реализацию ModelRepository
func NewModelRepository(db *sql.DB) ModelRepository {
	return mysql.NewModelRepository(db)
}

// NewModelConfigRepository создает новую реализацию ModelConfigRepository
func NewModelConfigRepository(db *sql.DB) ModelConfigRepository {
	return mysql.NewModelConfigRepository(db)
}

// NewRateLimitRepository создает новую реализацию RateLimitRepository
func NewRateLimitRepository(db *sql.DB) RateLimitRepository {
	return mysql.NewRateLimitRepository(db)
}

// NewApiKeyRepository создает новую реализацию ApiKeyRepository
func NewApiKeyRepository(db *sql.DB) ApiKeyRepository {
	return mysql.NewApiKeyRepository(db)
}

// NewRequestRepository создает новую реализацию RequestRepository
func NewRequestRepository(db *sql.DB) RequestRepository {
	return mysql.NewRequestRepository(db)
}

// NewUserLimitsRepository создает новую реализацию UserLimitsRepository
func NewUserLimitsRepository(db *sql.DB) UserLimitsRepository {
	return mysql.NewUserLimitsRepository(db)
}
