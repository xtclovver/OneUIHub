export interface ModelGroupInfo {
  model_group: string;
  providers: string[];
  max_input_tokens: number;
  max_output_tokens: number;
  input_cost_per_token: number;
  output_cost_per_token: number;
  mode: string;
  tpm: number | null;
  rpm: number | null;
  supports_parallel_function_calling: boolean;
  supports_vision: boolean;
  supports_web_search: boolean;
  supports_reasoning: boolean;
  supports_function_calling: boolean;
  supported_openai_params: string[];
  configurable_clientside_auth_params: any;
}

export interface ModelInfo {
  id: string;
  db_model: boolean;
  key: string;
  max_tokens: number;
  max_input_tokens: number;
  max_output_tokens: number;
  input_cost_per_token: number;
  cache_creation_input_token_cost: number | null;
  cache_read_input_token_cost: number | null;
  input_cost_per_character: number | null;
  input_cost_per_token_above_128k_tokens: number | null;
  input_cost_per_token_above_200k_tokens: number | null;
  input_cost_per_query: number | null;
  input_cost_per_second: number | null;
  input_cost_per_audio_token: number | null;
  input_cost_per_token_batches: number | null;
  output_cost_per_token_batches: number | null;
  output_cost_per_token: number;
  output_cost_per_audio_token: number | null;
  output_cost_per_character: number | null;
  output_cost_per_reasoning_token: number | null;
  output_cost_per_token_above_128k_tokens: number | null;
  output_cost_per_character_above_128k_tokens: number | null;
  output_cost_per_token_above_200k_tokens: number | null;
  output_cost_per_second: number | null;
  output_cost_per_image: number | null;
  output_vector_size: number | null;
  litellm_provider: string;
  mode: string;
  supports_system_messages: boolean | null;
  supports_response_schema: boolean | null;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_tool_choice: boolean;
  supports_assistant_prefill: boolean;
  supports_prompt_caching: boolean;
  supports_audio_input: boolean;
  supports_audio_output: boolean;
  supports_pdf_input: boolean;
  supports_embedding_image_input: boolean;
  supports_native_streaming: boolean | null;
  supports_web_search: boolean;
  supports_reasoning: boolean;
  search_context_cost_per_query: any;
  tpm: number | null;
  rpm: number | null;
  supported_openai_params: string[];
}

export interface LiteLLMModel {
  model_name: string;
  litellm_params: {
    custom_llm_provider: string;
    litellm_credential_name: string;
    use_in_pass_through: boolean;
    use_litellm_proxy: boolean;
    merge_reasoning_content_in_choices: boolean;
    model: string;
    cache_control_injection_points: Array<{ location: string }>;
  };
  model_info: ModelInfo;
}

export interface UserKey {
  token: string;
  key_name: string;
  key_alias: string;
  spend: number;
  max_budget: number | null;
  expires: string | null;
  models: string[];
  aliases: Record<string, any>;
  config: Record<string, any>;
  user_id: string;
  team_id: string | null;
  max_parallel_requests: number | null;
  metadata: Record<string, any>;
  tpm_limit: number | null;
  rpm_limit: number | null;
  budget_duration: string | null;
  budget_reset_at: string | null;
  allowed_cache_controls: string[];
  allowed_routes: string[];
  permissions: Record<string, any>;
  model_spend: Record<string, any>;
  model_max_budget: Record<string, any>;
  soft_budget_cooldown: boolean;
  blocked: boolean | null;
  litellm_budget_table: any;
  org_id: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  team_alias: string;
}

export interface UserInfo {
  user_id: string | null;
  user_info: any;
  keys: UserKey[];
  teams: any[];
}

export interface GlobalSpend {
  spend: number;
  max_budget: number;
}

export interface SpendLog {
  date: string;
  spend: number;
}

export interface ActivityData {
  date: string;
  api_requests: number;
  total_tokens: number;
}

export interface GlobalActivity {
  daily_data: ActivityData[];
  sum_api_requests: number;
  sum_total_tokens: number;
}

export interface AdminStats {
  totalUsers: number;
  activeModels: number;
  requestsToday: number;
  monthlyRevenue: number;
  totalSpend: number;
  totalRequests: number;
  totalTokens: number;
}

export interface CreateModelRequest {
  model_name: string;
  litellm_params: Record<string, any>;
  model_info?: Partial<ModelInfo>;
}

export interface UpdateModelRequest {
  model_id: string;
  model_name?: string;
  model_info?: Partial<ModelInfo>;
}

export interface CreateUserKeyRequest {
  key_alias: string;
  models?: string[];
  max_budget?: number;
  expires?: string;
  tpm_limit?: number;
  rpm_limit?: number;
  metadata?: Record<string, any>;
}

export interface UpdateUserKeyRequest {
  key_alias?: string;
  models?: string[];
  max_budget?: number;
  expires?: string;
  tpm_limit?: number;
  rpm_limit?: number;
  metadata?: Record<string, any>;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyRequest {
  name: string;
  logo_url?: string;
  description?: string;
  external_id?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  logo_url?: string;
  description?: string;
  external_id?: string;
} 