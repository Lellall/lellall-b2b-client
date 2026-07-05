import { baseApi } from '../baseApi';

export const walkInsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTodaysWalkIns: builder.query({
      query: (loungeId: string) => ({ url: `/private-lounge/admin/walkin/${loungeId}/today` }),
      providesTags: ['WalkIns'],
    }),
    createWalkIn: builder.mutation({
      query: ({ loungeId, guestName, guestPhone, guestEmail, notes, method = 'POS_TERMINAL' }: { loungeId: string; guestName?: string; guestPhone?: string; guestEmail?: string; notes?: string; method?: string }) => ({
        url: `/private-lounge/admin/walkin/${loungeId}`,
        method: 'POST',
        body: { guestName, guestPhone, guestEmail, notes, method },
      }),
      invalidatesTags: ['WalkIns'],
    }),
    confirmWalkInPayment: builder.mutation({
      query: ({ id, paymentReference, method }: { id: string; paymentReference?: string; method: string }) => ({
        url: `/private-lounge/admin/walkin/${id}/confirm-payment`,
        method: 'PATCH',
        body: { paymentReference, method },
      }),
      invalidatesTags: ['WalkIns'],
    }),
    logDishSelection: builder.mutation({
      query: ({ id, dishName, notes }: { id: string; dishName: string; notes?: string }) => ({
        url: `/private-lounge/admin/walkin/${id}/dish`,
        method: 'POST',
        body: { dishName, notes },
      }),
      invalidatesTags: ['WalkIns'],
    }),
    checkOutWalkIn: builder.mutation({
      query: (id: string) => ({
        url: `/private-lounge/admin/walkin/${id}/checkout`,
        method: 'PATCH',
      }),
      invalidatesTags: ['WalkIns'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetTodaysWalkInsQuery, 
  useCreateWalkInMutation,
  useConfirmWalkInPaymentMutation,
  useLogDishSelectionMutation,
  useCheckOutWalkInMutation
} = walkInsApi;
