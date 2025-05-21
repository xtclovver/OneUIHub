import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Model {
  id: string;
  companyId: string;
  name: string;
  description: string;
  features: string;
}

export interface ModelConfig {
  id: string;
  modelId: string;
  isFree: boolean;
  isEnabled: boolean;
  inputTokenCost: number;
  outputTokenCost: number;
}

export interface RateLimit {
  id: string;
  modelId: string;
  tierId: string;
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerMinute: number;
  tokensPerDay: number;
}

export interface ModelState {
  models: Model[];
  selectedModel: Model | null;
  modelConfig: ModelConfig | null;
  rateLimits: RateLimit[];
  loading: boolean;
  error: string | null;
}

const initialState: ModelState = {
  models: [],
  selectedModel: null,
  modelConfig: null,
  rateLimits: [],
  loading: false,
  error: null,
};

export const fetchModels = createAsyncThunk(
  'models/fetchModels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/models');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения моделей');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

export const fetchModelsByCompany = createAsyncThunk(
  'models/fetchModelsByCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/companies/${companyId}/models`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения моделей компании');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

export const fetchModelById = createAsyncThunk(
  'models/fetchModelById',
  async (modelId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/models/${modelId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения модели');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

export const fetchModelConfig = createAsyncThunk(
  'models/fetchModelConfig',
  async (modelId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/models/${modelId}/config`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения конфигурации модели');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

export const fetchRateLimits = createAsyncThunk(
  'models/fetchRateLimits',
  async (modelId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/models/${modelId}/rate-limits`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения лимитов');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

const modelSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    clearSelectedModel: (state) => {
      state.selectedModel = null;
      state.modelConfig = null;
      state.rateLimits = [];
    },
    setSelectedModel: (state, action: PayloadAction<Model>) => {
      state.selectedModel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all models
      .addCase(fetchModels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action: PayloadAction<Model[]>) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch models by company
      .addCase(fetchModelsByCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModelsByCompany.fulfilled, (state, action: PayloadAction<Model[]>) => {
        state.loading = false;
        state.models = action.payload;
      })
      .addCase(fetchModelsByCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch model by ID
      .addCase(fetchModelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModelById.fulfilled, (state, action: PayloadAction<Model>) => {
        state.loading = false;
        state.selectedModel = action.payload;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch model config
      .addCase(fetchModelConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModelConfig.fulfilled, (state, action: PayloadAction<ModelConfig>) => {
        state.loading = false;
        state.modelConfig = action.payload;
      })
      .addCase(fetchModelConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch rate limits
      .addCase(fetchRateLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRateLimits.fulfilled, (state, action: PayloadAction<RateLimit[]>) => {
        state.loading = false;
        state.rateLimits = action.payload;
      })
      .addCase(fetchRateLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedModel, setSelectedModel } = modelSlice.actions;
export default modelSlice.reducer; 