import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import companyReducer from './slices/companySlice';
import modelReducer from './slices/modelSlice';
import requestsReducer from './slices/requestsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    companies: companyReducer,
    models: modelReducer,
    requests: requestsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 