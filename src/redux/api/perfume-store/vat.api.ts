import { baseApi } from '../baseApi';

export const perfumeVatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPerfumeVatConfig: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/${storeId}/vat-config`,
      }),
      providesTags: ['VatConfig'],
    }),
    updatePerfumeVatConfig: builder.mutation({
      query: ({ storeId, data }: { storeId: string; data: { vatEnabled: boolean; vatRate?: number } }) => ({
        url: `/perfume-store/${storeId}/vat-config`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['VatConfig'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPerfumeVatConfigQuery,
  useUpdatePerfumeVatConfigMutation,
} = perfumeVatApi;
