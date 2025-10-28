// src/api/supplyRequestApi.ts
import { toast } from 'react-toastify';
import baseApi from '../baseApi';

export const supplyRequestApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createSupplyRequest: builder.mutation<CreateSupplyRequestResponse, { subdomain: string; data: { text: string; restaurantId: string; userId: string } }>({
            query: ({ subdomain, data }) => ({
                url: `/gpt-supply-requests`,
                method: 'POST',
                body: data,
                credentials: 'include',
            }),
            invalidatesTags: ['SUPPLY_REQUEST'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    toast.success('Supply request created successfully', { position: 'top-right' });
                } catch (err: any) {
                    toast.error('Failed to create supply request', { position: 'top-right' });
                    console.error(err);
                }
            },
        }),
        getVendors: builder.query<Vendor[], { subdomain: string }>({
            query: ({ subdomain }) => ({
                url: `/vendors/${subdomain}`,
                method: 'GET',
                credentials: 'include',
            }),
            providesTags: ['VENDORS'],
        }),
        sendToVendors: builder.mutation<SendToVendorsResponse, { subdomain: string; gptSupplyRequestId: string; data: { vendorIds: string[]; userId: string } }>({
            query: ({ subdomain, gptSupplyRequestId, data }) => ({
                url: `/gpt-supply-requests/${gptSupplyRequestId}/send-to-vendors`,
                method: 'POST',
                body: data,
                credentials: 'include',
            }),
            invalidatesTags: ['SUPPLY_REQUEST', 'VENDORS'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    toast.success('Supply request sent to vendors', { position: 'top-right' });
                } catch (err: any) {
                    toast.error('Failed to send supply request to vendors', { position: 'top-right' });
                    console.error(err);
                }
            },
        }),
        updateParsedItems: builder.mutation<SupplyRequest, { subdomain: string; gptSupplyRequestId: string; data: { parsedJson: ParsedItem[]; userId: string } }>({
            query: ({ subdomain, gptSupplyRequestId, data }) => ({
                url: `/gpt-supply-requests/${gptSupplyRequestId}/update-parsed`,
                method: 'PATCH',
                body: data,
                credentials: 'include',
            }),
            invalidatesTags: ['SUPPLY_REQUEST'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success('Parsed items updated successfully', { position: 'top-right' });
                } catch (err: any) {
                    toast.error('Failed to update parsed items', { position: 'top-right' });
                    console.error(err);
                }
            },
        }),
        gptGetInventory: builder.query<ParsedItem[], { subdomain: string; restaurantId: string }>({
            query: ({ subdomain, restaurantId }) => ({
                url: `/gpt-supply-requests/${restaurantId}`,
                method: 'GET',
                credentials: 'include',
            }),
            providesTags: ['INVENTORY'],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success('Inventory loaded successfully', { position: 'top-right' });
                } catch (err: any) {
                    toast.error('Failed to load inventory', { position: 'top-right' });
                    console.error(err);
                }
            },
        }),
    }),
});

export const {
    useCreateSupplyRequestMutation,
    useGetVendorsQuery,
    useSendToVendorsMutation,
    useUpdateParsedItemsMutation,
    useGptGetInventoryQuery,
} = supplyRequestApi;

export interface ParsedItem {
    id: string;
    productName: string;
    quantity: number;
    totalBaseQuantity: number;
    unitPrice: number;
    unitOfMeasurement: {
        id: string;
        name: string;
        baseUnit: string;
        baseQuantityPerUnit: number;
    };
    createdAt: string;
    updatedAt: string;
    unit: string;
    notes?: string | null;
    itemType?: string;
    portions?: number;
    portionSize?: number | null;
    closingStock?: number;
    openingStock?: number;
    quantityUsed?: number;
    costPerServing?: number | null;
    servingsPerUnit?: number | null;
    subUnitsPerUnit?: number | null;
    servingsPerSubUnit?: number | null;
}

export interface SupplyRequest {
    id: string;
    text: string;
    parsedJson: ParsedItem[];
    restaurantId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReorderSuggestion {
    productName: string;
    previousRequest: {
        id: string;
        parsedJson: ParsedItem;
    };
}

export interface CreateSupplyRequestResponse {
    supplyRequest: SupplyRequest | null;
    pendingReviewId: string | null;
    reorderSuggestions: ReorderSuggestion[] | null;
}

export interface Vendor {
    id: string;
    name: string;
}

export interface SendToVendorsResponse {
    message: string;
    vendorRequestIds: string[];
}