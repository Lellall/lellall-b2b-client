import { baseApi } from "../../api/baseApi";

type MenuResponse = {
    id: string;
    name: string;
    restaurantId: string;
    menuItemCount: number;
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
};

type MenuItemResponse = {
    id: string;
    name: string;
    description?: string;
    price: number;
    status: string;
    tags?: string[];
    inventoryItems: { inventoryId: string; quantity: number }[];
    menuId?: string;
};

type CreateMenuDto = {
    name: string;
};

type AddMenuItemDto = {
    name: string;
    description?: string;
    price: number;
    inventoryItems: { inventoryId: string; quantity: number }[];
};

type BulkEditMenuItemDto = {
    items: {
        menuItemId: string;
        name: string;
        description?: string;
        price: number;
        inventoryItems?: { inventoryId: string; quantity: number }[];
    }[];
};

type PrepareMenuItemResponse = {
    message: string;
    consumedInventory: any[];
};

export const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Queries
        getMenus: builder.query<MenuResponse[], { subdomain: string; search?: string }>({
            query: (params) => ({
                url: `/menus/${params.subdomain}`,
                method: "GET",
                params: params.search ? { search: params.search } : undefined,
                credentials: "include",
            }),
            providesTags: ["MENU"],
        }),

        getMenuItems: builder.query<MenuItemResponse[], { subdomain: string; menuId: string }>({
            query: (params) => ({
                url: `/menus/${params.subdomain}/${params.menuId}/items`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"],
        }),

        getAllMenuItems: builder.query<MenuItemResponse[], { subdomain: string; search?: string; menuId?: string }>({
            query: (params) => {
                const queryParams: Record<string, string> = {};
                if (params.search) queryParams.search = params.search;
                if (params.menuId) {
                    queryParams.menuId = params.menuId;
                }
                const url = `/menus/${params.subdomain}/items`;
                return {
                    url,
                    method: "GET",
                    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
                    credentials: "include",
                };
            },
            providesTags: ["MENU"],
        }),

        getAllTags: builder.query<string[], { subdomain: string }>({
            query: (params) => ({
                url: `/menus/${params.subdomain}/tags`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"],
        }),

        getMenuItemsByTag: builder.query<MenuItemResponse[], { subdomain: string; tag: string }>({
            query: (params) => ({
                url: `/menus/${params.subdomain}/items/by-tag/${params.tag}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["MENU"],
        }),

        // Mutations
        createMenu: builder.mutation<MenuResponse, { subdomain: string; data: CreateMenuDto }>({
            query: ({ subdomain, data }) => ({
                url: `/menus/${subdomain}`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["MENU"],
        }),

        addMenuItem: builder.mutation<
            { message: string; menuItem: MenuItemResponse; consumedInventory: any[] },
            { subdomain: string; menuId: string; data: AddMenuItemDto }
        >({
            query: ({ subdomain, menuId, data }) => ({
                url: `/menus/${subdomain}/${menuId}/items`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["MENU"],
        }),

        bulkEditMenuItem: builder.mutation<
            { message: string; updatedItems: MenuItemResponse[] },
            { subdomain: string; menuId: string; data: BulkEditMenuItemDto }
        >({
            query: ({ subdomain, menuId, data }) => ({
                url: `/menus/${subdomain}/${menuId}/items/bulk-edit`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
            invalidatesTags: ["MENU"],
        }),

        prepareMenuItem: builder.mutation<
            PrepareMenuItemResponse,
            { subdomain: string; menuItemId: string; quantity?: number }
        >({
            query: ({ subdomain, menuItemId, quantity }) => ({
                url: `/menus/${subdomain}/${menuItemId}/prepare`,
                method: "POST",
                body: quantity ? { quantity } : undefined,
                credentials: "include",
            }),
        }),

        deleteMenuItem: builder.mutation<
            { message: string; deletedMenuItemId: string },
            { subdomain: string; menuItemId: string }
        >({
            query: ({ subdomain, menuItemId }) => ({
                url: `/menus/${subdomain}/items/${menuItemId}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["MENU"],
        }),

        deleteMenu: builder.mutation({
            query: ({ subdomain, menuId }) => ({
                url: `/menus/${subdomain}/${menuId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["MENU"],
        }),
    }),
});

export const {
    useGetMenusQuery,
    useGetMenuItemsQuery,
    useGetAllMenuItemsQuery,
    useGetAllTagsQuery,
    useGetMenuItemsByTagQuery,
    useCreateMenuMutation,
    useAddMenuItemMutation,
    useBulkEditMenuItemMutation,
    usePrepareMenuItemMutation,
    useDeleteMenuItemMutation,
    useDeleteMenuMutation,
} = menuApi;