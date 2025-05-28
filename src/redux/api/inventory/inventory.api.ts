import { baseApi } from '../../api/baseApi';
import { toast } from 'react-toastify';
import { ErrorHandler } from '@/utils/error-handler';
interface LowStockInventoryResponse {
  data: Array<{
    id: string;
    productName: string;
    closingStock: number;
    unitPrice: number;
    unitOfMeasurement: string;
    category: string;
    dateAdded: string;
    createdAt: string;
    updatedAt: string;
  }>;
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export const inventoryAApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Existing endpoints...
    getStockSheetStats: builder.query({
      query: ({ subdomain, date }) => ({
        url: `${subdomain}/inventory/stocksheet-stats${date ? `?date=${date}` : ''}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to fetch stock sheet stats', { position: 'top-right' });
          throw err;
        }
      },
    }),
    getAllSupplyRequest: builder.query({
      query: (params) => ({
        url: `${params.subdomain}/supply-request/all`,
        method: 'GET',
        params: params.search ? { search: params.search } : undefined,
        credentials: 'include',
      }),
      providesTags: ['MENU'],
    }),
    getSupplyRequestById: builder.query({
      query: (params) => ({
        url: `${params.subdomain}/supply-request/${params.id}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['MENU'],
    }),
    getStockSheet: builder.query({
      query: ({ subdomain, date, page = 1, limit = 10 }) => ({
        url: `/${subdomain}/inventory/stocksheet`,
        method: 'GET',
        params: {
          date: date || undefined,
          page,
          limit,
        },
        credentials: 'include',
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to fetch stock sheet', { position: 'top-right' });
          throw err;
        }
      },
    }),
    getInventory: builder.query({
      query: (param) => ({
        url: `${param.subdomain}/inventory?page=${param.page}&limit=${param.limit}${param.search ? `&search=${encodeURIComponent(param.search)}` : ''}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to fetch inventory', { position: 'top-right' });
          throw err;
        }
      },
    }),
    getInventoryStatsOR: builder.query({
      query: (param) => {
        if (typeof param.subdomain !== 'string') {
          throw new Error('Subdomain must be a string');
        }
        if (typeof param.period !== 'string') {
          throw new Error('Period must be a string');
        }
        return {
          url: `${param.subdomain}/inventory/summary?period=${param.period}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to fetch inventory stats', { position: 'top-right' });
          throw err;
        }
      },
    }),
    downloadInventoryExport: builder.query<string, { subdomain: string; format: string }>({
      query: (param) => ({
        url: `${param.subdomain}/inventory/export/inventory?format=${param.format}`,
        method: 'GET',
        credentials: 'include',
        responseHandler: (response) => response.text(),
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `inventory_export_${new Date().toISOString()}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to download inventory export', { position: 'top-right' });
          throw err;
        }
      },
    }),
    downloadStockSheetExport: builder.query<string, { subdomain: string; format: string; date?: string }>({
      query: (param) => ({
        url: `${param.subdomain}/inventory/export/stocksheet?format=${param.format}${param.date ? `&date=${param.date}` : ''}`,
        method: 'GET',
        credentials: 'include',
        responseHandler: (response) => response.text(),
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `stocksheet_export_${new Date().toISOString()}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to download stock sheet', { position: 'top-right' });
          throw err;
        }
      },
    }),
    requestSupply: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `/${subdomain}/supply-request/request`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Supply request submitted successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error(err?.data?.message || 'Failed to submit supply request', { position: 'top-right' });
          throw err;
        }
      },
    }),
    requestResupply: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `/${subdomain}/inventory/resupply`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
    }),
    createUnit: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `${subdomain}/units`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Unit created successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to create unit', { position: 'top-right' });
          throw err;
        }
      },
    }),
    getUnits: builder.query({
      query: ({ subdomain }) => ({
        url: `${subdomain}/units`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to fetch units', { position: 'top-right' });
          throw err;
        }
      },
    }),
    updateUnit: builder.mutation({
      query: ({ subdomain, unitId, data }) => ({
        url: `${subdomain}/units/${unitId}`,
        method: 'PATCH',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Unit updated successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to update unit', { position: 'top-right' });
          throw err;
        }
      },
    }),
    deleteUnit: builder.mutation({
      query: ({ subdomain, unitId }) => ({
        url: `${subdomain}/units/${unitId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Unit deleted successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to delete unit', { position: 'top-right' });
          throw err;
        }
      },
    }),
    bulkUpdateInventory: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `/${subdomain}/inventory/bulk-update`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Inventory items updated successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to update inventory items', { position: 'top-right' });
          throw err;
        }
      },
    }),
    deleteInventoryItem: builder.mutation({
      query: ({ subdomain, inventoryId }) => ({
        url: `/${subdomain}/inventory/${inventoryId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Inventory item deleted successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to delete inventory item', { position: 'top-right' });
          throw err;
        }
      },
    }),
    bulkDeleteInventory: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `/${subdomain}/inventory/bulk-delete`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Inventory items deleted successfully', { position: 'top-right' });
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to delete inventory items', { position: 'top-right' });
          throw err;
        }
      },
    }),
    getSupplyRequestTemplates: builder.query({
      query: ({ subdomain }) => ({
        url: `/${subdomain}/supply-request-template`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: [],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          if (err?.status === 401) {
            toast.error('Unauthorized. Please ensure you are logged in and authorized for this restaurant.', { position: 'top-right' });
          } else if (err?.status === 404) {
            toast.error('Restaurant not found. Please check the subdomain.', { position: 'top-right' });
          } else {
            toast.error(err?.data?.message || 'Failed to fetch supply request templates', { position: 'top-right' });
          }
          throw err;
        }
      },
    }),
    createSupplyRequestTemplate: builder.mutation({
      query: ({ subdomain, data }) => ({
        url: `/${subdomain}/supply-request-template`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: [],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Supply request template created successfully', { position: 'top-right' });
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.data?.message || 'Failed to create supply request template', { position: 'top-right' });
          throw err;
        }
      },
    }),
    applySupplyRequestTemplate: builder.mutation<any, { subdomain: string; data: ApplySupplyRequestTemplateDto }>({
      query: ({ subdomain, data }) => ({
        url: `/${subdomain}/supply-request-template/${data.templateId}/apply`,
        method: 'POST',
        credentials: 'include',
        body: data,
      }),
      invalidatesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Supply request template applied successfully', { position: 'top-right' });
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.data?.message || 'Failed to apply supply request template', { position: 'top-right' });
          throw err;
        }
      },
    }),
    deleteSupplyRequestTemplate: builder.mutation({
      query: ({ subdomain, templateId }) => ({
        url: `/${subdomain}/supply-request-template/${templateId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: [],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Supply request template deleted successfully', { position: 'top-right' });
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.data?.message || 'Failed to delete supply request template', { position: 'top-right' });
          throw err;
        }
      },
    }),
    // New endpoint for low stock inventory
    getLowStockInventory: builder.query<LowStockInventoryResponse, { subdomain: string; page?: number; limit?: number; search?: string }>({
      query: ({ subdomain, page = 1, limit = 10, search }) => ({
        url: `${subdomain}/inventory/low-stock?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: ['INVENTORY'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          ErrorHandler(err);
          toast.error('Failed to fetch low stock inventory', { position: 'top-right' });
          throw err;
        }
      },
    }),
  }),
});

