import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

// Types
export interface LeaveRequest {
  id: string;
  userId: string;
  employeeName: string;
  employeeId: string;
  employeeEmail: string;
  employeeRole: string;
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: {
    id: string;
    name: string;
  } | null;
  rejectionReason?: string | null;
  department?: string | null;
}

export interface LeaveRequestListResponse {
  data: LeaveRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLeaveRequestRequest {
  leaveType: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
}

export interface CreateLeaveRequestResponse {
  id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'PENDING';
  submittedAt: string;
}

export interface ApproveLeaveRequestResponse {
  id: string;
  status: 'APPROVED';
  reviewedAt: string;
  reviewedBy: {
    id: string;
    name: string;
  };
}

export interface RejectLeaveRequestRequest {
  rejectionReason: string;
}

export interface RejectLeaveRequestResponse {
  id: string;
  status: 'REJECTED';
  rejectionReason: string;
  reviewedAt: string;
  reviewedBy: {
    id: string;
    name: string;
  };
}

export interface GetLeaveRequestsParams {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  leaveType?: 'SICK' | 'VACATION' | 'PERSONAL' | 'EMERGENCY' | 'MATERNITY' | 'PATERNITY' | 'OTHER';
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get leave requests
    getLeaveRequests: builder.query<LeaveRequestListResponse, GetLeaveRequestsParams>({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params.status) queryParams.status = params.status;
        if (params.leaveType) queryParams.leaveType = params.leaveType;
        if (params.startDate) queryParams.startDate = params.startDate;
        if (params.endDate) queryParams.endDate = params.endDate;
        if (params.page) queryParams.page = params.page.toString();
        if (params.limit) queryParams.limit = params.limit.toString();

        const queryString = new URLSearchParams(queryParams).toString();
        return {
          url: `/attendance/leave/requests${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['LEAVE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch leave requests:', err);
        }
      },
    }),

    // Submit leave request
    createLeaveRequest: builder.mutation<CreateLeaveRequestResponse, CreateLeaveRequestRequest>({
      query: (data) => ({
        url: '/attendance/leave/requests',
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['LEAVE', 'ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Leave request submitted successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to submit leave request');
          throw err;
        }
      },
    }),

    // Approve leave request
    approveLeaveRequest: builder.mutation<ApproveLeaveRequestResponse, string>({
      query: (leaveRequestId) => ({
        url: `/attendance/leave/requests/${leaveRequestId}/approve`,
        method: 'PATCH',
        credentials: 'include',
      }),
      invalidatesTags: ['LEAVE', 'ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Leave request approved successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to approve leave request');
          throw err;
        }
      },
    }),

    // Reject leave request
    rejectLeaveRequest: builder.mutation<RejectLeaveRequestResponse, { leaveRequestId: string; data: RejectLeaveRequestRequest }>({
      query: ({ leaveRequestId, data }) => ({
        url: `/attendance/leave/requests/${leaveRequestId}/reject`,
        method: 'PATCH',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['LEAVE', 'ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Leave request rejected');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to reject leave request');
          throw err;
        }
      },
    }),
  }),
});

export const {
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveApi;



