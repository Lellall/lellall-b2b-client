import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

export const inventoryAApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStockSheetStats: builder.query({
            query: ({ subdomain, date }) => ({
                url: `${subdomain}/inventory/stocksheet-stats${date ? `?date=${date}` : ''}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to fetch stock sheet stats", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
        getStockSheet: builder.query({
            query: ({ subdomain, date }) => ({
                url: `${subdomain}/inventory/stocksheet${date ? `?date=${date}` : ''}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to fetch stock sheet", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
        getInventory: builder.query({
            query: (param) => ({
                url: `${param.subdomain}/inventory?page=${param.page}&limit=${param.limit}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to fetch inventory", {
                        position: "top-right",
                    });
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
                    method: "GET",
                    credentials: "include",
                };
            },
            providesTags: ["INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    ErrorHandler(err);
                    toast.error("Failed to fetch inventory stats", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
        downloadInventoryExport: builder.query<string, { subdomain: string; format: string }>({
            query: (param) => ({
                url: `${param.subdomain}/inventory/export/inventory?format=${param.format}`,
                method: "GET",
                credentials: "include",
                responseHandler: (response) => response.text(),
            }),
            providesTags: ["INVENTORY"],
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
                    ErrorHandler(err as any);
                    toast.error("Failed to download inventory export", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
        downloadStockSheetExport: builder.query<string, { subdomain: string; format: string; date?: string }>({
            query: (param) => ({
                url: `${param.subdomain}/inventory/export/stocksheet?format=${param.format}${param.date ? `&date=${param.date}` : ''}`,
                method: "GET",
                credentials: "include",
                responseHandler: (response) => response.text(),
            }),
            providesTags: ["INVENTORY"],
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
                    ErrorHandler(err as any);
                    toast.error("Failed to download stock sheet", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
        requestSupply: builder.mutation({
            query: ({ subdomain, data }) => ({
                url: `/${subdomain}/supply-request/request`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ['INVENTORY'],
        }),
        requestResupply: builder.mutation({
            query: ({ subdomain, data }) => ({
                url: `/${subdomain}/inventory/resupply`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ['INVENTORY'],
        }),
        createUnit: builder.mutation({
            query: ({ subdomain, data }) => ({
                url: `${subdomain}/units`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ['INVENTORY'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Unit created successfully", { position: "top-right" });
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to create unit", { position: "top-right" });
                    throw err;
                }
            },
        }),
        getUnits: builder.query({
            query: ({ subdomain }) => ({
                url: `${subdomain}/units`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["INVENTORY"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to fetch units", { position: "top-right" });
                    throw err;
                }
            },
        }),
        updateUnit: builder.mutation({
            query: ({ subdomain, unitId, data }) => ({
                url: `${subdomain}/units/${unitId}`,
                method: "PATCH",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ['INVENTORY'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Unit updated successfully", { position: "top-right" });
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to update unit", { position: "top-right" });
                    throw err;
                }
            },
        }),
        deleteUnit: builder.mutation({
            query: ({ subdomain, unitId }) => ({
                url: `${subdomain}/units/${unitId}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ['INVENTORY'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Unit deleted successfully", { position: "top-right" });
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to delete unit", { position: "top-right" });
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
    useDeleteUnitMutation
} = inventoryAApi;