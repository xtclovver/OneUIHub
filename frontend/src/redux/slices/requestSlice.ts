import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Request {
  id: string;
  userId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  createdAt: string;
  model?: {
    name: string;
  };
}

interface RequestState {
  requests: Request[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: RequestState = {
  requests: [],
  totalCount: 0,
  loading: false,
  error: null,
};

export const fetchUserRequests = createAsyncThunk(
  'requests/fetchUserRequests',
  async ({ offset = 0, limit = 10 }: { offset?: number; limit?: number }, { rejectWithValue, getState }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('Требуется авторизация');
      }
      
      const response = await axios.get(`/api/requests?offset=${offset}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      return {
        requests: response.data.requests,
        totalCount: response.data.totalCount
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения запросов');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearRequests: (state) => {
      state.requests = [];
      state.totalCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRequests.fulfilled, (state, action: PayloadAction<{ requests: Request[]; totalCount: number }>) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchUserRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRequests } = requestSlice.actions;
export default requestSlice.reducer; 