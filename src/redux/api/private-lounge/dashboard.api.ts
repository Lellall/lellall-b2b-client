import { baseApi } from '../baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/dashboard-stats?loungeId=${loungeId}`
      }),
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
} = dashboardApi;
