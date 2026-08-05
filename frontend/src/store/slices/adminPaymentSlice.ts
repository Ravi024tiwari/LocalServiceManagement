import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  adminPaymentApi,
  type PaymentItem,
  type AdminPaymentPagination,
  type AdminPaymentStats,
} from "@/services/adminPayment.api";

export interface AdminPaymentState {
  payments: PaymentItem[];
  pagination: AdminPaymentPagination;
  stats: AdminPaymentStats | null;
  filters: {
    search: string;
    status: string; // 'ALL' | 'Successful' | 'Pending' | 'Failed' | 'Refunded'
    providerId: string;
    method: string; // 'ALL' | 'UPI' | 'Card' | 'Net Banking' | 'Wallet'
    startDate: string;
    endDate: string;
    minAmount: number;
    maxAmount: number;
  };
  selectedPayment: PaymentItem | null;
  isLoading: boolean;
  isStatsLoading: boolean;
  isDetailsLoading: boolean;
  error: string | null;
}

const initialState: AdminPaymentState = {
  payments: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  },
  stats: null,
  filters: {
    search: "",
    status: "ALL",
    providerId: "ALL",
    method: "ALL",
    startDate: "",
    endDate: "",
    minAmount: 0,
    maxAmount: 0,
  },
  selectedPayment: null,
  isLoading: false,
  isStatsLoading: false,
  isDetailsLoading: false,
  error: null,
};

// Async Thunk: Fetch Stats
export const fetchAdminPaymentStats = createAsyncThunk(
  "adminPayment/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminPaymentApi.getStats();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch stats");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async Thunk: Fetch Payments
export const fetchAdminPayments = createAsyncThunk(
  "adminPayment/fetchPayments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { adminPayment: AdminPaymentState };
      const { currentPage, limit } = state.adminPayment.pagination;
      const { search, status, providerId, method, startDate, endDate, minAmount, maxAmount } =
        state.adminPayment.filters;

      const params: any = {
        page: currentPage,
        limit,
      };

      if (search.trim()) params.search = search.trim();
      if (status !== "ALL") params.status = status;
      if (providerId !== "ALL") params.providerId = providerId;
      if (method !== "ALL") params.method = method;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (minAmount > 0) params.minAmount = minAmount;
      if (maxAmount > 0) params.maxAmount = maxAmount;

      const response = await adminPaymentApi.getPayments(params);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch payments");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async Thunk: Fetch Single Payment
export const fetchPaymentById = createAsyncThunk(
  "adminPayment/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await adminPaymentApi.getPaymentById(id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || "Failed to fetch payment detail");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const adminPaymentSlice = createSlice({
  name: "adminPayment",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
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
    setMethodFilter: (state, action: PayloadAction<string>) => {
      state.filters.method = action.payload;
      state.pagination.currentPage = 1;
    },
    setDateRangeFilter: (
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) => {
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
      state.pagination.currentPage = 1;
    },
    setAmountRangeFilter: (
      state,
      action: PayloadAction<{ minAmount: number; maxAmount: number }>
    ) => {
      state.filters.minAmount = action.payload.minAmount;
      state.filters.maxAmount = action.payload.maxAmount;
      state.pagination.currentPage = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        search: "",
        status: "ALL",
        providerId: "ALL",
        method: "ALL",
        startDate: "",
        endDate: "",
        minAmount: 0,
        maxAmount: 0,
      };
      state.pagination.currentPage = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
      state.pagination.currentPage = 1;
    },
    setSelectedPayment: (state, action: PayloadAction<PaymentItem | null>) => {
      state.selectedPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Stats
    builder.addCase(fetchAdminPaymentStats.pending, (state) => {
      state.isStatsLoading = true;
    });
    builder.addCase(fetchAdminPaymentStats.fulfilled, (state, action) => {
      state.isStatsLoading = false;
      state.stats = action.payload;
    });
    builder.addCase(fetchAdminPaymentStats.rejected, (state, action) => {
      state.isStatsLoading = false;
      state.error = action.payload as string;
    });

    // Payments
    builder.addCase(fetchAdminPayments.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAdminPayments.fulfilled, (state, action) => {
      state.isLoading = false;
      state.payments = action.payload.payments;
      state.pagination = action.payload.pagination;
    });
    builder.addCase(fetchAdminPayments.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Single Payment
    builder.addCase(fetchPaymentById.pending, (state) => {
      state.isDetailsLoading = true;
    });
    builder.addCase(fetchPaymentById.fulfilled, (state, action) => {
      state.isDetailsLoading = false;
      state.selectedPayment = action.payload;
    });
    builder.addCase(fetchPaymentById.rejected, (state, action) => {
      state.isDetailsLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSearchFilter,
  setStatusFilter,
  setProviderFilter,
  setMethodFilter,
  setDateRangeFilter,
  setAmountRangeFilter,
  resetFilters,
  setPage,
  setLimit,
  setSelectedPayment,
} = adminPaymentSlice.actions;

export default adminPaymentSlice.reducer;
