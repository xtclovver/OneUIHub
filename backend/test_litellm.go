package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"oneui-hub/internal/config"
	"oneui-hub/internal/litellm"
)

func main() {
	// Создаем конфигурацию для LiteLLM
	cfg := &config.LiteLLMConfig{
		BaseURL: "http://localhost:4000",
		APIKey:  "sk-SZQ85Nd1gd0gkzIbjbAajg",
		Timeout: 30 * time.Second,
	}

	// Создаем клиент
	client := litellm.NewClient(cfg)
	ctx := context.Background()

	fmt.Println("=== Тестирование интеграции с LiteLLM ===")

	// Тест 1: Получение списка моделей
	fmt.Println("\n1. Получение списка моделей...")
	models, err := client.GetModels(ctx)
	if err != nil {
		log.Printf("Ошибка при получении моделей: %v", err)
	} else {
		fmt.Printf("Найдено %d моделей:\n", len(models))
		for i, model := range models {
			if i < 5 { // Показываем только первые 5 моделей
				fmt.Printf("  - %s (владелец: %s)\n", model.ID, model.OwnedBy)
			}
		}
		if len(models) > 5 {
			fmt.Printf("  ... и еще %d моделей\n", len(models)-5)
		}
	}

	// Тест 2: Получение списка моделей через v1 API
	fmt.Println("\n2. Получение списка моделей через v1 API...")
	v1Models, err := client.GetV1Models(ctx)
	if err != nil {
		log.Printf("Ошибка при получении v1 моделей: %v", err)
	} else {
		fmt.Printf("Найдено %d v1 моделей:\n", len(v1Models))
		for i, model := range v1Models {
			if i < 3 { // Показываем только первые 3 модели
				fmt.Printf("  - %s (владелец: %s)\n", model.ID, model.OwnedBy)
			}
		}
	}

	// Тест 3: Получение информации о конкретной модели
	if len(models) > 0 {
		fmt.Printf("\n3. Получение информации о модели '%s'...\n", models[0].ID)
		modelInfo, err := client.GetModelInfo(ctx, models[0].ID)
		if err != nil {
			log.Printf("Ошибка при получении информации о модели: %v", err)
		} else {
			fmt.Printf("Модель: %s\n", modelInfo.ID)
			fmt.Printf("Владелец: %s\n", modelInfo.OwnedBy)
			if modelInfo.Pricing != nil {
				fmt.Printf("Стоимость входных токенов: %f\n", modelInfo.Pricing.InputCost)
				fmt.Printf("Стоимость выходных токенов: %f\n", modelInfo.Pricing.OutputCost)
			}
		}
	}

	// Тест 4: Получение списка бюджетов
	fmt.Println("\n4. Получение списка бюджетов...")
	budgets, err := client.ListBudgets(ctx)
	if err != nil {
		log.Printf("Ошибка при получении бюджетов: %v", err)
	} else {
		fmt.Printf("Найдено %d бюджетов:\n", len(budgets))
		for i, budget := range budgets {
			if i < 3 { // Показываем только первые 3 бюджета
				fmt.Printf("  - ID: %s, Максимальный бюджет: %.2f, Потрачено: %.2f\n",
					budget.ID, budget.MaxBudget, budget.SpentBudget)
			}
		}
	}

	// Тест 5: Получение настроек бюджета
	fmt.Println("\n5. Получение настроек бюджета...")
	settings, err := client.GetBudgetSettings(ctx)
	if err != nil {
		log.Printf("Ошибка при получении настроек бюджета: %v", err)
	} else {
		fmt.Printf("Настройки бюджета: %+v\n", settings)
	}

	fmt.Println("\n=== Тестирование завершено ===")
}
