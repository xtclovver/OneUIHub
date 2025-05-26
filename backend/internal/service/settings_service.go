package service

import (
	"context"
	"fmt"

	"oneui-hub/internal/domain"
	"oneui-hub/internal/repository"

	"github.com/google/uuid"
)

type SettingsService interface {
	GetAllSettings(ctx context.Context) ([]*domain.Setting, error)
	GetSetting(ctx context.Context, key string) (*domain.Setting, error)
	GetSettingsByCategory(ctx context.Context, category string) ([]*domain.Setting, error)
	UpdateSetting(ctx context.Context, key, value string) error
	UpdateSettings(ctx context.Context, settings map[string]string) error
	CreateSetting(ctx context.Context, key, value, description, settingType, category string) error
	DeleteSetting(ctx context.Context, id string) error
}

type settingsService struct {
	settingRepo repository.SettingRepository
}

func NewSettingsService(settingRepo repository.SettingRepository) SettingsService {
	return &settingsService{
		settingRepo: settingRepo,
	}
}

func (s *settingsService) GetAllSettings(ctx context.Context) ([]*domain.Setting, error) {
	return s.settingRepo.GetAll(ctx)
}

func (s *settingsService) GetSetting(ctx context.Context, key string) (*domain.Setting, error) {
	return s.settingRepo.GetByKey(ctx, key)
}

func (s *settingsService) GetSettingsByCategory(ctx context.Context, category string) ([]*domain.Setting, error) {
	return s.settingRepo.GetByCategory(ctx, category)
}

func (s *settingsService) UpdateSetting(ctx context.Context, key, value string) error {
	return s.settingRepo.UpdateByKey(ctx, key, value)
}

func (s *settingsService) UpdateSettings(ctx context.Context, settings map[string]string) error {
	for key, value := range settings {
		if err := s.settingRepo.UpdateByKey(ctx, key, value); err != nil {
			return fmt.Errorf("failed to update setting %s: %w", key, err)
		}
	}
	return nil
}

func (s *settingsService) CreateSetting(ctx context.Context, key, value, description, settingType, category string) error {
	setting := &domain.Setting{
		ID:          uuid.New().String(),
		Key:         key,
		Value:       value,
		Description: description,
		Type:        settingType,
		Category:    category,
	}

	return s.settingRepo.Create(ctx, setting)
}

func (s *settingsService) DeleteSetting(ctx context.Context, id string) error {
	return s.settingRepo.Delete(ctx, id)
}
