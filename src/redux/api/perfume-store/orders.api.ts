import { baseApi } from '../baseApi';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPerfumeOrder: builder.mutation({
      query: (data: { storeId: string; clientId?: string; items: any[]; totalAmount: number }) => ({
        url: `/perfume-store/${data.storeId}/order`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_INVENTORY', 'LOUNGE_DASHBOARD'],
    }),
    getPerfumeOrders: builder.query({
      query: (params: { storeId: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
        const { storeId, startDate, endDate, page, limit } = params;
        const searchParams = new URLSearchParams();
        if (startDate) searchParams.set('startDate', startDate);
        if (endDate) searchParams.set('endDate', endDate);
        if (page) searchParams.set('page', String(page));
        if (limit) searchParams.set('limit', String(limit));
        const qs = searchParams.toString();
        return { url: `/perfume-store/${storeId}/orders${qs ? `?${qs}` : ''}` };
      },
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
    getPerfumeReceipt: builder.query({
      query: (data: { storeId: string; orderId: string }) => ({
        url: `/perfume-store/${data.storeId}/order/${data.orderId}/receipt`,
      }),
    }),
    deletePerfumeOrder: builder.mutation({
      query: ({ storeId, orderId }: { storeId: string; orderId: string }) => ({
        url: `/perfume-store/${storeId}/order/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LOUNGE_DASHBOARD'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreatePerfumeOrderMutation,
  useGetPerfumeOrdersQuery,
  useGetPerfumeReceiptQuery,
  useLazyGetPerfumeReceiptQuery,
  useDeletePerfumeOrderMutation,
} = ordersApi;
