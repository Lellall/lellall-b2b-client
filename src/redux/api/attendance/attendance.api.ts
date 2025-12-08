import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

// Types
export interface AttendanceRecordRequest {
  userId: string;
  departmentId?: string;
  branchId?: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // ISO 8601
  checkOutTime?: string; // ISO 8601
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME' | 'EARLY_LEAVE' | 'HALF_DAY' | 'LEAVE';
  notes?: string;
}

export interface AttendanceStatusUpdateRequest {
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME' | 'EARLY_LEAVE' | 'HALF_DAY' | 'LEAVE';
  notes?: string;
}

export interface RecordCheckInOutRequest {
  userId: string;
  date: string; // YYYY-MM-DD format
  action: 'CHECK_IN' | 'CHECK_OUT';
  departmentId?: string; // Optional
  branchId?: string; // Optional
  time?: string; // Optional - ISO 8601 format, defaults to now
  notes?: string; // Optional notes for check-in/out
}

export interface RecordCheckInOutResponse {
  attendance: {
    id: string;
    status: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    isLate: boolean;
    lateMinutes: number | null;
  };
  action: 'CHECK_IN' | 'CHECK_OUT';
  message: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  departmentId?: string;
  branchId?: string | null;
  date: string;
  formattedDate?: string;
  shiftTime?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME' | 'EARLY_LEAVE' | 'HALF_DAY' | 'LEAVE' | null;
  isLate?: boolean;
  lateMinutes?: number | null;
  notes?: string | null;
  employeeId?: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
    role: string;
  };
  department?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  } | null;
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export interface AttendanceListParams {
  restaurantId: string;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  departmentId?: string;
  branchId?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME' | 'EARLY_LEAVE' | 'HALF_DAY' | 'LEAVE';
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  address?: string;
  restaurantId: string;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  restaurant: {
    id: string;
    name: string;
    subdomain: string;
  };
  employeeId: string; // e.g., "#001"
  isFromBranch: boolean;
  branchName: string;
  attendance?: AttendanceRecord | null; // Attendance record for the selected date (if provided)
}

export interface StaffMemberWithAttendance {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: string;
  shiftTime?: string; // ⭐ NEW - automatically provided by backend
  departmentId?: string | null;
  restaurantId?: string;
  hasAttendance: boolean;
  isCheckedIn: boolean;
  attendanceStatus: 'NOT_RECORDED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'RECORDED';
  attendance: {
    id: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME' | 'EARLY_LEAVE' | 'HALF_DAY' | 'LEAVE';
    checkInTime?: string;
    checkOutTime?: string;
    isLate?: boolean;
    lateMinutes?: number | null;
    notes?: string | null;
    recordedAt?: string;
    recordedBy?: {
      id: string;
      name: string;
    };
    isCheckedIn: boolean;
    isCheckedOut: boolean;
    hasCheckIn: boolean;
    hasCheckOut: boolean;
  } | null;
}

export interface StaffListResponse {
  parentRestaurant: {
    id: string;
    name: string;
    subdomain: string;
  };
  branches: Array<{
    id: string;
    name: string;
    subdomain: string;
  }>;
  staff: StaffMember[];
  totalStaff: number;
  parentStaffCount: number;
  branchStaffCount: number;
}

export interface StaffWithAttendanceResponse {
  date: string;
  parentRestaurant: {
    id: string;
    name: string;
    subdomain: string;
  };
  branches: Array<{
    id: string;
    name: string;
    subdomain: string;
  }>;
  staff: StaffMemberWithAttendance[];
  summary: {
    totalStaff: number;
    withAttendance: number;
    withoutAttendance: number;
  };
}

// Individual staff attendance history
export interface StaffAttendanceHistoryRecord {
  id: string;
  date: string;
  formattedDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'ON_TIME' | 'EARLY_LEAVE' | 'HALF_DAY' | 'LEAVE';
  isLate: boolean;
  lateMinutes: number | null;
  notes: string | null;
  recordedAt: string;
  recordedBy: {
    id: string;
    name: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  branch: {
    id: string;
    name: string;
  } | null;
}

export interface StaffAttendanceStatistics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  lateDays: number;
  halfDays: number;
  attendanceRate: string; // e.g. "33.33"
}

export interface StaffAttendanceHistoryResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  attendances: StaffAttendanceHistoryRecord[];
  statistics: StaffAttendanceStatistics;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

// Staff leave history
export interface StaffLeaveRecord {
  id: string;
  date: string;
  formattedDate: string;
  notes: string | null;
  recordedAt: string;
  recordedBy: {
    id: string;
    name: string;
  } | null;
  department: {
    id: string;
    name: string;
  } | null;
  branch: {
    id: string;
    name: string;
  } | null;
}

