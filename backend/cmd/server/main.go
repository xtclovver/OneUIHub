package main

import (
	"log"

	"oneui-hub/internal/api/handlers"
	"oneui-hub/internal/api/routes"
	"oneui-hub/internal/config"
	"oneui-hub/internal/middleware"
	"oneui-hub/internal/repository"
	"oneui-hub/internal/service"
	"oneui-hub/pkg/auth"
	"oneui-hub/pkg/database"
)

func main() {
	// Загружаем конфигурацию
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Подключаемся к базе данных
	db, err := database.NewConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Выполняем миграции
	if err := db.Migrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Инициализируем JWT менеджер
	jwtManager := auth.NewJWTManager(cfg.Auth.JWTSecret, cfg.Auth.TokenDuration)

	// Инициализируем репозитории
	userRepo := repository.NewUserRepository(db.DB)
	tierRepo := repository.NewTierRepository(db.DB)
	userLimitRepo := repository.NewUserLimitRepository(db.DB)

	// Инициализируем сервисы
	userService := service.NewUserService(userRepo, userLimitRepo, tierRepo)

	// Инициализируем обработчики
	authHandler := handlers.NewAuthHandler(userService, jwtManager)

	// Инициализируем middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// Инициализируем маршруты
	router := routes.NewRouter(authHandler, authMiddleware)

	// Запускаем сервер
	engine := router.SetupRoutes()
	address := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("Server starting on %s", address)

	if err := engine.Run(address); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
