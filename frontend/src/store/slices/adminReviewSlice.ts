import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  adminReviewApi,
  type AdminReviewItem,
  type AdminReviewKPIs,
  type AdminReviewPagination,
  type GetAdminReviewsParams,
} from "@/services/adminReview.api";

export interface AdminReviewState {
  reviews: AdminReviewItem[];
  kpis: AdminReviewKPIs;
  pagination: AdminReviewPagination;
  filters: {
    search: string;
    rating: number; // 0 for ALL, 1-5 for star rating
    category: string;
    sortBy: "newest" | "oldest" | "rating_high" | "rating_low";
  };
  selectedReviewDetail: AdminReviewItem | null;
  isLoading: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: AdminReviewState = {
  reviews: [],
  kpis: {
    totalReviews: 0,
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
    rating: 0,
    category: "ALL",
    sortBy: "newest",
  },
  selectedReviewDetail: null,
  isLoading: false,
  isDeleting: false,
  error: null,
};

// Async Thunk: Fetch Admin Reviews
export const fetchAdminReviews = createAsyncThunk(
  "adminReview/fetchAdminReviews",
  async (params: GetAdminReviewsParams | undefined, { rejectWithValue }) => {
    try {
      const res = await adminReviewApi.getReviews(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin reviews");
    }
  }
);

// Async Thunk: Delete Review
export const deleteAdminReviewThunk = createAsyncThunk(
  "adminReview/deleteAdminReviewThunk",
  async (reviewId: string, { rejectWithValue }) => {
    try {
      const res = await adminReviewApi.deleteReview(reviewId);
      return { reviewId, data: res.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete review");
    }
  }
);

const adminReviewSlice = createSlice({
  name: "adminReview",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    setRatingFilter: (state, action: PayloadAction<number>) => {
      state.filters.rating = action.payload;
      state.pagination.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
      state.pagination.page = 1;
    },
    setSortBy: (state, action: PayloadAction<"newest" | "oldest" | "rating_high" | "rating_low">) => {
      state.filters.sortBy = action.payload;
      state.pagination.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    setSelectedReviewDetail: (state, action: PayloadAction<AdminReviewItem | null>) => {
      state.selectedReviewDetail = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: "",
        rating: 0,
        category: "ALL",
        sortBy: "newest",
      };
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminReviews
      .addCase(fetchAdminReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.reviews = action.payload.reviews || [];
          if (action.payload.kpis) state.kpis = action.payload.kpis;
          if (action.payload.pagination) state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAdminReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // deleteAdminReviewThunk
      .addCase(deleteAdminReviewThunk.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deleteAdminReviewThunk.fulfilled, (state, action) => {
        state.isDeleting = false;
        const deletedId = action.payload.reviewId;
        state.reviews = state.reviews.filter((r) => r._id !== deletedId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.kpis.totalReviews > 0) {
          state.kpis.totalReviews -= 1;
        }
        if (state.selectedReviewDetail?._id === deletedId) {
          state.selectedReviewDetail = null;
        }
      })
      .addCase(deleteAdminReviewThunk.rejected, (state) => {
        state.isDeleting = false;
      });
  },
});

export const {
  setSearchQuery,
  setRatingFilter,
  setCategoryFilter,
  setSortBy,
  setPage,
  setSelectedReviewDetail,
  resetFilters,
} = adminReviewSlice.actions;

export default adminReviewSlice.reducer;
