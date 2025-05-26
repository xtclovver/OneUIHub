import { ApiResponse, User, Tier, RateLimit, ModelConfig } from '../types';
import { mockTiers } from './mockData';
import {
  ModelGroupInfo,
  LiteLLMModel,
  UserInfo,
  GlobalSpend,
  SpendLog,
  GlobalActivity,
  AdminStats,
  CreateModelRequest,
  UpdateModelRequest,
  CreateUserKeyRequest,
  UpdateUserKeyRequest,
} from '../types/admin';

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

const LITELLM_BASE_URL = 'http://localhost:4000';
const LITELLM_API_KEY = 'sk-cix7xI3fGYclgRwV-tzHYg';

const headers = {
  'accept': 'application/json',
  'x-litellm-api-key': LITELLM_API_KEY,
  'Content-Type': 'application/json',
};

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

// Модели
export const getModelGroupInfo = async (): Promise<{ data: ModelGroupInfo[] }> => {
  const response = await fetch(`${LITELLM_BASE_URL}/model_group/info`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Ошибка при получении информации о группах моделей');
  }
  return response.json();
};

export const getModelsInfo = async (): Promise<{ data: LiteLLMModel[] }> => {
  const response = await fetch(`${LITELLM_BASE_URL}/model/info`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Ошибка при получении информации о моделях');
  }
  return response.json();
};

export const createModel = async (data: CreateModelRequest): Promise<void> => {
  const response = await fetch(`${LITELLM_BASE_URL}/model/new`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Ошибка при создании модели');
  }
};

export const updateModel = async (data: UpdateModelRequest): Promise<void> => {
  const response = await fetch(`${LITELLM_BASE_URL}/model/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Ошибка при обновлении модели');
  }
};

export const deleteModel = async (modelId: string): Promise<void> => {
  const response = await fetch(`${LITELLM_BASE_URL}/model/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id: modelId }),
  });
  if (!response.ok) {
    throw new Error('Ошибка при удалении модели');
  }
};

// Пользователи
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await fetch(`${LITELLM_BASE_URL}/user/info`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Ошибка при получении информации о пользователях');
  }
  return response.json();
};

export const createUserKey = async (data: CreateUserKeyRequest): Promise<void> => {
  const response = await fetch(`${LITELLM_BASE_URL}/key/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Ошибка при создании ключа пользователя');
  }
};

export const updateUserKey = async (keyId: string, data: UpdateUserKeyRequest): Promise<void> => {
  const response = await fetch(`${LITELLM_BASE_URL}/key/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ key: keyId, ...data }),
  });
  if (!response.ok) {
    throw new Error('Ошибка при обновлении ключа пользователя');
  }
};

export const deleteUserKey = async (keyId: string): Promise<void> => {
  const response = await fetch(`${LITELLM_BASE_URL}/key/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ keys: [keyId] }),
  });
  if (!response.ok) {
    throw new Error('Ошибка при удалении ключа пользователя');
  }
};

// Статистика и аналитика
export const getGlobalSpend = async (): Promise<GlobalSpend> => {
  const response = await fetch(`${LITELLM_BASE_URL}/global/spend`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Ошибка при получении глобальных расходов');
  }
  return response.json();
};

export const getSpendLogs = async (): Promise<SpendLog[]> => {
  const response = await fetch(`${LITELLM_BASE_URL}/global/spend/logs`, {
    headers,
  });
  if (!response.ok) {
    throw new Error('Ошибка при получении логов расходов');
  }
  return response.json();
};

export const getGlobalActivity = async (startDate: string, endDate: string): Promise<GlobalActivity> => {
  const response = await fetch(
    `${LITELLM_BASE_URL}/global/activity?start_date=${startDate}&end_date=${endDate}`,
    { headers }
  );
  if (!response.ok) {
    throw new Error('Ошибка при получении глобальной активности');
  }
  return response.json();
};

// Агрегированная статистика для дашборда
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const [modelsResponse, userResponse, spendResponse, activityResponse] = await Promise.all([
      getModelsInfo(),
      getUserInfo(),
      getGlobalSpend(),
      getGlobalActivity(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      ),
    ]);

    const totalUsers = userResponse.keys.length;
    const activeModels = modelsResponse.data.length;
    const totalSpend = spendResponse.spend;
    const totalRequests = activityResponse.sum_api_requests;
    const totalTokens = activityResponse.sum_total_tokens;

    // Получаем запросы за сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayActivity = activityResponse.daily_data.find(
      (day) => day.date === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );
    const requestsToday = todayActivity?.api_requests || 0;

    return {
      totalUsers,
      activeModels,
      requestsToday,
      monthlyRevenue: totalSpend,
      totalSpend,
      totalRequests,
      totalTokens,
    };
  } catch (error) {
    console.error('Ошибка при получении статистики админа:', error);
    throw error;
  }
};

// Утилиты
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}; 