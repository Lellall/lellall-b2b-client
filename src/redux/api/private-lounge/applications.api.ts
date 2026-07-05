import { baseApi } from '../baseApi';

export const applicationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/applications?loungeId=${loungeId}`
      }),
      providesTags: ['LOUNGE_APPLICATIONS'],
    }),
    submitApplication: builder.mutation({
      query: ({ loungeId, data }: { loungeId: string; data: any }) => ({
        url: `/private-lounge/${loungeId}/apply`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_APPLICATIONS'],
    }),
    approveApplication: builder.mutation({
      query: (applicationId: string) => ({
        url: `/private-lounge/admin/applications/${applicationId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LOUNGE_APPLICATIONS', 'LOUNGE_MEMBERS'],
    }),
    declineApplication: builder.mutation({
      query: (applicationId: string) => ({
        url: `/private-lounge/admin/applications/${applicationId}/decline`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LOUNGE_APPLICATIONS'],
    }),
    confirmPayment: builder.mutation({
      query: (applicationId: string) => ({
        url: `/private-lounge/admin/members/${applicationId}/confirm-payment`,
        method: 'PATCH',
        body: { method: 'MANUAL_OVERRIDE' }
      }),
      invalidatesTags: ['LOUNGE_APPLICATIONS', 'LOUNGE_MEMBERS'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetApplicationsQuery,
  useSubmitApplicationMutation,
  useApproveApplicationMutation,
  useDeclineApplicationMutation,
  useConfirmPaymentMutation,
} = applicationsApi;
