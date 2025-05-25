// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  tier_id: string;
  role: 'customer' | 'enterprise' | 'support' | 'admin';
  created_at: string;
  updated_at: string;
}

// Tier types
export interface Tier {
  id: string;
  name: string;
  description?: string;
  is_free: boolean;
  price: number;
  created_at: string;
}

// Company types
export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  external_id: string;
  created_at: string;
  updated_at: string;
  modelsCount?: number;
}

// Model types
export interface Model {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  features?: string;
  external_id: string;
  
  // Новые поля из LiteLLM
  providers?: string; // JSON массив провайдеров
  max_input_tokens?: number;
  max_output_tokens?: number;
  mode?: string;
  supports_parallel_function_calling?: boolean;
  supports_vision?: boolean;
  supports_web_search?: boolean;
  supports_reasoning?: boolean;
  supports_function_calling?: boolean;
  supported_openai_params?: string; // JSON массив
  
  created_at: string;
  updated_at: string;
  config?: ModelConfig;
  company?: Company;
}

export interface ModelConfig {
  id: string;
  model_id: string;
  is_free: boolean;
  is_enabled: boolean;
  input_token_cost?: number;
  output_token_cost?: number;
  created_at: string;
  updated_at: string;
}

// Rate limit types
export interface RateLimit {
  id: string;
  model_id: string;
  tier_id: string;
  requests_per_minute: number;
  requests_per_day: number;
  tokens_per_minute: number;
  tokens_per_day: number;
  created_at: string;
  updated_at: string;
  tier?: Tier;
}

// API Key types
export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  external_id?: string;
  name?: string;
  created_at: string;
  expires_at?: string;
}

// Request types
export interface Request {
  id: string;
  user_id: string;
  model_id: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  created_at: string;
  model?: Model;
}

// User limits types
export interface UserLimits {
  user_id: string;
  monthly_token_limit?: number;
  balance: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  tier_id?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Redux store types
export interface RootState {
  auth: AuthState;
  companies: CompaniesState;
  models: ModelsState;
  requests: RequestsState;
  admin: AdminState;
}

export interface CompaniesState {
  companies: Company[];
  selectedCompany: Company | null;
  isLoading: boolean;
  error: string | null;
}

export interface ModelsState {
  models: Model[];
  selectedModel: Model | null;
  isLoading: boolean;
  error: string | null;
}

export interface RequestsState {
  requests: Request[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AdminState {
  users: User[];
  tiers: Tier[];
  rateLimits: RateLimit[];
  isLoading: boolean;
  error: string | null;
}

// Filter and sort types
export interface ModelFilters {
  company_id?: string;
  is_free?: boolean;
  is_enabled?: boolean;
  search?: string;
}

export interface RequestFilters {
  model_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
} 