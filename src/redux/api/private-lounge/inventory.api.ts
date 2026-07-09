import { baseApi } from '../baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventoryItems: builder.query({
      query: (loungeId: string) => ({
        url: `/private-lounge/admin/inventory?loungeId=${loungeId}`
      }),
      providesTags: ['LOUNGE_INVENTORY'],
    }),
    addInventoryItem: builder.mutation({
      query: ({ loungeId, data }: { loungeId: string; data: any }) => ({
        url: `/private-lounge/admin/inventory?loungeId=${loungeId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
    restockInventoryItem: builder.mutation({
      query: ({ id, amount, cost }: { id: string; amount: number; cost: number }) => ({
        url: `/private-lounge/admin/inventory/${id}/restock`,
        method: 'POST',
        body: { amount, cost },
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
    deleteLoungeInventoryItem: builder.mutation({
      query: (id: string) => ({
        url: `/private-lounge/admin/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetInventoryItemsQuery,
  useAddInventoryItemMutation,
  useRestockInventoryItemMutation,
  useDeleteLoungeInventoryItemMutation
} = inventoryApi;
