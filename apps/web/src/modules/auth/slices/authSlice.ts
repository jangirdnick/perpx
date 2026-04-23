import { User } from '@perpx/shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface authState {
  user: User | null;
  access_token: string;
  isAuthenticated: boolean;
  loading: boolean; // Ye ab sirf initial bootstrap ke liye
  error: string | null;
  message: string | null;
  sessionExpired: boolean;
}

const initialState: authState = {
  user: null,
  access_token: '',
  isAuthenticated: false,
  loading: true,
  error: null,
  message: null,
  sessionExpired: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.access_token = action.payload;
    },

    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setAuthBootstrapComplete: (state) => {
      state.loading = false;
    },

    setAuthBootstrapStart: (state) => {
      state.loading = true;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setMessage: (state, action: PayloadAction<string | null>) => {
      state.message = action.payload;
    },

    setSessionExpired: (state, action: PayloadAction<boolean>) => {
      state.sessionExpired = action.payload;
    },

    setAuth: (
      state,
      action: PayloadAction<{
        user: User;
        access_token: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearMessage: (state) => {
      state.message = null;
    },

    logout: (state) => {
      state.user = null;
      state.access_token = '';
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
});

export const {
  setUser,
  setAccessToken,
  setIsAuthenticated,
  setLoading,
  setAuthBootstrapComplete,
  setAuthBootstrapStart,
  setSessionExpired,
  setError,
  setMessage,
  setAuth,
  clearError,
  clearMessage,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
