import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./auth.api";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  restaurant: any;
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
  restaurant: null,
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
      state.restaurant = action.payload.restaurant;
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
    setSubdomain: (state, action: { payload: string }) => {
      state.subdomain = action.payload;
      localStorage.setItem("subdomain", action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action: any) => {
        const { user, restaurant, perfumeStore, privateLounge, subscription } = action.payload;
        state.isAuthenticated = true;
        state.user = {
          ...user,
          ...(perfumeStore ? { perfumeStoreId: perfumeStore.id } : {}),
          ...(privateLounge ? { privateLoungeId: privateLounge.id } : {}),
        };
        state.restaurant = restaurant || perfumeStore || privateLounge;
        state.subscription = subscription;
        state.subdomain = restaurant?.subdomain || perfumeStore?.subdomain || privateLounge?.subdomain;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAdmin = false;
        state.isSuperAdmin = false;
        state.subscription = null;
        state.subdomain = null;
      });
  },
})

export const { setAuthState, logout, setSubdomain } = authSlice.actions;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export default authSlice.reducer;
