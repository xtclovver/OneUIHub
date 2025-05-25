import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { liteLLMAPI, LiteLLMUsage, LiteLLMApiKey, LiteLLMBudget } from '../../api/litellm';

interface LiteLLMState {
  usage: LiteLLMUsage | null;
  apiKeys: LiteLLMApiKey[];
  budget: LiteLLMBudget | null;
  usageStats: any;
  requestHistory: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LiteLLMState = {
  usage: null,
  apiKeys: [],
  budget: null,
  usageStats: null,
  requestHistory: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserUsage = createAsyncThunk(
  'litellm/fetchUserUsage',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.getUserUsage(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки данных об использовании');
    }
  }
);

export const fetchUserApiKeys = createAsyncThunk(
  'litellm/fetchUserApiKeys',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.getUserApiKeys(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки API ключей');
    }
  }
);

export const createApiKey = createAsyncThunk(
  'litellm/createApiKey',
  async ({ userId, name }: { userId: string; name: string }, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.createApiKey(userId, name);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка создания API ключа');
    }
  }
);

export const deactivateApiKey = createAsyncThunk(
  'litellm/deactivateApiKey',
  async (keyId: string, { rejectWithValue }) => {
    try {
      await liteLLMAPI.deactivateApiKey(keyId);
      return keyId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка деактивации API ключа');
    }
  }
);

export const fetchUserBudget = createAsyncThunk(
  'litellm/fetchUserBudget',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.getUserBudget(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки бюджета');
    }
  }
);

export const updateUserBudget = createAsyncThunk(
  'litellm/updateUserBudget',
  async ({ userId, monthlyLimit }: { userId: string; monthlyLimit: number }, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.updateUserBudget(userId, monthlyLimit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка обновления бюджета');
    }
  }
);

export const fetchUsageStats = createAsyncThunk(
  'litellm/fetchUsageStats',
  async ({ userId, period }: { userId: string; period: 'day' | 'week' | 'month' }, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.getUsageStats(userId, period);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки статистики');
    }
  }
);

export const fetchRequestHistory = createAsyncThunk(
  'litellm/fetchRequestHistory',
  async ({ userId, limit, offset }: { userId: string; limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      return await liteLLMAPI.getRequestHistory(userId, limit, offset);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки истории запросов');
    }
  }
);

const litellmSlice = createSlice({
  name: 'litellm',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.usage = null;
      state.apiKeys = [];
      state.budget = null;
      state.usageStats = null;
      state.requestHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Usage
      .addCase(fetchUserUsage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserUsage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usage = action.payload;
      })
      .addCase(fetchUserUsage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch API Keys
      .addCase(fetchUserApiKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserApiKeys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apiKeys = action.payload;
      })
      .addCase(fetchUserApiKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Create API Key
      .addCase(createApiKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.isLoading = false;
        state.apiKeys.push(action.payload);
      })
      .addCase(createApiKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Deactivate API Key
      .addCase(deactivateApiKey.fulfilled, (state, action) => {
        state.apiKeys = state.apiKeys.filter(key => key.id !== action.payload);
      })

      // Fetch Budget
      .addCase(fetchUserBudget.fulfilled, (state, action) => {
        state.budget = action.payload;
      })

      // Update Budget
      .addCase(updateUserBudget.fulfilled, (state, action) => {
        state.budget = action.payload;
      })

      // Fetch Usage Stats
      .addCase(fetchUsageStats.fulfilled, (state, action) => {
        state.usageStats = action.payload;
      })

      // Fetch Request History
      .addCase(fetchRequestHistory.fulfilled, (state, action) => {
        state.requestHistory = action.payload as any[];
      });
  },
});

export const { clearError, clearData } = litellmSlice.actions;
export default litellmSlice.reducer; 