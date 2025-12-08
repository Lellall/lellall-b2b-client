import { baseApi } from "../../api/baseApi"
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

export const restaurantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRestaurantBySubdomain: builder.query({
      query: (subdomain) => ({
        url: `/restaurants/subdomain/${subdomain}`,
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to fetch restaurant data", {
            position: "top-right",
          });
          throw err;
        }
      }
    }),

    createUserUnderRestaurant: builder.mutation({
      query: (formData: FormData) => ({
        url: '/restaurants/create-user',
        method: "POST",
        body: formData,
        credentials: "include",
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
        formData: true,
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("User created successfully. Please verify your email.");
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to create user");
          throw err;
        }
      }
    }),

    getUsersByRestaurant: builder.query({
      query: ({ restaurantId, search }) => ({
        url: `/restaurants/${restaurantId}/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
         console.error(err)
        }
      },
    }),

    getUsersStats: builder.query({
      query: (restaurantId) => ({
        url: `/restaurants/${restaurantId}/user-stats`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["INVENTORY"],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to fetch restaurant users");
          throw err;
        }
      }
    }),

    getUserById: builder.query({
      query: (userId) => ({
        url: `/restaurants/user/${userId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["INVENTORY"],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to fetch user");
          throw err;
        }
      }
    }),

    updateUser: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/restaurants/user/${userId}`,
        method: "PATCH",
        body: data,
        credentials: "include",
        // If data is FormData, set formData flag to let browser set Content-Type with boundary
        formData: data instanceof FormData,
      }),
      invalidatesTags: ['INVENTORY', 'STAFF'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("User updated successfully");
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to update user");
          throw err;
        }
      }
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/restaurants/user/${userId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("User deleted successfully");
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to delete user");
          throw err;
        }
      }
    }),

    getRestaurantById: builder.query({
      query: (id) => ({
        url: `/restaurants/${id}`,
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to fetch restaurant");
          throw err;
        }
      }
    }),

    updateRestaurant: builder.mutation({
      query: ({ id, data }) => ({
        url: `/restaurants/${id}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Restaurant updated successfully");
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to update restaurant");
          throw err;
        }
      }
    }),

    deleteRestaurant: builder.mutation({
      query: (id) => ({
        url: `/restaurants/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Restaurant deleted successfully");
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to delete restaurant");
          throw err;
        }
      }
    }),

    // AI Reporting endpoints
    getRevenuePredictions: builder.query({
      query: ({ restaurantId, days = 30 }) => ({
        url: `/ai-reporting/${restaurantId}/predict-revenue?days=${days}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error("Failed to fetch revenue predictions:", err);
        }
      },
    }),

    compareRestaurants: builder.mutation({
      query: (data) => ({
        url: `/ai-reporting/compare-restaurants`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error("Failed to compare restaurants:", err);
        }
      },
    }),

    getWaiterPerformance: builder.query({
      query: ({ restaurantId, days = 30 }) => ({
        url: `/ai-reporting/${restaurantId}/waiter-performance?days=${days}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),

    getTopPerformers: builder.query({
      query: ({ restaurantId, days = 30 }) => ({
        url: `/ai-reporting/${restaurantId}/top-performers?days=${days}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),

    getBusinessInsights: builder.query({
      query: ({ restaurantId, days = 30 }) => ({
        url: `/ai-reporting/${restaurantId}/insights?days=${days}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),

    getSeasonalTrends: builder.query({
      query: ({ restaurantId, months = 12 }) => ({
        url: `/ai-reporting/${restaurantId}/seasonal-trends?months=${months}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),
  }),
})

export const {
  useGetRestaurantBySubdomainQuery,
  useCreateUserUnderRestaurantMutation,
  useGetUsersByRestaurantQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRestaurantByIdQuery,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetUsersStatsQuery,
  useGetRevenuePredictionsQuery,
  useCompareRestaurantsMutation,
  useGetWaiterPerformanceQuery,
  useGetTopPerformersQuery,
  useGetBusinessInsightsQuery,
  useGetSeasonalTrendsQuery,
} = restaurantApi