import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { likedServiceApi, type LikedServiceItem, type LikedStats } from "@/services/likedService.api";

export interface LikedServiceState {
  likedServices: LikedServiceItem[];
  likedIds: string[]; // List of service IDs liked by customer for quick lookup
  stats: LikedStats;
  filters: {
    search: string;
    category: string;
    priceRange: string;
    sortBy: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: LikedServiceState = {
  likedServices: [],
  likedIds: [],
  stats: {
    totalLiked: 0,
    totalCategories: 0,
    lastLikedText: "None",
    potentialSavings: 0,
  },
  filters: {
    search: "",
    category: "ALL",
    priceRange: "ALL",
    sortBy: "RECENTLY_LIKED",
  },
  isLoading: false,
  error: null,
};

// Async Thunk: Fetch Liked Services
export const fetchLikedServices = createAsyncThunk(
  "likedService/fetchLikedServices",
  async (params: { lat?: number; lng?: number; radius?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await likedServiceApi.getLikedServices(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch liked services");
    }
  }
);

// Async Thunk: Fetch Stats
export const fetchLikedStats = createAsyncThunk(
  "likedService/fetchLikedStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await likedServiceApi.getStats();
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch stats");
    }
  }
);

// Async Thunk: Toggle Like Service
export const toggleLikeServiceThunk = createAsyncThunk(
  "likedService/toggleLikeServiceThunk",
  async (serviceId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await likedServiceApi.toggleLike(serviceId);
      // Immediately re-fetch full liked services list AND stats in background so Redux store stays 100% in sync!
      dispatch(fetchLikedServices());
      dispatch(fetchLikedStats());
      return { serviceId, isLiked: res.data.isLiked };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle like status");
    }
  }
);

const likedServiceSlice = createSlice({
  name: "likedService",
  initialState,
  reducers: {
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.filters.category = action.payload;
    },
    setPriceFilter: (state, action: PayloadAction<string>) => {
      state.filters.priceRange = action.payload;
    },
    setSortBy: (state, action: PayloadAction<string>) => {
      state.filters.sortBy = action.payload;
    },
    optimisticToggleLike: (state, action: PayloadAction<string>) => {
      const serviceId = action.payload;
      const index = state.likedIds.indexOf(serviceId);
      if (index > -1) {
        state.likedIds.splice(index, 1);
        state.likedServices = state.likedServices.filter((item) => item.service_id !== serviceId);
        state.stats.totalLiked = Math.max(0, state.stats.totalLiked - 1);
      } else {
        state.likedIds.push(serviceId);
        state.stats.totalLiked += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchLikedServices
      .addCase(fetchLikedServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLikedServices.fulfilled, (state, action: PayloadAction<LikedServiceItem[]>) => {
        state.isLoading = false;
        state.likedServices = action.payload || [];
        state.likedIds = (action.payload || []).map((item) => item.service_id);
      })
      .addCase(fetchLikedServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchLikedStats
      .addCase(fetchLikedStats.fulfilled, (state, action: PayloadAction<LikedStats>) => {
        if (action.payload) {
          state.stats = action.payload;
        }
      })
      // toggleLikeServiceThunk
      .addCase(toggleLikeServiceThunk.fulfilled, (state, action) => {
        const { serviceId, isLiked } = action.payload;
        if (isLiked && !state.likedIds.includes(serviceId)) {
          state.likedIds.push(serviceId);
        } else if (!isLiked) {
          state.likedIds = state.likedIds.filter((id) => id !== serviceId);
          state.likedServices = state.likedServices.filter((item) => item.service_id !== serviceId);
        }
      });
  },
});

export const {
  setSearchFilter,
  setCategoryFilter,
  setPriceFilter,
  setSortBy,
  optimisticToggleLike,
} = likedServiceSlice.actions;

export default likedServiceSlice.reducer;
