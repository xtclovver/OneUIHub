import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ModelsState, Model, ModelFilters } from '../../types';
import { modelsAPI } from '../../api/models';

const initialState: ModelsState = {
  models: [],
  selectedModel: null,
  isLoading: false,
  error: null,
};

export const fetchModels = createAsyncThunk(
  'models/fetchModels',
  async (filters: ModelFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await modelsAPI.getAll(filters);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки моделей');
    }
  }
);

export const fetchModelById = createAsyncThunk(
  'models/fetchModelById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await modelsAPI.getById(id);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки модели');
    }
  }
);

export const fetchModelsByCompany = createAsyncThunk(
  'models/fetchModelsByCompany',
  async (companyId: string, { rejectWithValue }) => {
    try {
      const response = await modelsAPI.getByCompany(companyId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка загрузки моделей компании');
    }
  }
);

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    clearSelectedModel: (state) => {
      state.selectedModel = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch models
      .addCase(fetchModels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.models = action.payload;
      })
      .addCase(fetchModels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch model by ID
      .addCase(fetchModelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedModel = action.payload;
      })
      .addCase(fetchModelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch models by company
      .addCase(fetchModelsByCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModelsByCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.models = action.payload;
      })
      .addCase(fetchModelsByCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedModel, clearError } = modelsSlice.actions;
export default modelsSlice.reducer; 