import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  id?: string;
  _id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  avatar?: string;
  location?: string;
}

interface AuthState {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
  role: string | null;
}

// Initial state hydrated safely from localStorage
const getInitialState = (): AuthState => {
  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let user: UserState | null = null;
  let role: string | null = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
      role = user?.role || null;
    } catch {
      user = null;
    }
  }

  return {
    user,
    token: storedToken,
    isAuthenticated: Boolean(storedToken),
    role,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserState; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.role = user.role || null;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    },

    updateUserRole: (
      state,
      action: PayloadAction<{ role: string; token?: string; user?: UserState }>
    ) => {
      const { role, token, user } = action.payload;
      if (state.user) {
        state.user.role = role;
        if (user) {
          state.user = { ...state.user, ...user, role };
        }
      } else if (user) {
        state.user = { ...user, role };
      }
      state.role = role;

      if (token) {
        state.token = token;
        localStorage.setItem("token", token);
      }

      if (state.user) {
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    updateUserProfile: (
      state,
      action: PayloadAction<Partial<UserState>>
    ) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      } else {
        state.user = action.payload as UserState;
      }
      if (action.payload.role) {
        state.role = action.payload.role;
      }
      localStorage.setItem("user", JSON.stringify(state.user));
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.role = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, updateUserRole, updateUserProfile, logout } = authSlice.actions;
export default authSlice.reducer;
