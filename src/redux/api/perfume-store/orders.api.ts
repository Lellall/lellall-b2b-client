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
      query: (storeId: string) => ({
        url: `/perfume-store/${storeId}/orders`,
      }),
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
    getPerfumeReceipt: builder.query({
      query: (data: { storeId: string; orderId: string }) => ({
        url: `/perfume-store/${data.storeId}/order/${data.orderId}/receipt`,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { 
  useCreatePerfumeOrderMutation,
  useGetPerfumeOrdersQuery,
  useGetPerfumeReceiptQuery,
  useLazyGetPerfumeReceiptQuery
} = ordersApi;
