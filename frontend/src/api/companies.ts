import { apiClient } from './client';
import { ApiResponse, Company, Model } from '../types';

export const companiesAPI = {
  getAll: (): Promise<{ data: ApiResponse<Company[]> }> => {
    return apiClient.get<ApiResponse<Company[]>>('/companies');
  },

  getById: (id: string): Promise<{ data: ApiResponse<Company> }> => {
    return apiClient.get<ApiResponse<Company>>(`/companies/${id}`);
  },

  getModels: (id: string): Promise<{ data: ApiResponse<Model[]> }> => {
    return apiClient.get<ApiResponse<Model[]>>(`/companies/${id}/models`);
  },
}; 