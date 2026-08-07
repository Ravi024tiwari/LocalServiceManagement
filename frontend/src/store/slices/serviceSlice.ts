import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { serviceApi } from '@/services/service.service';

export interface ServiceItem {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration?: string;
  images: string[];
  is_available: boolean;
  rating?: number;
  reviewsCount?: number;
  bookingsCount?: number;
  status?: 'Active' | 'Inactive' | 'Draft';
  createdAt?: string;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  draftServices: number;
}

interface ServiceState {
  services: ServiceItem[];
  myServices: ServiceItem[];
  stats: ServiceStats;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  myServices: [],
  stats: {
    totalServices: 0,
    activeServices: 0,
    inactiveServices: 0,
    draftServices: 0,
  },
  isLoading: false,
  error: null,
};

// Async Thunk to fetch provider's services & stats
export const fetchMyServices = createAsyncThunk(
  'service/fetchMyServices',
  async (params: { category?: string; is_available?: boolean } | void, { rejectWithValue }) => {
    try {
      const data = await serviceApi.getMyServices(params || undefined);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch provider services');
    }
  }
);

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<ServiceItem[]>) => {
      state.services = action.payload;
    },
    setMyServices: (state, action: PayloadAction<ServiceItem[]>) => {
      state.myServices = action.payload;
    },
    addService: (state, action: PayloadAction<ServiceItem>) => {
      state.services.unshift(action.payload);
      state.myServices.unshift(action.payload);
      state.stats.totalServices += 1;
      if (action.payload.is_available) {
        state.stats.activeServices += 1;
      } else {
        state.stats.inactiveServices += 1;
      }
    },
    removeService: (state, action: PayloadAction<string>) => {
      state.myServices = state.myServices.filter((s) => s._id !== action.payload);
      state.services = state.services.filter((s) => s._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyServices.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.myServices = action.payload.services || [];
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setServices, setMyServices, addService, removeService } = serviceSlice.actions;
export default serviceSlice.reducer;
