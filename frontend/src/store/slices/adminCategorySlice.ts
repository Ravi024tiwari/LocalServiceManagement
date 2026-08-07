import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  adminCategoryApi,
  type AdminCategoryItem,
  type AdminCategoryKPIs,
  type AdminCategoryPagination,
  type TopCategoryHighlight,
  type GetAdminCategoriesParams,
  type CategoryDetailServiceItem,
} from "@/services/adminCategory.api";

export interface AdminCategoryState {
  categories: AdminCategoryItem[];
  topCategories: TopCategoryHighlight[];
  kpis: AdminCategoryKPIs;
  pagination: AdminCategoryPagination;
  filters: {
    search: string;
    status: string; // 'ALL' | 'Active' | 'Inactive'
    sortBy: "bookings_desc" | "services_desc" | "services_asc" | "name_asc" | "rating_desc";
  };
  selectedCategoryDetail: {
    category: string;
    totalServices: number;
    activeServices: number;
    bookingCount: number;
    services: CategoryDetailServiceItem[];
  } | null;
  isLoading: boolean;
  isLoadingDetail: boolean;
  error: string | null;
}

const initialState: AdminCategoryState = {
  categories: [],
  topCategories: [],
  kpis: {
    totalCategories: 0,
    activeCategories: 0,
    totalServices: 0,
    totalBookings: 0,
    averageRating: 0,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  filters: {
    search: "",
    status: "ALL",
    sortBy: "bookings_desc",
  },
  selectedCategoryDetail: null,
  isLoading: false,
  isLoadingDetail: false,
  error: null,
};

// Async Thunk: Fetch Admin Categories
export const fetchAdminCategories = createAsyncThunk(
  "adminCategory/fetchAdminCategories",
  async (params: GetAdminCategoriesParams | undefined, { rejectWithValue }) => {
    try {
      const res = await adminCategoryApi.getCategories(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin categories");
    }
  }
);

// Async Thunk: Fetch Category Details
export const fetchCategoryDetail = createAsyncThunk(
  "adminCategory/fetchCategoryDetail",
  async (categoryName: string, { rejectWithValue }) => {
    try {
      const res = await adminCategoryApi.getCategoryDetail(categoryName);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch category details");
    }
  }
);

const adminCategorySlice = createSlice({
  name: "adminCategory",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    setSortBy: (
      state,
      action: PayloadAction<"bookings_desc" | "services_desc" | "services_asc" | "name_asc" | "rating_desc">
    ) => {
      state.filters.sortBy = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setSelectedCategoryDetail: (
      state,
      action: PayloadAction<AdminCategoryState["selectedCategoryDetail"]>
    ) => {
      state.selectedCategoryDetail = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: "",
        status: "ALL",
        sortBy: "bookings_desc",
      };
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminCategories
      .addCase(fetchAdminCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.categories = action.payload.categories || [];
          state.topCategories = action.payload.topCategories || [];
          if (action.payload.kpis) state.kpis = action.payload.kpis;
          if (action.payload.pagination) state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAdminCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // fetchCategoryDetail
      .addCase(fetchCategoryDetail.pending, (state) => {
        state.isLoadingDetail = true;
      })
      .addCase(fetchCategoryDetail.fulfilled, (state, action) => {
        state.isLoadingDetail = false;
        if (action.payload) {
          state.selectedCategoryDetail = action.payload;
        }
      })
      .addCase(fetchCategoryDetail.rejected, (state) => {
        state.isLoadingDetail = false;
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setSortBy,
  setPage,
  setSelectedCategoryDetail,
  resetFilters,
} = adminCategorySlice.actions;

export default adminCategorySlice.reducer;
