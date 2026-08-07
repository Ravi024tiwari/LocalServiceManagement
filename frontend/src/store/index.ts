import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import providerProfileReducer from './slices/providerProfileSlice';
import serviceReducer from './slices/serviceSlice';
import likedServiceReducer from './slices/likedServiceSlice';
import providerCustomerReducer from './slices/providerCustomerSlice';
import adminDashboardReducer from './slices/adminDashboardSlice';
import adminProviderReducer from './slices/adminProviderSlice';
import adminBookingReducer from './slices/adminBookingSlice';
import adminPaymentReducer from './slices/adminPaymentSlice';
import adminReviewReducer from './slices/adminReviewSlice';
import adminCategoryReducer from './slices/adminCategorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    providerProfile: providerProfileReducer,
    service: serviceReducer,
    likedService: likedServiceReducer,
    providerCustomer: providerCustomerReducer,
    adminDashboard: adminDashboardReducer,
    adminProvider: adminProviderReducer,
    adminBooking: adminBookingReducer,
    adminPayment: adminPaymentReducer,
    adminReview: adminReviewReducer,
    adminCategory: adminCategoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
