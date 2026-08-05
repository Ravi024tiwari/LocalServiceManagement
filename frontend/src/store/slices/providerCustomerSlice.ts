import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  providerCustomerApi,
  type CustomerHistoryItem,
  type ProviderCustomerPagination,
  type ProviderCustomerStats,
  type CustomerDetailsResponse,
} from "@/services/providerCustomer.api";

export interface ProviderCustomerState {
  customers: CustomerHistoryItem[];
  pagination: ProviderCustomerPagination;
  stats: ProviderCustomerStats;
  filters: {
    search: string;
    serviceCategory: string;
    bookingCountFilter: string;
    timeRange: string;
  };
  selectedCustomerDetails: CustomerDetailsResponse | null;
  isLoading: boolean;
  isLoadingDetails: boolean;
  error: string | null;
}

const initialState: ProviderCustomerState = {
  customers: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
    limit: 10,
  },
  stats: {
    totalCustomers: 0,
    totalBookings: 0,
    totalSpent: 0,
    averageRating: 4.8,
  },
  filters: {
    search: "",
    serviceCategory: "All Services",
    bookingCountFilter: "All Bookings",
    timeRange: "All Time",
  },
  selectedCustomerDetails: null,
  isLoading: false,
  isLoadingDetails: false,
  error: null,
};

// Async Thunk: Fetch Paginated Customers
export const fetchProviderCustomers = createAsyncThunk(
  "providerCustomer/fetchProviderCustomers",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      serviceCategory?: string;
      timeRange?: string;
    } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const res = await providerCustomerApi.getProviderCustomers(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch provider customer list");
    }
  }
);

// Async Thunk: Fetch Customer Details & Booking History
export const fetchCustomerDetails = createAsyncThunk(
  "providerCustomer/fetchCustomerDetails",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const res = await providerCustomerApi.getCustomerDetails(customerId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch customer details");
    }
  }
);

const providerCustomerSlice = createSlice({
  name: "providerCustomer",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setServiceCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.serviceCategory = action.payload;
      state.pagination.currentPage = 1; // Reset to first page on filter change
    },
    setBookingCountFilter: (state, action: PayloadAction<string>) => {
      state.filters.bookingCountFilter = action.payload;
      state.pagination.currentPage = 1;
    },
    setTimeRangeFilter: (state, action: PayloadAction<string>) => {
      state.filters.timeRange = action.payload;
      state.pagination.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    clearSelectedCustomerDetails: (state) => {
      state.selectedCustomerDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProviderCustomers
      .addCase(fetchProviderCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderCustomers.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload) {
          state.customers = action.payload.customers || [];
          if (action.payload.pagination) {
            state.pagination = action.payload.pagination;
          }
          if (action.payload.stats) {
            state.stats = action.payload.stats;
          }
        }
      })
      .addCase(fetchProviderCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // fetchCustomerDetails
      .addCase(fetchCustomerDetails.pending, (state) => {
        state.isLoadingDetails = true;
      })
      .addCase(fetchCustomerDetails.fulfilled, (state, action: PayloadAction<CustomerDetailsResponse>) => {
        state.isLoadingDetails = false;
        state.selectedCustomerDetails = action.payload;
      })
      .addCase(fetchCustomerDetails.rejected, (state) => {
        state.isLoadingDetails = false;
      });
  },
});

export const {
  setSearchQuery,
  setServiceCategoryFilter,
  setBookingCountFilter,
  setTimeRangeFilter,
  setPage,
  clearSelectedCustomerDetails,
} = providerCustomerSlice.actions;

export default providerCustomerSlice.reducer;