export interface StaffLeaveStatistics {
  totalLeaveDays: number;
  currentMonthLeaves: number;
}

export interface StaffLeaveHistoryResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  leaves: StaffLeaveRecord[];
  statistics: StaffLeaveStatistics;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all staff from parent restaurant and branches (for attendance taking)
    getStaffForAttendance: builder.query<StaffListResponse, { parentRestaurantId: string; date?: string; branchId?: string }>({
      query: ({ parentRestaurantId, date, branchId }) => {
        const queryParams: Record<string, string> = {};
        if (date) queryParams.date = date;
        if (branchId) queryParams.branchId = branchId;

        const queryString = new URLSearchParams(queryParams).toString();
        return {
          url: `/attendance/staff/${parentRestaurantId}/all${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch staff for attendance:', err);
        }
      },
    }),

    // Get staff with attendance status for a specific date (main endpoint for attendance UI)
    getStaffWithAttendanceStatus: builder.query<StaffWithAttendanceResponse, { parentRestaurantId: string; date: string }>({
      query: ({ parentRestaurantId, date }) => ({
        url: `/attendance/staff/${parentRestaurantId}/status/${date}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: (_result, _error, { date }) => [
        { type: 'ATTENDANCE', id: `STAFF_STATUS_${date}` },
        'ATTENDANCE',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch staff with attendance status:', err);
        }
      },
    }),

    // Get attendance list (kept for backward compatibility if needed)
    getAttendanceList: builder.query<AttendanceListResponse, AttendanceListParams>({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params.page) queryParams.page = params.page.toString();
        if (params.limit) queryParams.limit = params.limit.toString();
        if (params.search) queryParams.search = params.search;
        if (params.startDate) queryParams.startDate = params.startDate;
        if (params.endDate) queryParams.endDate = params.endDate;
        if (params.departmentId) queryParams.departmentId = params.departmentId;
        if (params.branchId) queryParams.branchId = params.branchId;
        if (params.status) queryParams.status = params.status;

        const queryString = new URLSearchParams(queryParams).toString();
        return {
          url: `/attendance/list/${params.restaurantId}${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch attendance list:', err);
        }
      },
    }),

    // Get individual staff attendance history with statistics
    getStaffAttendanceByUserId: builder.query<
      StaffAttendanceHistoryResponse,
      { userId: string; startDate?: string; endDate?: string }
    >({
      query: ({ userId, startDate, endDate }) => {
        const queryParams: Record<string, string> = {};
        if (startDate) queryParams.startDate = startDate;
        if (endDate) queryParams.endDate = endDate;

        const queryString = new URLSearchParams(queryParams).toString();

        return {
          url: `/attendance/staff/${userId}/attendance${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch staff attendance history:', err);
        }
      },
    }),

    // Get staff leave records
    getStaffLeavesByUserId: builder.query<
      StaffLeaveHistoryResponse,
      { userId: string; startDate?: string; endDate?: string }
    >({
      query: ({ userId, startDate, endDate }) => {
        const queryParams: Record<string, string> = {};
        if (startDate) queryParams.startDate = startDate;
        if (endDate) queryParams.endDate = endDate;

        const queryString = new URLSearchParams(queryParams).toString();

        return {
          url: `/attendance/staff/${userId}/leaves${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: (_result, _error, { userId }) => [
        { type: 'ATTENDANCE', id: `STAFF_LEAVES_${userId}` },
        'ATTENDANCE',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch staff leave history:', err);
        }
      },
    }),

    // Record attendance
    recordAttendance: builder.mutation<AttendanceRecord, AttendanceRecordRequest>({
      query: (data) => ({
        url: '/attendance/record',
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Attendance recorded successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to record attendance');
          throw err;
        }
      },
    }),

    // Update attendance status
    updateAttendanceStatus: builder.mutation<AttendanceRecord, { attendanceId: string; data: AttendanceStatusUpdateRequest }>({
      query: ({ attendanceId, data }) => ({
        url: `/attendance/${attendanceId}/status`,
        method: 'PATCH',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Attendance status updated successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to update attendance status');
          throw err;
        }
      },
    }),

    // Record check-in/check-out
    recordCheckInOut: builder.mutation<RecordCheckInOutResponse, RecordCheckInOutRequest>({
      query: (data) => ({
        url: '/attendance/check-in-out',
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['ATTENDANCE'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          const action = _args.action === 'CHECK_IN' ? 'checked in' : 'checked out';
          toast.success(`Successfully ${action}`);
        } catch (err: any) {
          ErrorHandler(err);
          const action = _args.action === 'CHECK_IN' ? 'check in' : 'check out';
          toast.error(err?.error?.data?.message || `Failed to ${action}`);
          throw err;
        }
      },
    }),
  }),
});

// Salary Types
export interface CreateSalaryRequest {
  userId: string;
  departmentId?: string;
  branchId?: string;
  baseSalary: number;
  month: number; // 1-12
  year: number;
}

export interface AddDeductionRequest {
  salaryId: string;
  attendanceId?: string;
  type: 'ABSENCE' | 'LATE_ARRIVAL' | 'HALF_DAY' | 'OTHER';
  amount: number;
  reason: string;
  description?: string;
}

export interface Deduction {
  id: string;
  type: 'ABSENCE' | 'LATE_ARRIVAL' | 'HALF_DAY' | 'OTHER';
  amount: number;
  reason: string;
  description?: string;
  attendance?: {
    id: string;
    date: string;
    status: string;
  };
}

export interface Salary {
  id: string;
  userId: string;
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  month: number;
  year: number;
  deductions?: Deduction[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    employeeId?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export interface GetSalariesParams {
  restaurantId: string;
  month?: number;
  year?: number;
  userId?: string;
}

export interface GetSalariesResponse {
  data: Salary[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateSalaryRequest {
  baseSalary?: number;
}

export interface SalaryWithPayroll extends Salary {
  payroll?: {
    id: string;
    status: string;
    paymentDate?: string;
    paymentMethod?: string;
    paymentReference?: string;
    processedBy?: {
      id: string;
      name: string;
    };
  };
}

export const {
  useGetStaffForAttendanceQuery,
  useGetStaffWithAttendanceStatusQuery,
  useGetAttendanceListQuery,
  useGetStaffAttendanceByUserIdQuery,
  useGetStaffLeavesByUserIdQuery,
  useRecordAttendanceMutation,
  useUpdateAttendanceStatusMutation,
  useRecordCheckInOutMutation,
} = attendanceApi;

// Salary API Endpoints - Added to attendanceApi
export const salaryEndpoints = attendanceApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create Salary
    createSalary: builder.mutation<Salary, CreateSalaryRequest>({
      query: (data) => ({
        url: 'attendance/salary',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ATTENDANCE', 'PAYROLL'],
    }),

    // Add Manual Deduction
    addDeduction: builder.mutation<Salary, AddDeductionRequest>({
      query: (data) => ({
        url: 'attendance/salary/deduction',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ATTENDANCE', 'PAYROLL'],
    }),

    // Get Salaries
    getSalaries: builder.query<GetSalariesResponse, GetSalariesParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.month) searchParams.append('month', params.month.toString());
        if (params.year) searchParams.append('year', params.year.toString());
        if (params.userId) searchParams.append('userId', params.userId);

        return {
          url: `attendance/salary/${params.restaurantId}?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['ATTENDANCE', 'PAYROLL'],
    }),

    // Get Salary by ID
    getSalaryById: builder.query<SalaryWithPayroll, string>({
      query: (salaryId) => ({
        url: `attendance/salary/id/${salaryId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, salaryId) => [{ type: 'ATTENDANCE', id: `SALARY_${salaryId}` }, 'PAYROLL'],
    }),

    // Update Salary
    updateSalary: builder.mutation<Salary, { salaryId: string; data: UpdateSalaryRequest }>({
      query: ({ salaryId, data }) => ({
        url: `attendance/salary/${salaryId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { salaryId }) => [
        { type: 'ATTENDANCE', id: `SALARY_${salaryId}` },
        'ATTENDANCE',
        'PAYROLL',
      ],
    }),

    // Recalculate Salary Deductions
    recalculateSalary: builder.mutation<Salary, string>({
      query: (salaryId) => ({
        url: `attendance/salary/${salaryId}/recalculate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, salaryId) => [
        { type: 'ATTENDANCE', id: `SALARY_${salaryId}` },
        'ATTENDANCE',
        'PAYROLL',
      ],
    }),

    // Delete Salary
    deleteSalary: builder.mutation<{ message: string }, string>({
      query: (salaryId) => ({
        url: `attendance/salary/${salaryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ATTENDANCE', 'PAYROLL'],
    }),
  }),
});

export const {
  useCreateSalaryMutation,
  useAddDeductionMutation,
  useGetSalariesQuery,
  useGetSalaryByIdQuery,
  useUpdateSalaryMutation,
  useRecalculateSalaryMutation,
  useDeleteSalaryMutation,
} = salaryEndpoints;

