import { baseApi } from '../baseApi';

export const loungeBillingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoungeBillingStatus: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/billing/status?loungeId=${loungeId}`,
      }),
    }),
    subscribeLoungeBilling: builder.mutation({
      query: ({ loungeId, email }: { loungeId: string; email: string }) => ({
        url: `/private-lounge/admin/billing/subscribe`,
        method: 'POST',
        body: { loungeId, email },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLoungeBillingStatusQuery,
  useSubscribeLoungeBillingMutation,
} = loungeBillingApi;
