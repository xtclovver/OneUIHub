import { ApiResponse, User, Tier, RateLimit, ModelConfig } from '../types';
import { mockTiers } from './mockData';

// Мок данные для администратора
const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    tier_id: '2',
    role: 'customer',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'admin@example.com',
    tier_id: '3',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

const mockRateLimits: RateLimit[] = [
  {
    id: '1',
    model_id: '1',
    tier_id: '1',
    requests_per_minute: 10,
    requests_per_day: 100,
    tokens_per_minute: 1000,
    tokens_per_day: 10000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

export const adminAPI = {
  // Users
  getUsers: (): Promise<{ data: ApiResponse<User[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: mockUsers,
            success: true,
            message: 'Пользователи загружены'
          }
        });
      }, 800);
    });
  },

  updateUser: (id: string, data: Partial<User>): Promise<{ data: ApiResponse<User> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        if (user) {
          const updatedUser = { ...user, ...data };
          resolve({
            data: {
              data: updatedUser,
              success: true,
              message: 'Пользователь обновлен'
            }
          });
        }
      }, 500);
    });
  },

  deleteUser: (id: string): Promise<{ data: ApiResponse<null> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: null,
            success: true,
            message: 'Пользователь удален'
          }
        });
      }, 500);
    });
  },

  approveUser: (id: string): Promise<{ data: ApiResponse<User> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        if (user) {
          resolve({
            data: {
              data: user,
              success: true,
              message: 'Пользователь одобрен'
            }
          });
        }
      }, 500);
    });
  },

  // Tiers
  getTiers: (): Promise<{ data: ApiResponse<Tier[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: mockTiers,
            success: true,
            message: 'Тарифы загружены'
          }
        });
      }, 500);
    });
  },

  createTier: (data: Omit<Tier, 'id' | 'created_at'>): Promise<{ data: ApiResponse<Tier> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newTier: Tier = {
          ...data,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
        };
        resolve({
          data: {
            data: newTier,
            success: true,
            message: 'Тариф создан'
          }
        });
      }, 500);
    });
  },

  updateTier: (id: string, data: Partial<Tier>): Promise<{ data: ApiResponse<Tier> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tier = mockTiers.find(t => t.id === id);
        if (tier) {
          const updatedTier = { ...tier, ...data };
          resolve({
            data: {
              data: updatedTier,
              success: true,
              message: 'Тариф обновлен'
            }
          });
        }
      }, 500);
    });
  },

  deleteTier: (id: string): Promise<{ data: ApiResponse<null> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: null,
            success: true,
            message: 'Тариф удален'
          }
        });
      }, 500);
    });
  },

  // Rate Limits
  getRateLimits: (): Promise<{ data: ApiResponse<RateLimit[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: mockRateLimits,
            success: true,
            message: 'Лимиты загружены'
          }
        });
      }, 500);
    });
  },

  createRateLimit: (data: Omit<RateLimit, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ApiResponse<RateLimit> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLimit: RateLimit = {
          ...data,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        resolve({
          data: {
            data: newLimit,
            success: true,
            message: 'Лимит создан'
          }
        });
      }, 500);
    });
  },

  updateRateLimit: (id: string, data: Partial<RateLimit>): Promise<{ data: ApiResponse<RateLimit> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const limit = mockRateLimits.find(l => l.id === id);
        if (limit) {
          const updatedLimit = { ...limit, ...data };
          resolve({
            data: {
              data: updatedLimit,
              success: true,
              message: 'Лимит обновлен'
            }
          });
        }
      }, 500);
    });
  },

  deleteRateLimit: (id: string): Promise<{ data: ApiResponse<null> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: null,
            success: true,
            message: 'Лимит удален'
          }
        });
      }, 500);
    });
  },

  // Model Configs
  getModelConfigs: (): Promise<{ data: ApiResponse<ModelConfig[]> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: [],
            success: true,
            message: 'Конфигурации загружены'
          }
        });
      }, 500);
    });
  },

  updateModelConfig: (id: string, data: Partial<ModelConfig>): Promise<{ data: ApiResponse<ModelConfig> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: {} as ModelConfig,
            success: true,
            message: 'Конфигурация обновлена'
          }
        });
      }, 500);
    });
  },

  // Sync
  syncModels: (): Promise<{ data: ApiResponse<{ message: string }> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: { message: 'Модели синхронизированы' },
            success: true,
            message: 'Синхронизация завершена'
          }
        });
      }, 2000);
    });
  },

  syncCompanies: (): Promise<{ data: ApiResponse<{ message: string }> }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            data: { message: 'Компании синхронизированы' },
            success: true,
            message: 'Синхронизация завершена'
          }
        });
      }, 2000);
    });
  },
}; 