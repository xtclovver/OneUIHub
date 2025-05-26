package main

import (
	"log"
	"time"

	"oneui-hub/internal/config"
	"oneui-hub/internal/domain"
	"oneui-hub/pkg/database"

	"github.com/google/uuid"
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

	// Выполняем миграцию (включая исправление datetime)
	if err := db.Migrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Тестируем создание модели

	// Создаем тестовую компанию
	company := &domain.Company{
		ID:          uuid.New().String(),
		Name:        "Test Company",
		ExternalID:  "test-company",
		Description: "Тестовая компания для проверки datetime",
	}

	if err := db.Create(company).Error; err != nil {
		log.Printf("Failed to create company: %v", err)
	} else {
		log.Printf("Company created successfully with ID: %s", company.ID)
		log.Printf("Company CreatedAt: %v", company.CreatedAt)
		log.Printf("Company UpdatedAt: %v", company.UpdatedAt)
	}

	// Создаем тестовую модель
	model := &domain.Model{
		ID:          uuid.New().String(),
		CompanyID:   company.ID,
		Name:        "Test Model",
		ExternalID:  "test-model",
		Description: "Тестовая модель для проверки datetime",
		Mode:        "chat",
	}

	if err := db.Create(model).Error; err != nil {
		log.Printf("Failed to create model: %v", err)
	} else {
		log.Printf("Model created successfully with ID: %s", model.ID)
		log.Printf("Model CreatedAt: %v", model.CreatedAt)
		log.Printf("Model UpdatedAt: %v", model.UpdatedAt)
	}

	// Обновляем модель
	time.Sleep(1 * time.Second) // Небольшая задержка для разности времени
	model.Description = "Обновленное описание модели"

	if err := db.Save(model).Error; err != nil {
		log.Printf("Failed to update model: %v", err)
	} else {
		log.Printf("Model updated successfully")
		log.Printf("Model UpdatedAt after update: %v", model.UpdatedAt)
	}

	// Создаем конфигурацию модели
	modelConfig := &domain.ModelConfig{
		ID:              uuid.New().String(),
		ModelID:         model.ID,
		IsFree:          false,
		IsEnabled:       true,
		InputTokenCost:  floatPtr(0.001),
		OutputTokenCost: floatPtr(0.002),
	}

	if err := db.Create(modelConfig).Error; err != nil {
		log.Printf("Failed to create model config: %v", err)
	} else {
		log.Printf("Model config created successfully with ID: %s", modelConfig.ID)
		log.Printf("Model config CreatedAt: %v", modelConfig.CreatedAt)
		log.Printf("Model config UpdatedAt: %v", modelConfig.UpdatedAt)
	}

	// Очищаем тестовые данные
	db.Delete(modelConfig)
	db.Delete(model)
	db.Delete(company)

	log.Println("Test completed successfully!")
}

func floatPtr(f float64) *float64 {
	return &f
}
