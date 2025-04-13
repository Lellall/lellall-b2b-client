import { toast } from "react-toastify";
import { baseApi } from "../baseApi";
import { ErrorHandler } from "@/utils/error-handler";
import { setAuthState, logout } from "./auth.slice";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
    role: "ADMIN" | "SUPERADMIN";
    restaurantId: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    ownedRestaurant?: {
      id: string;
      name: string;
      subdomain: string;
      address: string | null;
      ownerId: string;
      kycStatus: string;
      createdAt: string;
      updatedAt: string;
      parentId: string | null;
      subscription?: {
        id: string;
        planId: string;
        restaurantId: string;
        status: string;
        startDate: string;
        trialEndDate: string | null;
        endDate: string | null;
        amount: number;
        createdAt: string;
        updatedAt: string;
        plan: {
          id: string;
          name: string;
          price: number;
          duration: number;
          description: string;
          billingInterval: string;
          trialDays: number;
          amount: number;
          isActive: boolean;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
  };
  subscription: any;
}

interface EmailRequest {
  email: string;
}

interface EmailResponse {
  message: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: LoginResponse) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user)); // Stringify user object
        localStorage.setItem('subscription', JSON.stringify(response.subscription)); // Store subscription
        return response;
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuthState({
              isAuthenticated: true,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
              subscription: data.subscription, // Add subscription to Redux state
            })
          );
          toast.success("Login successful", {
            position: "top-right",
          });
        } catch (err) {
          ErrorHandler(err as any);
          toast.error("Login failed. Please check your credentials.", {
            position: "top-right",
          });
          throw err;
        }
      },
    }),
    register: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuthState({
              isAuthenticated: true,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
            })
          );
          toast.success("Registration successful. Please verify your email.", {
            position: "top-right",
          });
          return data;
        } catch (err) {
          ErrorHandler(err as any);
          toast.error("Registration failed", {
            position: "top-right",
          });
          throw err;
        }
      },
    }),

    requestPasswordReset: builder.mutation<EmailResponse, EmailRequest>({
      query: (params: EmailRequest) => ({
        url: `/auth/password-reset/request`,
        method: "POST",
        body: { email: params.email, role: "ADMIN" },
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message, {
            position: "top-right",
          });
        } catch (err) {
          ErrorHandler(err as any);
          toast.error(
            err?.error?.data?.message || "Failed to request password reset",
            {
              position: "top-right",
            }
          );
          throw err;
        }
      },
    }),

    resetPassword: builder.mutation<
      { message: string },
      {
        email: string;
        token: string;
        newPassword: string;
        confirmPassword: string;
        role: string;
      }
    >({
      query: ({ email, token, newPassword, confirmPassword, role }) => ({
        url: `/auth/password-reset`,
        method: "PUT",
        params: { email, token, role },
        headers: { "Content-Type": "application/json" },
        body: { newPassword, confirmPassword },
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message || "Password reset successful", {
            position: "top-right",
          });
        } catch (err) {
          ErrorHandler(err as any);
          toast.error(
            // @ts-ignore
            err?.error?.data?.message || "Failed to reset password",
            {
              position: "top-right",
            }
          );
          throw err;
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_args, { dispatch }) {
        dispatch(logout());
        toast.success("Logged out successfully", {
          position: "top-right",
        });
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useRequestPasswordResetMutation,
} = authApi;