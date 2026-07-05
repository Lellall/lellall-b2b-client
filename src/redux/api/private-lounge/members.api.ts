import { baseApi } from '../baseApi';

export const membersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllMembers: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/members?loungeId=${loungeId}`
      }),
      providesTags: ['LOUNGE_MEMBERS'],
    }),
    getMemberById: builder.query({
      query: (memberId: string) => ({
        url: `/private-lounge/admin/members/${memberId}`
      }),
      providesTags: (_result, _error, id) => [{ type: 'LOUNGE_MEMBERS', id }],
    }),
    updateMember: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/private-lounge/admin/members/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    suspendMember: builder.mutation({
      query: (id: string) => ({
        url: `/private-lounge/admin/members/${id}/suspend`,
        method: 'PATCH',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
    deleteMember: builder.mutation({
      query: (id: string) => ({
        url: `/private-lounge/admin/members/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LOUNGE_MEMBERS'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetAllMembersQuery, 
  useGetMemberByIdQuery,
  useUpdateMemberMutation,
  useSuspendMemberMutation,
  useDeleteMemberMutation
} = membersApi;
