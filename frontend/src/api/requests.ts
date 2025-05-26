import { apiClient } from './client';
import { ApiResponse, PaginatedResponse, Request, RequestFilters } from '../types';

export const requestsAPI = {
  getAll: (params: { page?: number; limit?: number } & RequestFilters): Promise<{ data: ApiResponse<PaginatedResponse<Request>> }> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.model_id) searchParams.append('model_id', params.model_id);
    if (params.date_from) searchParams.append('date_from', params.date_from);
    if (params.date_to) searchParams.append('date_to', params.date_to);

    const queryString = searchParams.toString();
    const url = queryString ? `/requests?${queryString}` : '/requests';
    
    return apiClient.get<ApiResponse<PaginatedResponse<Request>>>(url);
  },

  getById: (id: string): Promise<{ data: ApiResponse<Request> }> => {
    return apiClient.get<ApiResponse<Request>>(`/requests/${id}`);
  },
}; 