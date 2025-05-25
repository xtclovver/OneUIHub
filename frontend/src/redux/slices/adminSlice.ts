import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AdminState, User, Tier, RateLimit } from '../../types';
import { adminAPI } from '../../api/admin';

const initialState: AdminState = {
  users: [],
  tiers: [],
  rateLimits: [],
  isLoading: false,
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки пользователей');
    }
  }
);

export const fetchTiers = createAsyncThunk(
  'admin/fetchTiers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getTiers();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки тарифов');
    }
  }
);

export const fetchRateLimits = createAsyncThunk(
  'admin/fetchRateLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getRateLimits();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки лимитов');
    }
  }
);

export const syncModels = createAsyncThunk(
  'admin/syncModels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.syncModels();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка синхронизации моделей');
    }
  }
);

export const syncCompanies = createAsyncThunk(
  'admin/syncCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.syncCompanies();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка синхронизации компаний');
    }
  }
);

export const approveUser = createAsyncThunk(
  'admin/approveUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await adminAPI.approveUser(userId);
      return { userId, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка одобрения пользователя');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch tiers
      .addCase(fetchTiers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTiers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tiers = action.payload;
      })
      .addCase(fetchTiers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch rate limits
      .addCase(fetchRateLimits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRateLimits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rateLimits = action.payload;
      })
      .addCase(fetchRateLimits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sync models
      .addCase(syncModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncModels.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(syncModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Sync companies
      .addCase(syncCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncCompanies.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(syncCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Approve user
      .addCase(approveUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const userIndex = state.users.findIndex(user => user.id === action.payload.userId);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], ...action.payload.data };
        }
      })
      .addCase(approveUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer; 