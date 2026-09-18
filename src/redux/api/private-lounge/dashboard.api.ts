import { baseApi } from '../baseApi';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/dashboard-stats?loungeId=${loungeId}`
      }),
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
    getRecentActivity: builder.query({
      query: (params: { loungeId: string; date?: string; page?: number; limit?: number }) => {
        const { loungeId, date, page, limit } = params;
        const searchParams = new URLSearchParams({ loungeId });
        if (date) searchParams.set('date', date);
        if (page) searchParams.set('page', String(page));
        if (limit) searchParams.set('limit', String(limit));
        return { url: `/private-lounge/admin/activity?${searchParams.toString()}` };
      },
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
    getRevenueSummary: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/revenue/${loungeId}`,
      }),
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
    getMenuSalesReport: builder.query({
      query: (params: { loungeId: string; startDate?: string; endDate?: string }) => {
        const { loungeId, startDate, endDate } = params;
        const searchParams = new URLSearchParams();
        if (startDate) searchParams.set('startDate', startDate);
        if (endDate) searchParams.set('endDate', endDate);
        const qs = searchParams.toString();
        return { url: `/private-lounge/admin/menu-sales/${loungeId}${qs ? `?${qs}` : ''}` };
      },
      providesTags: ['LOUNGE_DASHBOARD'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDashboardStatsQuery,
  useGetRecentActivityQuery,
  useGetRevenueSummaryQuery,
  useGetMenuSalesReportQuery,
} = dashboardApi;
