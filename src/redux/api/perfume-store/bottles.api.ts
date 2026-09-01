import { baseApi } from '../baseApi';

export const bottlesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMemberBottles: builder.query({
      query: (membershipId: string) => ({ url: `/perfume-store/admin/bottles/member/${membershipId}` }),
      providesTags: ['Bottles'],
    }),
    logBottlePour: builder.mutation({
      query: ({ bottleId, amountPoured, servedBy, notes }: { bottleId: string; amountPoured: number; servedBy?: string; notes?: string }) => ({
        url: `/perfume-store/admin/bottles/${bottleId}/pour`,
        method: 'POST',
        body: { amountPoured, servedBy, notes },
      }),
      invalidatesTags: ['Bottles'],
    }),
    addBottle: builder.mutation({
      query: ({ membershipId, data }: { membershipId: string; data: any }) => ({
        url: `/perfume-store/admin/bottles/member/${membershipId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bottles'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMemberBottlesQuery, useLogBottlePourMutation, useAddBottleMutation } = bottlesApi;
