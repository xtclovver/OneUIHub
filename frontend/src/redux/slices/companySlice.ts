import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { mockApi } from '../../api';

export interface Company {
  id: string;
  name: string;
  logoURL: string;
  description: string;
}

export interface CompanyState {
  companies: Company[];
  selectedCompany: Company | null;
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  selectedCompany: null,
  loading: false,
  error: null,
};

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      // Используем мок данные для разработки
      // const response = await api.get('/companies');
      const response = await mockApi.getCompanies();
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения компаний');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  'companies/fetchCompanyById',
  async (companyId: string, { rejectWithValue }) => {
    try {
      // Используем мок данные для разработки
      // const response = await api.get(`/companies/${companyId}`);
      const response = await mockApi.getCompanyById(companyId);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        return rejectWithValue(error.response.data.message || 'Ошибка получения компании');
      }
      return rejectWithValue('Ошибка сервера');
    }
  }
);

const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearSelectedCompany: (state) => {
      state.selectedCompany = null;
    },
    setSelectedCompany: (state, action: PayloadAction<Company>) => {
      state.selectedCompany = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action: PayloadAction<Company[]>) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action: PayloadAction<Company>) => {
        state.loading = false;
        state.selectedCompany = action.payload;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedCompany, setSelectedCompany } = companySlice.actions;
export default companySlice.reducer; 