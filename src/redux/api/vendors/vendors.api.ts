import { baseApi } from "../../api/baseApi"
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

export const vendorsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getVendors: builder.query({
            query: () => ({
                url: `/vendor`,
                method: "GET",
                credentials: "include",
            }),
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err) {
                    ErrorHandler(err as any);
                    toast.error("Failed to fetch Vendors", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
    }),
})

export const { useGetVendorsQuery } = vendorsApi