import { baseApi } from '../baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPerfumeInventoryItems: builder.query({
      query: (storeId: string) => ({
        url: `/perfume-store/${storeId}/inventory`
      }),
      providesTags: ['LOUNGE_INVENTORY'],
    }),
    addPerfumeInventoryItem: builder.mutation({
      query: ({ storeId, data }: { storeId: string; data: any }) => ({
        url: `/perfume-store/${storeId}/inventory`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
    restockPerfumeInventoryItem: builder.mutation({
      query: ({ id, amount, cost }: { id: string; amount: number; cost: number }) => ({
        url: `/perfume-store/admin/inventory/${id}/restock`,
        method: 'POST',
        body: { amount, cost },
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
    updatePerfumeInventoryItem: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `/perfume-store/admin/inventory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
    deletePerfumeInventoryItem: builder.mutation({
      query: (id: string) => ({
        url: `/perfume-store/admin/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LOUNGE_INVENTORY'],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetPerfumeInventoryItemsQuery,
  useAddPerfumeInventoryItemMutation,
  useRestockPerfumeInventoryItemMutation,
  useUpdatePerfumeInventoryItemMutation,
  useDeletePerfumeInventoryItemMutation
} = inventoryApi;
