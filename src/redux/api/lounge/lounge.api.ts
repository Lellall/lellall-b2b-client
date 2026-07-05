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
  }),
  overrideExisting: false,
});

export const {
  useGetLoungeMembersQuery,
  useGetWalkInsQuery,
  useGetBottlesQuery,
} = loungeApi;
