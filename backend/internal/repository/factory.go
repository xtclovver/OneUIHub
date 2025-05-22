package repository

import (
	"github.com/jmoiron/sqlx"

	"github.com/oneaihub/backend/internal/repository/mysql"
)

// NewUserRepository создает новую реализацию UserRepository
func NewUserRepository(db *sqlx.DB) UserRepository {
	return mysql.NewMysqlUserRepository(db)
}

// NewTierRepository создает новую реализацию TierRepository
func NewTierRepository(db *sqlx.DB) TierRepository {
	return mysql.NewMysqlTierRepository(db)
}

// NewCompanyRepository создает новую реализацию CompanyRepository
func NewCompanyRepository(db *sqlx.DB) CompanyRepository {
	return mysql.NewCompanyRepository(db)
}

// NewModelRepository создает новую реализацию ModelRepository
func NewModelRepository(db *sqlx.DB) ModelRepository {
	return mysql.NewModelRepository(db)
}

// NewModelConfigRepository создает новую реализацию ModelConfigRepository
func NewModelConfigRepository(db *sqlx.DB) ModelConfigRepository {
	return mysql.NewModelConfigRepository(db)
}

// NewRateLimitRepository создает новую реализацию RateLimitRepository
func NewRateLimitRepository(db *sqlx.DB) RateLimitRepository {
	return mysql.NewRateLimitRepository(db)
}

// NewApiKeyRepository создает новую реализацию ApiKeyRepository
func NewApiKeyRepository(db *sqlx.DB) ApiKeyRepository {
	return mysql.NewApiKeyRepository(db)
}

// NewRequestRepository создает новую реализацию RequestRepository
func NewRequestRepository(db *sqlx.DB) RequestRepository {
	return mysql.NewRequestRepository(db)
}

// NewUserLimitsRepository создает новую реализацию UserLimitsRepository
func NewUserLimitsRepository(db *sqlx.DB) UserLimitsRepository {
	return mysql.NewUserLimitsRepository(db)
}
