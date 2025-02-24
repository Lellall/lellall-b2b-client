// auth.slice.js
import { createSlice } from "@reduxjs/toolkit"
import { LoginResponse } from "./typings"

const initialState: LoginResponse = {
  isAuthenticated: false,
  accessToken: "",
  refreshToken: "",
  user: null,
  isAdmin: false,
  token_type: "",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.isAdmin = action.payload.user?.role === "ADMIN"
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.accessToken = ""
      state.refreshToken = ""
      state.user = null
      state.isAdmin = false
    },
  },
})

export const { setAuthState, logout } = authSlice.actions
export const selectAuth = (state: { auth: LoginResponse }) => state.auth
export default authSlice.reducer
