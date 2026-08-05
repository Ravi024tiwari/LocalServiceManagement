import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  adminProviderApi,
  type AdminProviderItem,
  type AdminProviderPagination,
  type AdminProviderStats,
} from "@/services/adminProvider.api";

export interface AdminProviderState {
  providers: AdminProviderItem[];
  pagination: AdminProviderPagination;
  stats: AdminProviderStats;
  filters: {
    search: string;
    status: string; // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  };
  selectedProviderDetail: AdminProviderItem | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: AdminProviderState = {
  providers: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProviders: 0,
    limit: 10,
  },
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  },
  filters: {
    search: "",
    status: "ALL",
  },
  selectedProviderDetail: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Async Thunk: Fetch Providers List
export const fetchAdminProviders = createAsyncThunk(
  "adminProvider/fetchAdminProviders",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const res = await adminProviderApi.getProviders(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch providers");
    }
  }
);

// Async Thunk: Update Provider Status (Approve / Reject)
export const updateProviderStatusThunk = createAsyncThunk(
  "adminProvider/updateProviderStatusThunk",
  async (
    payload: { providerProfileId: string; status: "APPROVED" | "REJECTED" | "PENDING" },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await adminProviderApi.updateStatus(payload.providerProfileId, payload.status);
      dispatch(fetchAdminProviders());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update provider status");
    }
  }
);

const adminProviderSlice = createSlice({
  name: "adminProvider",
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
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setSelectedProviderDetail: (state, action: PayloadAction<AdminProviderItem | null>) => {
      state.selectedProviderDetail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminProviders
      .addCase(fetchAdminProviders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminProviders.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        if (action.payload) {
          state.providers = action.payload.providers || [];
          if (action.payload.pagination) state.pagination = action.payload.pagination;
          if (action.payload.stats) state.stats = action.payload.stats;
        }
      })
      .addCase(fetchAdminProviders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // updateProviderStatusThunk
      .addCase(updateProviderStatusThunk.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(updateProviderStatusThunk.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(updateProviderStatusThunk.rejected, (state) => {
        state.isSubmitting = false;
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setPage,
  setSelectedProviderDetail,
} = adminProviderSlice.actions;

export default adminProviderSlice.reducer;
