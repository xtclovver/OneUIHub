package main

import (
	"log"

	"oneui-hub/internal/api/handlers"
	"oneui-hub/internal/api/routes"
	"oneui-hub/internal/config"
	"oneui-hub/internal/litellm"
	"oneui-hub/internal/middleware"
	"oneui-hub/internal/repository"
	"oneui-hub/internal/service"
	"oneui-hub/pkg/auth"
	"oneui-hub/pkg/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	//cfg.Debug()

	db, err := database.NewConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// // Выполняем миграции
	// if err := db.Migrate(); err != nil {
	// 	log.Fatalf("Failed to migrate database: %v", err)
	// }

	jwtManager := auth.NewJWTManager(cfg.Auth.JWTSecret, cfg.Auth.TokenDuration)

	litellmClient := litellm.NewClient(&cfg.LiteLLM)

	userRepo := repository.NewUserRepository(db.DB)
	tierRepo := repository.NewTierRepository(db.DB)
	userLimitRepo := repository.NewUserLimitRepository(db.DB)
	modelRepo := repository.NewModelRepository(db.DB)
	companyRepo := repository.NewCompanyRepository(db.DB)
	budgetRepo := repository.NewBudgetRepository(db.DB)
	modelConfigRepo := repository.NewModelConfigRepository(db.DB)
	currencyRepo := repository.NewCurrencyRepository(db.DB)
	exchangeRateRepo := repository.NewExchangeRateRepository(db.DB)
	userSpendingRepo := repository.NewUserSpendingRepository(db.DB)
	rateLimitRepo := repository.NewRateLimitRepository(db.DB)
	apiKeyRepo := repository.NewApiKeyRepository(db.DB)
	requestRepo := repository.NewRequestRepository(db.DB)

	userService := service.NewUserService(userRepo, userLimitRepo, tierRepo)
	modelService := service.NewModelService(modelRepo, companyRepo, modelConfigRepo, litellmClient)
	budgetService := service.NewBudgetService(budgetRepo, userRepo, litellmClient)
	currencyService := service.NewCurrencyService(exchangeRateRepo, currencyRepo, "")
	tierService := service.NewTierService(tierRepo, userRepo, userSpendingRepo)
	rateLimitService := service.NewRateLimitService(rateLimitRepo, modelRepo, tierRepo)

	authHandler := handlers.NewAuthHandler(userService, jwtManager)
	modelHandler := handlers.NewModelHandler(modelService)
	companyHandler := handlers.NewCompanyHandler(modelService)
	budgetHandler := handlers.NewBudgetHandler(budgetService)
	currencyHandler := handlers.NewCurrencyHandler(currencyService)
	tierHandler := handlers.NewTierHandler(tierService)
	userHandler := handlers.NewUserHandler(userService, litellmClient, apiKeyRepo, requestRepo)
	rateLimitHandler := handlers.NewRateLimitHandler(rateLimitService)
	uploadHandler := handlers.NewUploadHandler()

	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	router := routes.NewRouter(authHandler, modelHandler, companyHandler, budgetHandler, currencyHandler, tierHandler, userHandler, rateLimitHandler, uploadHandler, authMiddleware)

	engine := router.SetupRoutes()
	address := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server starting on %s", address)

	if err := engine.Run(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