export const {
  useRequestSupplyMutation,
  useGetStockSheetQuery,
  useGetStockSheetStatsQuery,
  useGetInventoryQuery,
  useGetInventoryStatsORQuery,
  useLazyDownloadInventoryExportQuery,
  useLazyDownloadStockSheetExportQuery,
  useRequestResupplyMutation,
  useCreateUnitMutation,
  useGetUnitsQuery,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useGetAllSupplyRequestQuery,
  useGetSupplyRequestByIdQuery,
  useBulkUpdateInventoryMutation,
  useDeleteInventoryItemMutation,
  useBulkDeleteInventoryMutation,
  useGetSupplyRequestTemplatesQuery,
  useCreateSupplyRequestTemplateMutation,
  useApplySupplyRequestTemplateMutation,
  useDeleteSupplyRequestTemplateMutation,
  useGetLowStockInventoryQuery,
} = inventoryAApi;

interface ApplySupplyRequestTemplateDto {
  templateId: string;
  supplies: Array<{
    id?: string;
    isNew?: boolean;
    vendorId: string;
    productName: string;
    quantity: number;
    unitOfMeasurement: string;
    unitPrice: number;
    baseUnit: string;
    baseQuantityPerUnit: number;
    requestMethod?: 'MANUAL' | 'BULK';
    specialNote?: string;
  }>;
  restaurantId?: string;
}