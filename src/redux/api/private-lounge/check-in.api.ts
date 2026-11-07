import { baseApi } from '../baseApi';

export const checkInApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    lookupCheckInCode: builder.query({
      query: (code: string) => ({
        url: `/private-lounge/admin/check-in/${encodeURIComponent(code.trim())}`,
      }),
    }),
    redeemGuestPass: builder.mutation({
      query: (data: { code: string; guestName?: string; guestPhone?: string; guestEmail?: string }) => ({
        url: `/private-lounge/admin/passes/redeem`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WalkIns' as any, 'LOUNGE_MEMBERS', 'LOUNGE_PASSES', 'LOUNGE_TABS'],
    }),
  }),
  overrideExisting: false,
});

export const { useLazyLookupCheckInCodeQuery, useRedeemGuestPassMutation } = checkInApi;
