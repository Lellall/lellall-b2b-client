import { toast } from "react-toastify"
import { LoginRequest, LoginResponse } from "./typings"
import { setAuthState, logout } from "./auth.slice"
import { baseApi } from "../baseApi"
import { ErrorHandler } from "@/utils/error-handler"

interface EmailRequest {
  email: string
}

interface EmailResponse {
  content: string
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled: qf }) {
        qf.then((data) => {
          dispatch(
            setAuthState({
              isAuthenticated: true,
              accessToken: data.data.access_token,
              // user: data.user,
              refreshToken: data.data.refresh_token,
              user: data.data.user,
            })
          )
        }).catch((err) => {
          ErrorHandler(err)
        })
      },
    }),
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            setAuthState({
              isAuthenticated: true,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              user: data.user,
            })
          )
          return data
        } catch (err) {
          Errorhandler(err)
          return err
        }
      },
    }),
    requestPasswordReset: builder.mutation<EmailResponse, EmailRequest>({
      query: (params: EmailRequest) => ({
        url: `/auth/password-reset/request`,
        method: "POST",
        params: { email: params.email, role: "ADMIN" },
      }),
      async onQueryStarted(_args, { queryFulfilled: qf }) {
        qf.then((res) =>
          toast.success(`${res.data.content}`, {
            position: "top-right",
          })
        ).catch((err) => {
          toast.error(`${err?.status?.message}`, {
            position: "top-right",
          })
        })
      },
    }),
    resetPassword: builder.mutation({
      query: ({ email, token, newPassword, confirmPassword, role }) => ({
        url: `/auth/password-reset`,
        method: "PUT",
        params: { email, token, role },
        headers: { "Content-Type": "application/json" },
        body: { newPassword, confirmPassword },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch }) {
        dispatch(logout())
      },
    }),
  }),
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useRequestPasswordResetMutation,
} = authApi
