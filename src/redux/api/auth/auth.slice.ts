import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  subdomain: string | null;
  subscription: any; // You can define a more specific type based on LoginResponse['subscription']
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: "",
  refreshToken: "",
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  subdomain: null,
  subscription: null, // Initialize subscription
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAdmin = action.payload.user?.role === "ADMIN" || action.payload.user?.role === "SUPERADMIN";
      state.isSuperAdmin = action.payload.user?.role === "SUPERADMIN";
      state.subscription = action.payload.subscription; // Store subscription
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAdmin = false;
      state.isSuperAdmin = false;
      state.subscription = null; // Clear subscription on logout
    },
    setSubdomain: (state, action) => {
      state.subdomain = action.payload;
      localStorage.setItem("subdomain", action.payload);
    },
  },
})

export const { setAuthState, logout, setSubdomain } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export default authSlice.reducer;
