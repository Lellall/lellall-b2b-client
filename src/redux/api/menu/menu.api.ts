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
    inventoryItems: { inventoryId: string; quantity: number }[];
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

        getAllMenuItems: builder.query<MenuItemResponse[], { subdomain: string; search?: string }>({
            query: (params) => ({
                url: `/menus/${params.subdomain}/items`,
                method: "GET",
                params: params.search ? { search: params.search } : undefined,
                credentials: "include",
            }),
            providesTags: ["MENU"],
        }),

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
    useCreateMenuMutation,
    useAddMenuItemMutation,
    useBulkEditMenuItemMutation,
    usePrepareMenuItemMutation,
    useDeleteMenuItemMutation,
    useDeleteMenuMutation,
} = menuApi;