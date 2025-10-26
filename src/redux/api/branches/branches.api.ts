import { baseApi } from "../baseApi";
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

export interface Branch {
  id: string;
  name: string;
  subdomain: string;
  address: string;
  ownerId: string;
  parentId: string;
  kycStatus: "PENDING" | "APPROVED" | "REJECTED";
  serviceFeeRate?: number;
  configId?: string | null;
  createdAt: string;
  updatedAt: string;
  parent?: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export interface CreateBranchRequest {
  name: string;
  subdomain: string;
  ownerId: string;
  address: string;
  parentId: string;
}

export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBranches: builder.query<Branch[], string>({
      query: (parentId) => ({
        url: `/restaurants/branches/parent/${parentId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ['BRANCHES'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to fetch branches", {
            position: "top-right",
          });
          throw err;
        }
      }
    }),

    getBranchById: builder.query<Branch, string>({
      query: (branchId) => ({
        url: `/restaurants/branches/${branchId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (_result, _error, branchId) => [{ type: 'BRANCHES', id: branchId }],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to fetch branch details", {
            position: "top-right",
          });
          throw err;
        }
      }
    }),

    createBranch: builder.mutation<Branch, CreateBranchRequest>({
      query: (data) => ({
        url: "/restaurants/branches",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ['BRANCHES'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Branch created successfully", {
            position: "top-right",
          });
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to create branch", {
            position: "top-right",
          });
          throw err;
        }
      }
    }),

    updateBranch: builder.mutation<Branch, { id: string; data: Partial<CreateBranchRequest> }>({
      query: ({ id, data }) => ({
        url: `/restaurants/branches/${id}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ['BRANCHES'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success("Branch updated successfully", {
            position: "top-right",
          });
          return data;
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to update branch", {
            position: "top-right",
          });
          throw err;
        }
      }
    }),

    deleteBranch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/restaurants/branches/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ['BRANCHES'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success("Branch deleted successfully", {
            position: "top-right",
          });
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || "Failed to delete branch", {
            position: "top-right",
          });
          throw err;
        }
      }
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = branchesApi;
