import { baseApi } from '../baseApi';

export const perfumeBillingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPerfumeBillingStatus: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/billing/status?storeId=${storeId}`,
      }),
    }),
    subscribePerfumeBilling: builder.mutation({
      query: ({ storeId, email }: { storeId: string; email: string }) => ({
        url: `/perfume-store/billing/subscribe`,
        method: 'POST',
        body: { storeId, email },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPerfumeBillingStatusQuery,
  useSubscribePerfumeBillingMutation,
} = perfumeBillingApi;
