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
      query: ({ subdomain, data, id }) => ({
        url: `/orders/${subdomain}/${id}/status`,
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
    getDailySalesRevenue: builder.query<
      { startDate: string; endDate: string; timeRange: string; revenue: string },
      { subdomain: string; startDate: string; endDate?: string; startTime?: string; endTime?: string }
    >({
      query: ({ subdomain, startDate, endDate, startTime, endTime }) => {
        if (!startDate || isNaN(new Date(startDate).getTime())) {
          throw new Error('Invalid start date');
        }

        const queryParams = new URLSearchParams();
        if (startTime) queryParams.set('startTime', startTime);
        if (endTime) queryParams.set('endTime', endTime);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        return {
          url: `/orders/${subdomain}/daily-revenue/${startDate}${endDate ? `/${endDate}` : ''}${queryString}`,
          method: "GET",
          credentials: "include",
        };
      },
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
    getDailySoldItems: builder.query<
      {
        startDate: string;
        endDate: string;
        timeRange: string;
        items: { name: string; quantity: number; total: string }[];
      },
      { subdomain: string; startDate: string; endDate?: string; startTime?: string; endTime?: string }
    >({
      query: ({ subdomain, startDate, endDate, startTime, endTime }) => {
        if (!startDate || isNaN(new Date(startDate).getTime())) {
          throw new Error('Invalid start date');
        }

        const queryParams = new URLSearchParams();
        if (startTime) queryParams.set('startTime', startTime);
        if (endTime) queryParams.set('endTime', endTime);
        queryParams.set('format', 'json');

        return {
          url: `/orders/${subdomain}/daily-sold-items/${startDate}${endDate ? `/${endDate}` : ''}?${queryParams.toString()}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Failed to fetch daily sold items:', err);
          toast.error('Failed to fetch daily sold items', { position: 'top-right' });
        }
      },
      providesTags: ['MENU'],
    }),
    downloadDailySoldItemsCsv: builder.query<
      string,
      { subdomain: string; startDate: string; endDate?: string; startTime?: string; endTime?: string }
    >({
      query: ({ subdomain, startDate, endDate, startTime, endTime }) => {
        if (!startDate || isNaN(new Date(startDate).getTime())) {
          throw new Error('Invalid start date');
        }

        const queryParams = new URLSearchParams();
        queryParams.set('format', 'csv');
        if (startTime) queryParams.set('startTime', startTime);
        if (endTime) queryParams.set('endTime', endTime);

        return {
          url: `/orders/${subdomain}/daily-sold-items/${startDate}${endDate ? `/${endDate}` : ''}?${queryParams.toString()}`,
          method: 'GET',
          credentials: 'include',
          responseHandler: (response) => response.text(),
        };
      },
      async onQueryStarted({ subdomain, startDate, endDate, startTime, endTime }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          const safeEndDate = endDate || new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const timeSuffix = startTime && endTime ? `_${startTime}-${endTime}` : '';

          link.href = url;
          link.download = `sold-items-${subdomain}-${startDate}_to_${safeEndDate}${timeSuffix}.csv`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Failed to download CSV:', err);
          toast.error('Failed to download CSV', { position: 'top-right' });
        }
      },
      providesTags: ['MENU'],
    }),
    getPaymentTypeSummary: builder.query<
      {
        startDate: string | null;
        endDate: string | null;
        summary: {
          paymentType: string | null;
          orderCount: number;
          totalSubtotal: number;
          totalDiscountAmount: number;
          totalVatTax: number;
          totalServiceFee: number;
          totalRevenue: number;
        }[];
        totalOrders: number;
        totalSubtotal: number;
        totalDiscountAmount: number;
        totalVatTax: number;
        totalServiceFee: number;
        totalRevenue: number;
      },
      { subdomain: string; startDate?: string; endDate?: string }
    >({
      query: ({ subdomain, startDate, endDate }) => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.set('startDate', startDate);
        if (endDate) queryParams.set('endDate', endDate);
        queryParams.set('format', 'json');

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        return {
          url: `/orders/${subdomain}/stats/payment-type-summary${queryString}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Payment type summary fetched successfully", { position: "top-right" });
        } catch (err) {
          console.error('Failed to fetch payment type summary:', err);
          toast.error('Failed to fetch payment type summary', { position: 'top-right' });
        }
      },
      providesTags: ['MENU'],
    }),
    downloadPaymentTypeSummaryCsv: builder.query<
      string,
      { subdomain: string; startDate?: string; endDate?: string }
    >({
      query: ({ subdomain, startDate, endDate }) => {
        const queryParams = new URLSearchParams();
        queryParams.set('format', 'csv');
        if (startDate) queryParams.set('startDate', startDate);
        if (endDate) queryParams.set('endDate', endDate);

        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        return {
          url: `/orders/${subdomain}/stats/payment-type-summary${queryString}`,
          method: 'GET',
          credentials: 'include',
          responseHandler: (response) => response.text(),
        };
      },
      async onQueryStarted({ subdomain, startDate, endDate }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');

          const safeEndDate = endDate || (startDate ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

          link.href = url;
          link.download = `payment-type-summary-${subdomain}${startDate ? `-${startDate}` : ''}${endDate ? `_to_${endDate}` : ''}.csv`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success("Payment type summary CSV downloaded successfully", { position: "top-right" });
        } catch (err) {
          console.error('Failed to download payment type summary CSV:', err);
          toast.error('Failed to download payment type summary CSV', { position: 'top-right' });
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
  useLazyDownloadDailySoldItemsCsvQuery,
  useGetPaymentTypeSummaryQuery,
  useLazyDownloadPaymentTypeSummaryCsvQuery,
} = orderApi;