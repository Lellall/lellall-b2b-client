import { baseApi } from '../baseApi';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (data: { loungeId: string; membershipId?: string; walkInId?: string; items: any[] }) => ({
        url: `/private-lounge/admin/orders`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'], // Invalidates inventory because stock decreases
    }),
  }),
  overrideExisting: false,
});

export const { 
  useCreateOrderMutation,
} = ordersApi;
