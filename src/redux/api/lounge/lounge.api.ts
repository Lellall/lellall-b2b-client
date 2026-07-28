import baseApi from "../baseApi";

export const loungeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLoungeMembers: builder.query<any, void>({
      query: () => ({
        url: "/private-lounge/admin/members",
        method: "GET",
      }),
      providesTags: ["LOUNGE_MEMBERS"],
    }),
    getWalkIns: builder.query<any, void>({
      query: () => ({
        url: "/private-lounge/admin/walk-ins",
        method: "GET",
      }),
      providesTags: ["LOUNGE_WALKINS"],
    }),
    getBottles: builder.query<any, void>({
      query: () => ({
        url: "/private-lounge/admin/bottles",
        method: "GET",
      }),
      providesTags: ["LOUNGE_BOTTLES"],
    }),
    getLoungeStaff: builder.query<any, string>({
      query: (loungeId) => ({
        url: `/private-lounge/admin/lounge/${loungeId}/staff`,
        method: "GET",
      }),
      providesTags: ["LOUNGE_STAFF" as any],
    }),
    createLoungeStaff: builder.mutation<any, { loungeId: string; data: any }>({
      query: ({ loungeId, data }) => ({
        url: `/private-lounge/admin/lounge/${loungeId}/staff`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LOUNGE_STAFF" as any],
    }),
    deleteLoungeStaff: builder.mutation<any, { loungeId: string; userId: string }>({
      query: ({ loungeId, userId }) => ({
        url: `/private-lounge/admin/lounge/${loungeId}/staff/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LOUNGE_STAFF" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLoungeMembersQuery,
  useGetWalkInsQuery,
  useGetBottlesQuery,
  useGetLoungeStaffQuery,
  useCreateLoungeStaffMutation,
  useDeleteLoungeStaffMutation,
} = loungeApi;
