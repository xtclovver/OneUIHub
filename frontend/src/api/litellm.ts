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
  total_cost?: number;
  models_used?: { [model: string]: number };
  providers_used?: { [provider: string]: number };
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

export interface LiteLLMRequest {
  id: string;
  request_id: string;
  call_type: string;
  api_key: string;
  api_key_name?: string;
  api_key_id?: string;
  model: string;
  model_group?: string;
  custom_llm_provider?: string;
  user?: string;
  cost: number;
  spend: number;
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  start_time: string;
  end_time: string;
  completion_start_time?: string;
  created_at: string;
  session_id?: string;
  status?: string;
  cache_hit?: string;
  cache_key?: string;
  request_tags?: string[];
  team_id?: string;
  end_user?: string;
  requester_ip_address?: string;
  api_base?: string;
  metadata?: any;
  messages?: any;
  response?: any;
  proxy_server_request?: any;
}

export interface LiteLLMRequestHistoryResponse {
  requests: LiteLLMRequest[];
  total_count: number;
  limit: number;
  offset: number;
  has_more: boolean;
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
  getRequestHistory: async (userId: string, limit = 50, offset = 0): Promise<LiteLLMRequestHistoryResponse> => {
    const response = await apiClient.get(`/users/${userId}/requests?limit=${limit}&offset=${offset}`);
    return response.data as LiteLLMRequestHistoryResponse;
  }
}; 