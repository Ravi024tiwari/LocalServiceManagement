import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { providerProfileApi, type ProviderProfileData, type TimeSlot } from '@/services/providerProfile.service';
import { updateUserRole } from './authSlice';

interface ProviderProfileState {
  profile: ProviderProfileData | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isApproved: boolean;
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNAPPLIED';
  error: string | null;
}

const initialState: ProviderProfileState = {
  profile: null,
  status: 'idle',
  isApproved: false,
  verification_status: 'UNAPPLIED',
  error: null,
};

// Async thunk to fetch provider profile status
export const fetchProviderProfile = createAsyncThunk(
  'providerProfile/fetchProviderProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await providerProfileApi.getMyProfile();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch provider profile');
    }
  }
);

// Async thunk to submit provider profile application
export const submitProviderApplication = createAsyncThunk(
  'providerProfile/submitProviderApplication',
  async (
    payload: {
      bio: string;
      experience_years: number;
      availability: TimeSlot[];
      documents: File[];
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await providerProfileApi.apply(payload);
      // Sync auth state if backend returns fresh token and user role update
      if (res.token && res.user) {
        dispatch(updateUserRole({ role: 'PROVIDER', token: res.token, user: res.user }));
      }
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Application failed');
    }
  }
);

// Async thunk to update provider profile details (bio, experience, availability)
export const updateProviderProfileDetails = createAsyncThunk(
  'providerProfile/updateProviderProfileDetails',
  async (
    payload: {
      bio?: string;
      experience_years?: number;
      availability?: TimeSlot[];
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await providerProfileApi.updateMyProfile(payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to update provider profile');
    }
  }
);

const providerProfileSlice = createSlice({
  name: 'providerProfile',
  initialState,
  reducers: {
    clearProviderProfile: (state) => {
      state.profile = null;
      state.status = 'idle';
      state.isApproved = false;
      state.verification_status = 'UNAPPLIED';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchProviderProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProviderProfile.fulfilled, (state, action: PayloadAction<ProviderProfileData | null>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        if (action.payload) {
          state.verification_status = action.payload.verification_status || 'PENDING';
          state.isApproved = Boolean(action.payload.isApproved && action.payload.verification_status === 'APPROVED');
        } else {
          state.verification_status = 'UNAPPLIED';
          state.isApproved = false;
        }
      })
      .addCase(fetchProviderProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Submit Application
      .addCase(submitProviderApplication.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(submitProviderApplication.fulfilled, (state, action: PayloadAction<ProviderProfileData>) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.verification_status = action.payload?.verification_status || 'PENDING';
        state.isApproved = Boolean(action.payload?.isApproved && action.payload?.verification_status === 'APPROVED');
      })
      .addCase(submitProviderApplication.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Update Provider Profile Details
      .addCase(updateProviderProfileDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProviderProfileDetails.fulfilled, (state, action: PayloadAction<ProviderProfileData>) => {
        state.status = 'succeeded';
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateProviderProfileDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearProviderProfile } = providerProfileSlice.actions;
export default providerProfileSlice.reducer;
