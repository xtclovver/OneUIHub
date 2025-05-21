import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import companyReducer from './slices/companySlice';
import modelReducer from './slices/modelSlice';
import requestReducer from './slices/requestSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companyReducer,
    models: modelReducer,
    requests: requestReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 