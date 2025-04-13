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
      query: (data) => ({
        url: '/restaurants/create-user',
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("User created successfully");
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
      }),
      invalidatesTags: ['INVENTORY'],
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
  useGetUsersStatsQuery
} = restaurantApi