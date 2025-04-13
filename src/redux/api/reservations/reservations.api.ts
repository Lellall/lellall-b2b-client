import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";

export const reservationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReservation: builder.query({
            query: (subdomain) => ({
                url: `/reservations/${subdomain}`,
                method: "GET",
                credentials: "include",
            }),
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err: any) {
                    console.log(err);
                }
            },
            providesTags: ["MENU"],
        }),
        getReservationByStats: builder.query({
            query: (subdomain) => ({
                url: `/reservations/${subdomain}/stats`,
                method: "GET",
                credentials: "include",
            }),
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err: any) {
                    console.log(err);
                }
            },
            providesTags: ["MENU"],
        }),
        createReservation: builder.mutation({
            query: ({ subdomain, data }) => ({
                url: `/reservations/${subdomain}`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["MENU", "INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    toast.success("Order created successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    console.log(err);
                }
            },
        }),
        updateReservation: builder.mutation({
            query: ({ subdomain, id, data }) => ({
                url: `/reservations/${subdomain}/${id}`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["MENU", "INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    toast.success("Reservation updated successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    console.log(err);
                }
            },
        }),
        deleteReservation: builder.mutation({
            query: ({ subdomain, id }) => ({
                url: `/reservations/${subdomain}/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["MENU", "INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Reservation deleted successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    console.log(err);
                }
            },
        }),
    }),
});

export const {
    useCreateReservationMutation,
    useGetReservationQuery,
    useUpdateReservationMutation,
    useDeleteReservationMutation,
    useGetReservationByStatsQuery
} = reservationsApi;