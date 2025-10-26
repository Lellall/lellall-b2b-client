import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";

export interface BankDetails {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetailsResponse {
  bankDetails: BankDetails[];
  count: number;
  message: string;
}

export interface CreateBankDetailsRequest {
  bankName: string;
  accountNumber: string;
  accountName: string;
  restaurantId: string;
}

export interface UpdateBankDetailsRequest {
  bankName?: string;
  accountName?: string;
}

export const bankDetailsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all bank details for a restaurant
    getBankDetails: builder.query<BankDetailsResponse, string>({
      query: (restaurantId) => ({
        url: `/restaurants/${restaurantId}/bank-details`,
        method: "GET",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Failed to fetch bank details:", err);
          toast.error("Failed to fetch bank details", { position: "top-right" });
        }
      },
      providesTags: (_result, _error, restaurantId) => [
        { type: "BANK_DETAILS", id: restaurantId },
        { type: "BANK_DETAILS", id: "LIST" },
      ],
    }),

    // Create new bank details
    createBankDetails: builder.mutation<BankDetailsResponse, { restaurantId: string; data: CreateBankDetailsRequest }>({
      query: ({ restaurantId, data }) => ({
        url: `/restaurants/${restaurantId}/bank-details`,
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Bank details created successfully!", { position: "top-right" });
        } catch (err) {
          console.error("Failed to create bank details:", err);
          toast.error("Failed to create bank details", { position: "top-right" });
        }
      },
      invalidatesTags: (_result, _error, { restaurantId }) => [
        { type: "BANK_DETAILS", id: restaurantId },
        { type: "BANK_DETAILS", id: "LIST" },
      ],
    }),

    // Update specific bank details
    updateBankDetails: builder.mutation<{ bankDetails: BankDetails; message: string }, { bankDetailsId: string; data: UpdateBankDetailsRequest }>({
      query: ({ bankDetailsId, data }) => ({
        url: `/restaurants/bank-details/${bankDetailsId}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Bank details updated successfully!", { position: "top-right" });
        } catch (err) {
          console.error("Failed to update bank details:", err);
          toast.error("Failed to update bank details", { position: "top-right" });
        }
      },
      invalidatesTags: [{ type: "BANK_DETAILS", id: "LIST" }],
    }),

    // Delete specific bank details
    deleteBankDetails: builder.mutation<{ message: string }, string>({
      query: (bankDetailsId) => ({
        url: `/restaurants/bank-details/${bankDetailsId}`,
        method: "DELETE",
        credentials: "include",
      }),
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Bank details deleted successfully!", { position: "top-right" });
        } catch (err) {
          console.error("Failed to delete bank details:", err);
          toast.error("Failed to delete bank details", { position: "top-right" });
        }
      },
      invalidatesTags: [{ type: "BANK_DETAILS", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBankDetailsQuery,
  useCreateBankDetailsMutation,
  useUpdateBankDetailsMutation,
  useDeleteBankDetailsMutation,
} = bankDetailsApi;
