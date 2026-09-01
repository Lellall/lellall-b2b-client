import baseApi from "../baseApi";

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStoreMembers: builder.query<any, void>({
      query: () => ({
        url: "/perfume-store/admin/members",
        method: "GET",
      }),
      providesTags: ["LOUNGE_MEMBERS"],
    }),
    getWalkIns: builder.query<any, void>({
      query: () => ({
        url: "/perfume-store/admin/walk-ins",
        method: "GET",
      }),
      providesTags: ["LOUNGE_WALKINS"],
    }),
    getBottles: builder.query<any, void>({
      query: () => ({
        url: "/perfume-store/admin/bottles",
        method: "GET",
      }),
      providesTags: ["LOUNGE_BOTTLES"],
    }),
    getStoreStaff: builder.query<any, string>({
      query: (storeId) => ({
        url: `/perfume-store/admin/store/${storeId}/staff`,
        method: "GET",
      }),
      providesTags: ["LOUNGE_STAFF" as any],
    }),
    createStoreStaff: builder.mutation<any, { storeId: string; data: any }>({
      query: ({ storeId, data }) => ({
        url: `/perfume-store/admin/store/${storeId}/staff`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LOUNGE_STAFF" as any],
    }),
    deleteStoreStaff: builder.mutation<any, { storeId: string; userId: string }>({
      query: ({ storeId, userId }) => ({
        url: `/perfume-store/admin/store/${storeId}/staff/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["LOUNGE_STAFF" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStoreMembersQuery,
  useGetWalkInsQuery,
  useGetBottlesQuery,
  useGetStoreStaffQuery,
  useCreateStoreStaffMutation,
  useDeleteStoreStaffMutation,
} = storeApi;
