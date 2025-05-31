import { apiClient } from './client';

export interface LiteLLMUsage {
  user_id: string;
  current_month_usage: number;
  total_usage: number;
  currency: string;
  usage_by_model?: {
    [model: string]: {
      requests: number;
      cost: number;
    };
  };
}

export interface LiteLLMApiKey {
  id: string;
  name: string;
  api_key?: string;
  external_id?: string;
  created_at: string;
  expires_at?: string;
  last_used?: string;
  is_active: boolean;
  usage_count: number;
}

export interface LiteLLMBudget {
  id: string;
  user_id: string;
  monthly_limit: number;
  current_spending: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export const liteLLMAPI = {
  // Получить использование пользователя
  getUserUsage: async (userId: string): Promise<LiteLLMUsage> => {
    const response = await apiClient.get(`/users/${userId}/spending`);
    return response.data as LiteLLMUsage;
  },

  // Получить API ключи пользователя
  getUserApiKeys: async (userId: string): Promise<LiteLLMApiKey[]> => {
    const response = await apiClient.get(`/users/${userId}/api-keys`);
    return response.data as LiteLLMApiKey[];
  },

  // Создать новый API ключ
  createApiKey: async (userId: string, name: string): Promise<LiteLLMApiKey> => {
    const response = await apiClient.post(`/users/${userId}/api-keys`, { name });
    return response.data as LiteLLMApiKey;
  },

  // Деактивировать API ключ
  deactivateApiKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(`/api-keys/${keyId}`);
  },

  // Получить бюджет пользователя
  getUserBudget: async (userId: string): Promise<LiteLLMBudget> => {
    const response = await apiClient.get(`/users/${userId}/budget`);
    return response.data as LiteLLMBudget;
  },

  // Обновить бюджет пользователя
  updateUserBudget: async (userId: string, monthlyLimit: number): Promise<LiteLLMBudget> => {
    const response = await apiClient.put(`/users/${userId}/budget`, { monthly_limit: monthlyLimit });
    return response.data as LiteLLMBudget;
  },

  // Получить статистику использования
  getUsageStats: async (userId: string, period: 'day' | 'week' | 'month' = 'month') => {
    const response = await apiClient.get(`/users/${userId}/usage-stats?period=${period}`);
    return response.data;
  },

  // Получить историю запросов
  getRequestHistory: async (userId: string, limit = 50, offset = 0) => {
    const response = await apiClient.get(`/users/${userId}/requests?limit=${limit}&offset=${offset}`);
    return response.data;
  }
}; 