import { baseApi } from "../../api/baseApi"
import { toast } from "react-toastify";

export const orderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getOrders: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}`,
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
            providesTags: ["MENU"]
        }),
        createOrders: builder.mutation({
            query: ({ subdomain, data }) => ({
                url: `/orders/${subdomain}`,
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
            }
        }),
        updateOrders: builder.mutation({
            query: ({ subdomain, data, orderId }) => ({
                url: `/orders/${subdomain}/${orderId}/status`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["MENU", "INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    toast.success("Order updated successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    console.log(err);
                }
            }
        }),
        getSalesStats: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/sales`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"]
        }),
        getMonthlyRevenueBreakdown: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/monthly-revenue-breakdown`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"]
        }),
        getMonthlyExpenses: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/monthly-expenses`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"]
        }),
        getMonthlyRevenueByCategory: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/monthly-revenue-by-category`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"]
        }),
        getReservationStats: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/reservations`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"]
        }),
        getInventoryStats: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/inventory`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU", "INVENTORY"]
        }),
        getStockStats: builder.query({
            query: (subdomain) => ({
                url: `/orders/${subdomain}/stats/stock`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU", "INVENTORY"]
        }),
    }),
})

export const { 
    useGetOrdersQuery, 
    useCreateOrdersMutation, 
    useUpdateOrdersMutation,
    useGetSalesStatsQuery,
    useGetMonthlyRevenueBreakdownQuery,
    useGetMonthlyExpensesQuery,
    useGetMonthlyRevenueByCategoryQuery,
    useGetInventoryStatsQuery,
    useGetStockStatsQuery 
} = orderApi