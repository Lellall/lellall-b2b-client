import { baseApi } from '../baseApi';

export const membersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMembers: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/admin/members?storeId=${storeId}`
      }),
      providesTags: ['LOUNGE_MEMBERS'],
    }),
    getDeletedMembers: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/admin/deleted-members?storeId=${storeId}`
      }),
      providesTags: ['LOUNGE_MEMBERS'],
    }),
    getMemberById: builder.query({
      query: (memberId: string) => ({
        url: `/perfume-store/admin/members/${memberId}`
      }),
      providesTags: (_result, _error, id) => [{ type: 'LOUNGE_MEMBERS', id }],
    }),
    updateMember: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/perfume-store/admin/members/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    suspendMember: builder.mutation({
      query: (id: string) => ({
        url: `/perfume-store/admin/members/${id}/suspend`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    deleteMember: builder.mutation({
      query: (id: string) => ({
        url: `/perfume-store/admin/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    reactivateMember: builder.mutation({
      query: (id: string) => ({
        url: `/perfume-store/admin/members/${id}/reactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    renewMembership: builder.mutation({
      query: (id: string) => ({
        url: `/perfume-store/admin/members/${id}/renew`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    checkInMember: builder.mutation({
      query: ({ membershipId, pin }: { membershipId: string; pin: string }) => ({
        url: `/perfume-store/admin/members/${membershipId}/check-in`,
        method: 'POST',
        body: { pin },
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    checkOutMember: builder.mutation({
      query: (visitId: string) => ({
        url: `/perfume-store/admin/members/visits/${visitId}/check-out`,
        method: 'POST',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    requestCheckInPin: builder.mutation({
      query: (membershipId: string) => ({
        url: `/perfume-store/admin/members/${membershipId}/request-pin`,
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetAllMembersQuery,
  useGetDeletedMembersQuery,
  useGetMemberByIdQuery,
  useUpdateMemberMutation,
  useSuspendMemberMutation,
  useDeleteMemberMutation,
  useReactivateMemberMutation,
  useRenewMembershipMutation,
  useCheckInMemberMutation,
  useCheckOutMemberMutation,
  useRequestCheckInPinMutation
} = membersApi;
