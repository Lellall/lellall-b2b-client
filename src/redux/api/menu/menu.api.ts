import { baseApi } from "../baseApi";

const menuApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMenuCategories: builder.query({
        query: () => ({
            url: "/menu-categories",
            method: "GET",
        }),
        }),
        getMenuCategory: builder.query({
        query: (id) => ({
            url: `/menu-categories/${id}`,
            method: "GET",
        }),
        // providesTags: ["PRODUCTS"],
        })
    }),
})

export const { useGetMenuCategoriesQuery, useLazyGetMenuCategoryQuery } = menuApi;