import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RequestsState, Request, RequestFilters } from '../../types';
import { requestsAPI } from '../../api/requests';

const initialState: RequestsState = {
  requests: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
};

export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async ({ page = 1, limit = 20, filters }: { page?: number; limit?: number; filters?: RequestFilters }, { rejectWithValue }) => {
    try {
      const response = await requestsAPI.getAll({ page, limit, ...filters });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки запросов');
    }
  }
);

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          hasNext: action.payload.has_next,
          hasPrev: action.payload.has_prev,
        };
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setPage } = requestsSlice.actions;
export default requestsSlice.reducer; 