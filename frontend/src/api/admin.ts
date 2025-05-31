import { ApiResponse, User, Tier, RateLimit, ModelConfig } from '../types';
import { apiClient } from './client';
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
    return apiClient.get<ApiResponse<User[]>>('/admin/users');
  },

  updateUser: (id: string, data: Partial<User>): Promise<{ data: ApiResponse<User> }> => {
    return apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
  },

  deleteUser: (id: string): Promise<{ data: ApiResponse<null> }> => {
    return apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
  },

  approveUser: (id: string): Promise<{ data: ApiResponse<User> }> => {
    return apiClient.post<ApiResponse<User>>(`/admin/users/${id}/approve`);
  },

  // Tiers
  getTiers: (): Promise<{ data: ApiResponse<Tier[]> }> => {
    return apiClient.get<ApiResponse<Tier[]>>('/admin/tiers');
  },

  createTier: (data: Omit<Tier, 'id' | 'created_at'>): Promise<{ data: ApiResponse<Tier> }> => {
    return apiClient.post<ApiResponse<Tier>>('/admin/tiers', data);
  },

  updateTier: (id: string, data: Partial<Tier>): Promise<{ data: ApiResponse<Tier> }> => {
    return apiClient.put<ApiResponse<Tier>>(`/admin/tiers/${id}`, data);
  },

  deleteTier: (id: string): Promise<{ data: ApiResponse<null> }> => {
    return apiClient.delete<ApiResponse<null>>(`/admin/tiers/${id}`);
  },

  // Rate Limits
  getRateLimits: (): Promise<{ data: ApiResponse<RateLimit[]> }> => {
    return apiClient.get<ApiResponse<RateLimit[]>>('/admin/rate-limits');
  },

  createRateLimit: (data: Omit<RateLimit, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ApiResponse<RateLimit> }> => {
    return apiClient.post<ApiResponse<RateLimit>>('/admin/rate-limits', data);
  },

  updateRateLimit: (id: string, data: Partial<RateLimit>): Promise<{ data: ApiResponse<RateLimit> }> => {
    return apiClient.put<ApiResponse<RateLimit>>(`/admin/rate-limits/${id}`, data);
  },

  deleteRateLimit: (id: string): Promise<{ data: ApiResponse<null> }> => {
    return apiClient.delete<ApiResponse<null>>(`/admin/rate-limits/${id}`);
  },

  // Model Configs
  getModelConfigs: (): Promise<{ data: ApiResponse<ModelConfig[]> }> => {
    return apiClient.get<ApiResponse<ModelConfig[]>>('/admin/model-configs');
  },

  updateModelConfig: (id: string, data: Partial<ModelConfig>): Promise<{ data: ApiResponse<ModelConfig> }> => {
    return apiClient.put<ApiResponse<ModelConfig>>(`/admin/model-configs/${id}`, data);
  },

  // Sync
  syncModels: (): Promise<{ data: ApiResponse<{ message: string }> }> => {
    return apiClient.post<ApiResponse<{ message: string }>>('/admin/models/sync');
  },

  syncCompanies: (): Promise<{ data: ApiResponse<{ message: string }> }> => {
    return apiClient.post<ApiResponse<{ message: string }>>('/admin/companies/sync');
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
  try {
    await apiClient.put(`/admin/models/${data.model_id}`, data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при обновлении модели');
  }
};

export const deleteModel = async (modelId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/models/${modelId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при удалении модели');
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

// API функции для компаний

export const syncCompaniesFromLiteLLM = async (): Promise<void> => {
  try {
    await apiClient.post('/admin/companies/sync');
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при синхронизации компаний');
  }
};

export const syncModelsFromLiteLLM = async (): Promise<void> => {
  try {
    await apiClient.post('/admin/models/sync');
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при синхронизации моделей');
  }
};

export const syncModelsFromModelGroup = async (): Promise<void> => {
  try {
    await apiClient.post('/admin/models/sync-model-group');
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при синхронизации моделей из model group');
  }
};

export const createCompany = async (data: {
  name: string;
  logo_url?: string;
  description?: string;
  external_id?: string;
}): Promise<void> => {
  try {
    console.log('Создаем компанию с данными:', data);
    const response = await apiClient.post('/admin/companies', data);
    console.log('Компания создана, ответ сервера:', response.data);
  } catch (error: any) {
    console.error('Ошибка при создании компании:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при создании компании');
  }
};

export const updateCompany = async (id: string, data: {
  name?: string;
  logo_url?: string;
  description?: string;
  external_id?: string;
}): Promise<void> => {
  try {
    console.log('Обновляем компанию', id, 'с данными:', data);
    const response = await apiClient.put(`/admin/companies/${id}`, data);
    console.log('Компания обновлена, ответ сервера:', response.data);
  } catch (error: any) {
    console.error('Ошибка при обновлении компании:', error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при обновлении компании');
  }
};

export const deleteCompany = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/companies/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при удалении компании');
  }
};

export const addModelToCompany = async (companyId: string, data: {
  name: string;
  description?: string;
  features?: string;
  external_id?: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  mode?: string;
  supports_parallel_function_calling?: boolean;
  supports_vision?: boolean;
  supports_web_search?: boolean;
  supports_reasoning?: boolean;
  supports_function_calling?: boolean;
  input_token_cost?: number;
  output_token_cost?: number;
  is_free?: boolean;
  is_enabled?: boolean;
}): Promise<void> => {
  try {
    await apiClient.post('/admin/models', {
      company_id: companyId,
      name: data.name,
      description: data.description,
      features: data.features,
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при добавлении модели к компании');
  }
};

export const getAllModels = async (): Promise<{ data: any[] }> => {
  try {
    const response = await apiClient.get<{ data: any[] }>('/admin/models');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при получении списка моделей');
  }
};

export const linkModelToCompany = async (modelId: string, companyId: string): Promise<void> => {
  try {
    await apiClient.put(`/admin/models/${modelId}`, {
      company_id: companyId,
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при связывании модели с компанией');
  }
};

// Функции для загрузки логотипов
export const uploadLogo = async (file: File): Promise<string> => {
  try {
    console.log('Начинаем загрузку логотипа:', file.name, file.type, file.size);
    
    const formData = new FormData();
    formData.append('logo', file);

    console.log('Отправляем запрос на /admin/upload/logo');
    
    const response = await apiClient.post('/admin/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Ответ сервера:', response.data);
    console.log('Структура ответа:', JSON.stringify(response.data, null, 2));
    
    // Проверяем разные возможные структуры ответа
    let logoUrl = null;
    const responseData = response.data as any;
    
    if (responseData && responseData.data && responseData.data.url) {
      logoUrl = responseData.data.url;
    } else if (responseData && responseData.url) {
      logoUrl = responseData.url;
    } else if (typeof responseData === 'string') {
      logoUrl = responseData;
    }
    
    if (logoUrl) {
      console.log('Извлеченный URL логотипа:', logoUrl);
      
      // Если URL относительный, делаем его абсолютным для backend
      if (logoUrl.startsWith('/uploads/')) {
        logoUrl = `http://localhost:8080${logoUrl}`;
        console.log('Преобразованный URL логотипа:', logoUrl);
      }
      
      return logoUrl;
    } else {
      console.error('Неверная структура ответа. Ожидался URL логотипа, получено:', response.data);
      throw new Error('Неверный формат ответа сервера - URL логотипа не найден');
    }
  } catch (error: any) {
    console.error('Ошибка при загрузке логотипа:', error);
    
    if (error.response) {
      console.error('Ответ сервера:', error.response.status, error.response.data);
      throw new Error(error.response?.data?.error || error.response?.data?.message || `Ошибка сервера: ${error.response.status}`);
    } else if (error.request) {
      console.error('Запрос не получил ответ:', error.request);
      throw new Error('Сервер не отвечает. Проверьте подключение к backend.');
    } else {
      console.error('Ошибка настройки запроса:', error.message);
      throw new Error('Ошибка при настройке запроса: ' + error.message);
    }
  }
};

export const deleteLogo = async (logoUrl: string): Promise<void> => {
  try {
    await apiClient.delete('/admin/upload/logo', {
      params: { url: logoUrl }
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при удалении логотипа');
  }
}; 