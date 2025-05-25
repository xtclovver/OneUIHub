package service

import (
	"context"
	"log"
	"time"
)

type SchedulerService interface {
	Start(ctx context.Context)
	Stop()
}

type schedulerService struct {
	currencyService CurrencyService
	ticker          *time.Ticker
	done            chan bool
}

func NewSchedulerService(currencyService CurrencyService) SchedulerService {
	return &schedulerService{
		currencyService: currencyService,
		done:            make(chan bool),
	}
}

func (s *schedulerService) Start(ctx context.Context) {
	// Обновляем курсы при запуске
	if err := s.currencyService.UpdateExchangeRates(ctx); err != nil {
		log.Printf("Failed to update exchange rates on startup: %v", err)
	} else {
		log.Println("Exchange rates updated successfully on startup")
	}

	// Настраиваем ежедневное обновление в 00:00 UTC
	s.ticker = time.NewTicker(24 * time.Hour)

	go func() {
		for {
			select {
			case <-s.ticker.C:
				log.Println("Starting daily exchange rates update...")
				if err := s.currencyService.UpdateExchangeRates(ctx); err != nil {
					log.Printf("Failed to update exchange rates: %v", err)
				} else {
					log.Println("Exchange rates updated successfully")
				}
			case <-s.done:
				return
			}
		}
	}()

	log.Println("Scheduler service started")
}

func (s *schedulerService) Stop() {
	if s.ticker != nil {
		s.ticker.Stop()
	}
	s.done <- true
	log.Println("Scheduler service stopped")
}
