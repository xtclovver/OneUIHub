import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../slices/authSlice';
import companiesSlice from '../slices/companiesSlice';
import modelsSlice from '../slices/modelsSlice';
import requestsSlice from '../slices/requestsSlice';
import adminSlice from '../slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    companies: companiesSlice,
    models: modelsSlice,
    requests: requestsSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 