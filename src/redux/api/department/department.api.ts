import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

// Types
export interface Department {
  id: string;
  name: string;
  description?: string | null;
  restaurantId: string;
  branchId?: string | null;
  restaurant: {
    id: string;
    name: string;
    subdomain: string;
  };
  branch?: {
    id: string;
    name: string;
    subdomain: string;
  } | null;
  _count?: {
    staff: number;
    attendances: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  restaurantId: string;
  branchId?: string;
  description?: string;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
}

export interface LinkStaffToDepartmentRequest {
  userId: string;
  departmentId: string;
}

export interface LinkStaffToDepartmentResponse {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    restaurantId: string;
    departmentId: string;
    department: {
      id: string;
      name: string;
      description?: string | null;
    };
    restaurant: {
      id: string;
      name: string;
      subdomain: string;
    };
  };
}

export const departmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create department
    createDepartment: builder.mutation<Department, CreateDepartmentRequest>({
      query: (data) => ({
        url: '/attendance/departments',
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['DEPARTMENT'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Department created successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to create department');
          throw err;
        }
      },
    }),

    // Get all departments
    getDepartments: builder.query<Department[], { restaurantId: string; branchId?: string }>({
      query: ({ restaurantId, branchId }) => {
        const queryParams: Record<string, string> = {};
        if (branchId) queryParams.branchId = branchId;

        const queryString = new URLSearchParams(queryParams).toString();
        return {
          url: `/attendance/departments/${restaurantId}${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['DEPARTMENT'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch departments:', err);
        }
      },
    }),

    // Update department
    updateDepartment: builder.mutation<Department, { departmentId: string; data: UpdateDepartmentRequest }>({
      query: ({ departmentId, data }) => ({
        url: `/attendance/departments/${departmentId}`,
        method: 'PATCH',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { departmentId }) => [
        { type: 'DEPARTMENT', id: departmentId },
        'DEPARTMENT',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Department updated successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to update department');
          throw err;
        }
      },
    }),

    // Delete department
    deleteDepartment: builder.mutation<Department, string>({
      query: (departmentId) => ({
        url: `/attendance/departments/${departmentId}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['DEPARTMENT'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Department deleted successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to delete department');
          throw err;
        }
      },
    }),

    // Link staff to department
    linkStaffToDepartment: builder.mutation<LinkStaffToDepartmentResponse, LinkStaffToDepartmentRequest>({
      query: (data) => ({
        url: '/attendance/staff/link-department',
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['DEPARTMENT', 'ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Staff member linked to department successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to link staff to department');
          throw err;
        }
      },
    }),
  }),
});

export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useLinkStaffToDepartmentMutation,
} = departmentApi;

