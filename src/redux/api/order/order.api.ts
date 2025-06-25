import { ErrorHandler } from "@/utils/error-handler";
import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: ({ subdomain, page = 1, limit = 10, status }) => {
        const url = `/orders/${subdomain}?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
        console.log('getOrders Query URL:', url); // Debug log
        return {
          url,
          method: "GET",
          credentials: "include",
        };
      },
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Failed to fetch orders:", err);
          toast.error("Failed to fetch orders", { position: "top-right" });
        }
      },
      providesTags: ["MENU"],
      transformResponse: (response: { data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } }) => ({
        orders: response.data,
        meta: response.meta,
      }),
    }),
    createOrders: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `/orders/${subdomain}`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["MENU", "INVENTORY"],
    }),
    updateOrders: builder.mutation({
      query: ({ subdomain, data, orderId }) => ({
        url: `/orders/${subdomain}/${orderId}/status`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["MENU", "INVENTORY"],
    }),
    getReceiptTextMutation: builder.mutation<string, { subdomain: string; orderId: string }>({
      query: ({ subdomain, orderId }) => ({
        url: `/orders/${subdomain}/${orderId}/receipt/pdf`,
      }),
    }),
    getSalesStats: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/sales`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),
    getMonthlyRevenueBreakdown: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/monthly-revenue-breakdown`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),
    getMonthlyExpenses: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/monthly-expenses`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),
    getMonthlyRevenueByCategory: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/monthly-revenue-by-category`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),
    getReservationStats: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/reservations`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU"],
    }),
    getInventoryStats: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/inventory`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU", "INVENTORY"],
    }),
    getStockStats: builder.query({
      query: (subdomain: string) => ({
        url: `/orders/${subdomain}/stats/stock`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["MENU", "INVENTORY"],
    }),
    getDailySalesRevenue: builder.query({
      query: ({ subdomain, date }: { subdomain: string; date: string }) => ({
        url: `/orders/${subdomain}/daily-revenue/${date}`,
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Failed to fetch daily sales revenue:", err);
          toast.error("Failed to fetch daily sales revenue", { position: "top-right" });
        }
      },
      providesTags: ["MENU"],
    }),
    getDailySoldItems: builder.query({
      query: ({ subdomain, date }: { subdomain: string; date: string }) => ({
        url: `/orders/${subdomain}/daily-sold-items/${date}`,
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Failed to fetch daily sold items:", err);
          toast.error("Failed to fetch daily sold items", { position: "top-right" });
        }
      },
      providesTags: ["MENU"],
    }),
    deleteOrder: builder.mutation({
      query: ({ subdomain, orderId }) => ({
        url: `/orders/${subdomain}/${orderId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["MENU"],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Order item deleted successfully", { position: "top-right" });
        } catch (err) {
          ErrorHandler(err as any);
          toast.error("Failed to delete Order item", { position: "top-right" });
          throw err;
        }
      },
    }),
    updateOrderItems: builder.mutation({
      query: ({ subdomain, orderId, data }) => ({
        url: `/orders/${subdomain}/${orderId}/items`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["MENU"],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Order items updated successfully", { position: "top-right" });
        } catch (err) {
          ErrorHandler(err as any);
          toast.error("Failed to update order items", { position: "top-right" });
          throw err;
        }
      },
    }),
    getBankDetails: builder.query({
      query: (id: string) => ({
        url: `/restaurants/${id}/bank-details`,
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Failed to fetch bank details:", err);
          toast.error("Failed to fetch bank details", { position: "top-right" });
        }
      },
      providesTags: ["MENU"],
      transformResponse: (response) => response,
    }),
    downloadDailySoldItemsCsv: builder.query<string, { subdomain: string; date: string }>({
      query: ({ subdomain, date }) => ({
        url: `/orders/${subdomain}/daily-sold-items/${date}?format=csv`,
        method: 'GET',
        credentials: 'include',
        responseHandler: (response) => response.text(),
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `daily-sold-items-${_args.subdomain}-${_args.date}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Failed to download CSV:', err);
          toast.error('Failed to download CSV', { position: 'top-right' });
          throw err;
        }
      },
      providesTags: ['MENU'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useDeleteOrderMutation,
  useCreateOrdersMutation,
  useUpdateOrdersMutation,
  useGetReceiptTextMutationMutation,
  useGetSalesStatsQuery,
  useGetMonthlyRevenueBreakdownQuery,
  useGetMonthlyExpensesQuery,
  useGetMonthlyRevenueByCategoryQuery,
  useGetReservationStatsQuery,
  useGetInventoryStatsQuery,
  useGetStockStatsQuery,
  useGetDailySalesRevenueQuery,
  useGetDailySoldItemsQuery,
  useUpdateOrderItemsMutation,
  useGetBankDetailsQuery,
  useLazyDownloadDailySoldItemsCsvQuery
} = orderApi;