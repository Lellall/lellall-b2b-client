/* eslint-disable no-param-reassign */
// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { useSelector } from "react-redux"
import { User } from "./typings"

export interface AuthState {
  // Ensure AuthState is exported
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  user: null | User
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem("access_token"),
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  user: {
    deviceId: "",
    firstName: "",
    id: "",
    address: {
      apartmentName: "",
      estate: "",
      houseNumber: "",
      poBox: "",
      streetName: "",
    },
    isEmailVerified: false,
    isPhoneNumberVerified: false,
    lastName: "",
    registrationSource: "",
    role: "",
    phoneNumber: "",
    privileges: [],
    shopIds: [],
    username: "",
  },
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<AuthState>) => {
      const { isAuthenticated, accessToken, refreshToken, user } = action.payload
      state.isAuthenticated = isAuthenticated
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.user = user
      if (isAuthenticated) {
        localStorage.setItem("isAuthenticated", "true")
      } else {
        localStorage.removeItem("isAuthenticated")
      }
      if (accessToken) {
        localStorage.setItem("access_token", accessToken)
      } else {
        localStorage.removeItem("access_token")
      }

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken)
      } else {
        localStorage.removeItem("refresh_token")
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
      }
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.accessToken = null
      state.refreshToken = null
      localStorage.clear()
      window.location.href = "/login"
    },
  },
})

export const { setAuthState, logout } = authSlice.actions
export const useAuthSlice = () => useSelector((state: { auth: AuthState }) => state.auth)

// export default authSlice.reducer
