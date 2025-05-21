import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../api';

// Типы данных
interface Model {
  id: string;
  name: string;
  company_id: string;
}

export interface Request {
  id: string;
  user_id: string;
  model_id: string;
  model: Model;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  created_at: string;
}

interface RequestsState {
  requests: Request[];
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  loading: false,
  error: null,
};

// Thunk для получения истории запросов пользователя
export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/requests');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Не удалось загрузить историю запросов');
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearRequestsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action: PayloadAction<Request[]>) => {
        state.requests = action.payload;
        state.loading = false;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRequestsError } = requestsSlice.actions;
export default requestsSlice.reducer; 