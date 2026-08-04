import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import providerProfileReducer from './slices/providerProfileSlice';
import serviceReducer from './slices/serviceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    providerProfile: providerProfileReducer,
    service: serviceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
