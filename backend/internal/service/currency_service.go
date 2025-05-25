package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/repository"

	"github.com/google/uuid"
)

type CurrencyService interface {
	UpdateExchangeRates(ctx context.Context) error
	GetExchangeRate(ctx context.Context, fromCurrency, toCurrency string) (float64, error)
	ConvertCurrency(ctx context.Context, amount float64, fromCurrency, toCurrency string) (float64, error)
	GetSupportedCurrencies(ctx context.Context) ([]domain.Currency, error)
}

type currencyService struct {
	exchangeRateRepo repository.ExchangeRateRepository
	currencyRepo     repository.CurrencyRepository
	apiKey           string
}

// ExchangeRateAPIResponse представляет ответ от API курсов валют
type ExchangeRateAPIResponse struct {
	Result          string             `json:"result"`
	BaseCode        string             `json:"base_code"`
	ConversionRates map[string]float64 `json:"conversion_rates"`
	TimeLastUpdate  int64              `json:"time_last_update_unix"`
}

func NewCurrencyService(exchangeRateRepo repository.ExchangeRateRepository, currencyRepo repository.CurrencyRepository, apiKey string) CurrencyService {
	return &currencyService{
		exchangeRateRepo: exchangeRateRepo,
		currencyRepo:     currencyRepo,
		apiKey:           apiKey,
	}
}

func (s *currencyService) UpdateExchangeRates(ctx context.Context) error {
	// Получаем курсы валют от внешнего API
	url := fmt.Sprintf("https://v6.exchangerate-api.com/v6/%s/latest/USD", s.apiKey)

	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to fetch exchange rates: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("exchange rate API returned status: %d", resp.StatusCode)
	}

	var apiResponse ExchangeRateAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResponse); err != nil {
		return fmt.Errorf("failed to decode API response: %w", err)
	}

	if apiResponse.Result != "success" {
		return fmt.Errorf("exchange rate API returned error result: %s", apiResponse.Result)
	}

	// Обновляем курс USD -> RUB
	if rubRate, exists := apiResponse.ConversionRates["RUB"]; exists {
		// Проверяем, существует ли уже запись
		existingRate, err := s.exchangeRateRepo.GetRate(ctx, "USD", "RUB")
		if err != nil {
			// Создаем новую запись
			exchangeRate := &domain.ExchangeRate{
				ID:           uuid.New().String(),
				FromCurrency: "USD",
				ToCurrency:   "RUB",
				Rate:         rubRate,
				UpdatedAt:    time.Now(),
			}
			if err := s.exchangeRateRepo.Create(ctx, exchangeRate); err != nil {
				return fmt.Errorf("failed to create USD->RUB exchange rate: %w", err)
			}
		} else {
			// Обновляем существующую запись
			existingRate.Rate = rubRate
			existingRate.UpdatedAt = time.Now()
			if err := s.exchangeRateRepo.Update(ctx, existingRate); err != nil {
				return fmt.Errorf("failed to update USD->RUB exchange rate: %w", err)
			}
		}

		// Создаем/обновляем обратный курс RUB -> USD
		usdRate := 1.0 / rubRate
		existingReverseRate, err := s.exchangeRateRepo.GetRate(ctx, "RUB", "USD")
		if err != nil {
			// Создаем новую запись
			reverseRate := &domain.ExchangeRate{
				ID:           uuid.New().String(),
				FromCurrency: "RUB",
				ToCurrency:   "USD",
				Rate:         usdRate,
				UpdatedAt:    time.Now(),
			}
			if err := s.exchangeRateRepo.Create(ctx, reverseRate); err != nil {
				return fmt.Errorf("failed to create RUB->USD exchange rate: %w", err)
			}
		} else {
			// Обновляем существующую запись
			existingReverseRate.Rate = usdRate
			existingReverseRate.UpdatedAt = time.Now()
			if err := s.exchangeRateRepo.Update(ctx, existingReverseRate); err != nil {
				return fmt.Errorf("failed to update RUB->USD exchange rate: %w", err)
			}
		}
	}

	return nil
}

func (s *currencyService) GetExchangeRate(ctx context.Context, fromCurrency, toCurrency string) (float64, error) {
	if fromCurrency == toCurrency {
		return 1.0, nil
	}

	rate, err := s.exchangeRateRepo.GetRate(ctx, fromCurrency, toCurrency)
	if err != nil {
		return 0, fmt.Errorf("failed to get exchange rate from %s to %s: %w", fromCurrency, toCurrency, err)
	}

	return rate.Rate, nil
}

func (s *currencyService) ConvertCurrency(ctx context.Context, amount float64, fromCurrency, toCurrency string) (float64, error) {
	rate, err := s.GetExchangeRate(ctx, fromCurrency, toCurrency)
	if err != nil {
		return 0, err
	}

	return amount * rate, nil
}

func (s *currencyService) GetSupportedCurrencies(ctx context.Context) ([]domain.Currency, error) {
	currencies, err := s.currencyRepo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get supported currencies: %w", err)
	}

	return currencies, nil
}
