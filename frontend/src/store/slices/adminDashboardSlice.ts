import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  adminDashboardApi,
  type AdminDashboardData,
} from "@/services/adminDashboard.api";

export interface AdminDashboardState {
  data: AdminDashboardData | null;
  selectedDateRange: string;
  isLoading: boolean;
  isVerifying: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  data: null,
  selectedDateRange: "May 20 - Jun 20, 2025",
  isLoading: false,
  isVerifying: false,
  error: null,
};

// Async Thunk: Fetch Admin Dashboard Payload
export const fetchAdminDashboard = createAsyncThunk(
  "adminDashboard/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminDashboardApi.getDashboardMetrics();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin dashboard payload");
    }
  }
);

// Async Thunk: Verify Provider
export const verifyProviderThunk = createAsyncThunk(
  "adminDashboard/verifyProviderThunk",
  async (
    payload: { providerProfileId: string; status: "APPROVED" | "REJECTED" },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await adminDashboardApi.verifyProvider(payload.providerProfileId, payload.status);
      dispatch(fetchAdminDashboard());
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to verify provider");
    }
  }
);

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    setDateRangeFilter: (state, action: PayloadAction<string>) => {
      state.selectedDateRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminDashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action: PayloadAction<AdminDashboardData>) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // verifyProviderThunk
      .addCase(verifyProviderThunk.pending, (state) => {
        state.isVerifying = true;
      })
      .addCase(verifyProviderThunk.fulfilled, (state) => {
        state.isVerifying = false;
      })
      .addCase(verifyProviderThunk.rejected, (state) => {
        state.isVerifying = false;
      });
  },
});

export const { setDateRangeFilter } = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;
