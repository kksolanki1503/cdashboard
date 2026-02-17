import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "@/lib/axios";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Module {
  module_id: number;
  module_name: string;
  can_read: boolean;
  can_write: boolean;
  can_delete: boolean;
  can_update: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  modules: Module[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  modules: [],
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
};

// Async thunk for refreshing the access token
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/v1/auth/refresh");
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/api/v1/auth/logout");
    } catch (error) {
      // Ignore logout errors
      return rejectWithValue(error);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isAuthenticated = true;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setModules: (state, action: PayloadAction<Module[]>) => {
      state.modules = action.payload;
    },
    clearAuth: (state) => {
      state.accessToken = null;
      state.user = null;
      state.modules = [];
      state.isAuthenticated = false;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Refresh token
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.data.accessToken;
        state.user = action.payload.data.user;
        state.modules = action.payload.data.modules || [];
        state.isAuthenticated = true;
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.modules = [];
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isInitialized = true;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
        state.modules = [];
        state.isAuthenticated = false;
      });
  },
});

export const {
  setAccessToken,
  setUser,
  setModules,
  clearAuth,
  setInitialized,
  setLoading,
} = authSlice.actions;
export default authSlice.reducer;
