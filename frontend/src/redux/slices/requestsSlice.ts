import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Определение типов
interface Model {
  id: string;
  name: string;
}

interface Request {
  id: string;
  user_id?: string;
  model: Model;
  created_at: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
}

interface RequestState {
  requests: Request[];
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: RequestState = {
  requests: [],
  loading: false,
  error: null
};

// Thunk для получения списка запросов
export const fetchRequests = createAsyncThunk(
  'requests/fetchRequests',
  async (_, { rejectWithValue }) => {
    try {
      // В реальном приложении это будет API-запрос
      // const response = await axios.get('/api/requests');
      // return response.data;

      // Заглушка для демонстрации
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
      
      return [
        {
          id: '1',
          created_at: new Date().toISOString(),
          model: { id: '1', name: 'GPT-4' },
          input_tokens: 1256,
          output_tokens: 748,
          input_cost: 0.000315,
          output_cost: 0.000674,
          total_cost: 0.000989
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          model: { id: '2', name: 'Claude 3.5 Sonnet' },
          input_tokens: 3450,
          output_tokens: 1290,
          input_cost: 0.000863,
          output_cost: 0.001935,
          total_cost: 0.002798
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          model: { id: '3', name: 'Mistral Medium' },
          input_tokens: 890,
          output_tokens: 566,
          input_cost: 0.000223,
          output_cost: 0.000425,
          total_cost: 0.000648
        },
        {
          id: '4',
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          model: { id: '4', name: 'Claude 3 Opus' },
          input_tokens: 4328,
          output_tokens: 2103,
          input_cost: 0.001082,
          output_cost: 0.001577,
          total_cost: 0.002659
        },
        {
          id: '5',
          created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
          model: { id: '5', name: 'Mistral Large' },
          input_tokens: 2156,
          output_tokens: 1209,
          input_cost: 0.000539,
          output_cost: 0.000907,
          total_cost: 0.001446
        }
      ];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.message || 'Ошибка получения данных');
      }
      return rejectWithValue('Неизвестная ошибка');
    }
  }
);

// Создание слайса
const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action: PayloadAction<Request[]>) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export default requestsSlice.reducer; 