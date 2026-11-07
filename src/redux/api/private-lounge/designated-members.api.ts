import { baseApi } from '../baseApi';

export interface DesignatedMember {
  id: string;
  fullName: string;
  email: string;
  primaryPhone: string;
  occupation: string | null;
  membershipNumber: string | null;
  status: string;
}

export interface DesignatedMembersResponse {
  summary: { added: number; limit: number; remaining: number };
  members: DesignatedMember[];
}

export interface ImportRow {
  line: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  errors: string[];
}

export interface ImportPreview {
  rows: ImportRow[];
  summary: { total: number; valid: number; invalid: number; limit: number; alreadyAdded: number };
}

export const designatedMembersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDesignatedMembers: builder.query<DesignatedMembersResponse, string>({
      query: (membershipId) => ({ url: `/private-lounge/admin/members/${membershipId}/designated-members` }),
      providesTags: (_result, _error, membershipId) => [{ type: 'LOUNGE_DESIGNATED', id: membershipId }],
    }),
    // confirm=false only checks the file and reports; confirm=true adds the valid rows
    importDesignatedMembers: builder.mutation<any, { membershipId: string; file: File; confirm: boolean }>({
      query: ({ membershipId, file, confirm }) => {
        const body = new FormData();
        body.append('file', file);
        body.append('confirm', String(confirm));
        return {
          url: `/private-lounge/admin/members/${membershipId}/designated-members/import`,
          method: 'POST',
          body,
        };
      },
      invalidatesTags: (_result, _error, { membershipId, confirm }) =>
        confirm ? [{ type: 'LOUNGE_DESIGNATED', id: membershipId }, 'LOUNGE_MEMBERS'] : [],
    }),
    addDesignatedMember: builder.mutation<any, { membershipId: string; data: { name: string; email: string; phone?: string; position?: string } }>({
      query: ({ membershipId, data }) => ({
        url: `/private-lounge/admin/members/${membershipId}/designated-members`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { membershipId }) => [{ type: 'LOUNGE_DESIGNATED', id: membershipId }, 'LOUNGE_MEMBERS'],
    }),
    removeDesignatedMember: builder.mutation<any, { membershipId: string; memberId: string }>({
      query: ({ membershipId, memberId }) => ({
        url: `/private-lounge/admin/members/${membershipId}/designated-members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { membershipId }) => [{ type: 'LOUNGE_DESIGNATED', id: membershipId }, 'LOUNGE_MEMBERS'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDesignatedMembersQuery,
  useImportDesignatedMembersMutation,
  useAddDesignatedMemberMutation,
  useRemoveDesignatedMemberMutation,
} = designatedMembersApi;
