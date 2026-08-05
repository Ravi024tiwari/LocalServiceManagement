import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  adminBookingApi,
  type AdminBookingItem,
  type AdminBookingPagination,
  type AdminBookingStats,
} from "@/services/adminBooking.api";

export interface AdminBookingState {
  bookings: AdminBookingItem[];
  pagination: AdminBookingPagination;
  stats: AdminBookingStats;
  filters: {
    search: string;
    status: string; // 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
    providerId: string;
    serviceId: string;
    startDate: string;
    endDate: string;
  };
  selectedBooking: AdminBookingItem | null;
  isLoading: boolean;
  isDetailsLoading: boolean;
  error: string | null;
}

const initialState: AdminBookingState = {
  bookings: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    limit: 10,
  },
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  },
  filters: {
    search: "",
    status: "ALL",
    providerId: "ALL",
    serviceId: "ALL",
    startDate: "",
    endDate: "",
  },
  selectedBooking: null,
  isLoading: false,
  isDetailsLoading: false,
  error: null,
};

// Async Thunk: Fetch Admin Bookings
export const fetchAdminBookings = createAsyncThunk(
  "adminBooking/fetchAdminBookings",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
      providerId?: string;
      serviceId?: string;
      startDate?: string;
      endDate?: string;
    } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const res = await adminBookingApi.getBookings(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin bookings");
    }
  }
);

// Async Thunk: Fetch Booking Details
export const fetchAdminBookingDetails = createAsyncThunk(
  "adminBooking/fetchAdminBookingDetails",
  async (bookingId: string, { rejectWithValue }) => {
    try {
      const res = await adminBookingApi.getBookingById(bookingId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch booking details");
    }
  }
);

const adminBookingSlice = createSlice({
  name: "adminBooking",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.pagination.currentPage = 1;
    },
    setProviderFilter: (state, action: PayloadAction<string>) => {
      state.filters.providerId = action.payload;
      state.pagination.currentPage = 1;
    },
    setServiceFilter: (state, action: PayloadAction<string>) => {
      state.filters.serviceId = action.payload;
      state.pagination.currentPage = 1;
    },
    setDateRangeFilter: (state, action: PayloadAction<{ startDate: string; endDate: string }>) => {
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
      state.pagination.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.currentPage = 1;
    },
    setSelectedBooking: (state, action: PayloadAction<AdminBookingItem | null>) => {
      state.selectedBooking = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        search: "",
        status: "ALL",
        providerId: "ALL",
        serviceId: "ALL",
        startDate: "",
        endDate: "",
      };
      state.pagination.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminBookings
      .addCase(fetchAdminBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload) {
          state.bookings = action.payload.bookings || [];
          if (action.payload.pagination) state.pagination = action.payload.pagination;
          if (action.payload.stats) state.stats = action.payload.stats;
        }
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // fetchAdminBookingDetails
      .addCase(fetchAdminBookingDetails.pending, (state) => {
        state.isDetailsLoading = true;
      })
      .addCase(fetchAdminBookingDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.isDetailsLoading = false;
        state.selectedBooking = action.payload;
      })
      .addCase(fetchAdminBookingDetails.rejected, (state) => {
        state.isDetailsLoading = false;
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setProviderFilter,
  setServiceFilter,
  setDateRangeFilter,
  setPage,
  setLimit,
  setSelectedBooking,
  clearFilters,
} = adminBookingSlice.actions;

export default adminBookingSlice.reducer;
