import { baseApi } from '../baseApi';

export const perfumeDashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPerfumeDashboardStats: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/admin/dashboard-stats?storeId=${storeId}`
      }),
      providesTags: ['PERFUME_DASHBOARD'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPerfumeDashboardStatsQuery,
} = perfumeDashboardApi;
