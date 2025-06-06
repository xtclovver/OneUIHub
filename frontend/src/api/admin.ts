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

// Модели - теперь используем наш бекенд с JWT авторизацией
export const getModelGroupInfo = async (): Promise<{ data: ModelGroupInfo[] }> => {
  const response = await apiClient.get<{ data: ModelGroupInfo[] }>('/admin/litellm/models/group-info');
  return response.data;
};

export const getModelsInfo = async (): Promise<{ data: LiteLLMModel[] }> => {
  const response = await apiClient.get<{ data: LiteLLMModel[] }>('/admin/litellm/models/info');
  return response.data;
};

export const createModel = async (data: CreateModelRequest): Promise<void> => {
  await apiClient.post('/admin/litellm/models', data);
};

export const updateModel = async (data: UpdateModelRequest): Promise<void> => {
  try {
    await apiClient.put('/admin/litellm/models', data);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при обновлении модели');
  }
};

export const deleteModel = async (modelId: string): Promise<void> => {
  try {
    await apiClient.delete(`/admin/litellm/models/${modelId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Ошибка при удалении модели');
  }
};

// Пользователи - теперь используем наш бекенд с JWT авторизацией
export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await apiClient.get<UserInfo>('/admin/litellm/users/info');
  return response.data;
};

export const createUserKey = async (data: CreateUserKeyRequest): Promise<void> => {
  await apiClient.post('/admin/litellm/users/keys', data);
};

export const updateUserKey = async (keyId: string, data: UpdateUserKeyRequest): Promise<void> => {
  await apiClient.put(`/admin/litellm/users/keys/${keyId}`, data);
};

export const deleteUserKey = async (keyId: string): Promise<void> => {
  await apiClient.delete(`/admin/litellm/users/keys/${keyId}`);
};

// Статистика и аналитика - теперь используем наш бекенд с JWT авторизацией
export const getGlobalSpend = async (): Promise<GlobalSpend> => {
  const response = await apiClient.get<GlobalSpend>('/admin/litellm/global/spend');
  return response.data;
};

export const getSpendLogs = async (): Promise<SpendLog[]> => {
  const response = await apiClient.get<SpendLog[]>('/admin/litellm/global/spend/logs');
  return response.data;
};

export const getGlobalActivity = async (startDate: string, endDate: string): Promise<GlobalActivity> => {
  const response = await apiClient.get<GlobalActivity>(
    `/admin/litellm/global/activity?start_date=${startDate}&end_date=${endDate}`
  );
  return response.data;
};

// Агрегированная статистика для дашборда - теперь используем наш бекенд с JWT авторизацией
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const response = await apiClient.get<AdminStats>('/admin/litellm/admin/stats');
    return response.data;
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