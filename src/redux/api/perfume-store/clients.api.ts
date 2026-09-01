// Clients (PerfumeClient) CRUD + register client
import { baseApi } from '../baseApi';

export const clientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPerfumeClients: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/${storeId}/clients`,
      }),
      providesTags: ['PERFUME_CLIENTS'],
    }),
    registerPerfumeClient: builder.mutation({
      query: ({ storeId, data }: { storeId: string; data: any }) => ({
        url: `/perfume-store/${storeId}/clients`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PERFUME_CLIENTS'],
    }),
    getPerfumeClientById: builder.query({
      query: (clientId: string) => ({
        url: `/perfume-store/clients/${clientId}`,
      }),
      providesTags: (_r, _e, id) => [{ type: 'PERFUME_CLIENTS' as const, id }],
    }),
    updatePerfumeClient: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/perfume-store/clients/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PERFUME_CLIENTS'],
    }),
    sendPerfumeRecommendation: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/perfume-store/clients/${id}/recommend`,
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPerfumeClientsQuery,
  useRegisterPerfumeClientMutation,
  useGetPerfumeClientByIdQuery,
  useUpdatePerfumeClientMutation,
  useSendPerfumeRecommendationMutation,
} = clientsApi;
