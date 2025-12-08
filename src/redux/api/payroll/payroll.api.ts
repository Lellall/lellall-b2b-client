import { baseApi } from '../baseApi';

// Types
export interface ProcessPayrollRequest {
  salaryId: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  notes?: string;
}

export interface BulkProcessPayrollRequest {
  salaryIds: string[];
  paymentMethod?: string;
  notes?: string;
}

export interface UpdatePayrollStatusRequest {
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
}

export interface GetPayrollListParams {
  startDate?: string;
  endDate?: string;
  status?: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  month?: number;
  year?: number;
  restaurantId?: string;
  departmentId?: string;
  userIds?: string[];
  page?: number;
  limit?: number;
}

export interface GetPayrollStatsParams {
  restaurantId?: string;
  month?: number;
  year?: number;
}

export interface GetEmployeesParams {
  restaurantId?: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  employeeId: string;
  employeeType?: string;
  designation?: string;
  monthlySalary?: number;
  annualSalary?: number;
  joiningDate?: string;
  profilePicture?: string;
  restaurant?: {
    id: string;
    name: string;
    subdomain: string;
  };
  department?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Deduction {
  id: string;
  type: string;
  amount: number;
  reason?: string;
  description?: string;
}

export interface Salary {
  id: string;
  userId: string;
  employee: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
    phoneNumber?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  baseSalary: number;
  grossSalary: number;
  netSalary: number;
  month: number;
  year: number;
  deductions?: Deduction[];
}

export interface PayrollRecord {
  id: string;
  salaryId: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  paymentDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  processedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
  };
  salary: Salary;
}

export interface ProcessPayrollResponse extends PayrollRecord {}

export interface BulkProcessPayrollResponse {
  success: number;
  failed: number;
  results: PayrollRecord[];
}

export interface GetPayrollListResponse {
  data: PayrollRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PayrollStats {
  total: number;
  paid: number;
  pending: number;
  processing: number;
  failed: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
}

export interface GetEmployeesResponse {
  data: Employee[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SalaryWithPayrollStatus extends Salary {
  payrollStatus: 'UNPAID' | 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  payroll?: PayrollRecord | null;
}

export interface GetSalariesWithPayrollParams {
  restaurantId?: string;
  departmentId?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

export interface GetSalariesWithPayrollResponse {
  data: SalaryWithPayrollStatus[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Endpoints
export const payrollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Process Payroll Payment
    processPayroll: builder.mutation<ProcessPayrollResponse, ProcessPayrollRequest>({
      query: (data) => ({
        url: 'payroll/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PAYROLL'],
    }),

    // Bulk Process Payroll
    bulkProcessPayroll: builder.mutation<BulkProcessPayrollResponse, BulkProcessPayrollRequest>({
      query: (data) => ({
        url: 'payroll/bulk-process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PAYROLL'],
    }),

    // Update Payroll Status
    updatePayrollStatus: builder.mutation<PayrollRecord, { payrollId: string; data: UpdatePayrollStatusRequest }>({
      query: ({ payrollId, data }) => ({
        url: `payroll/${payrollId}/status`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['PAYROLL'],
    }),

    // Get Payroll List
    getPayrollList: builder.query<GetPayrollListResponse, GetPayrollListParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.status) searchParams.append('status', params.status);
        if (params.month) searchParams.append('month', params.month.toString());
        if (params.year) searchParams.append('year', params.year.toString());
        if (params.restaurantId) searchParams.append('restaurantId', params.restaurantId);
        if (params.departmentId) searchParams.append('departmentId', params.departmentId);
        if (params.userIds && params.userIds.length > 0) {
          params.userIds.forEach(id => searchParams.append('userIds', id));
        }
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return {
          url: `payroll?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['PAYROLL'],
    }),

    // Get Payroll Statistics
    getPayrollStats: builder.query<PayrollStats, GetPayrollStatsParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.restaurantId) searchParams.append('restaurantId', params.restaurantId);
        if (params.month) searchParams.append('month', params.month.toString());
        if (params.year) searchParams.append('year', params.year.toString());

        return {
          url: `payroll/stats?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['PAYROLL'],
    }),

    // Get Payroll by ID
    getPayrollById: builder.query<PayrollRecord, string>({
      query: (payrollId) => ({
        url: `payroll/${payrollId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, payrollId) => [{ type: 'PAYROLL', id: payrollId }],
    }),

    // Get All Employees
    getAllEmployees: builder.query<GetEmployeesResponse, GetEmployeesParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.restaurantId) searchParams.append('restaurantId', params.restaurantId);
        if (params.departmentId) searchParams.append('departmentId', params.departmentId);
        if (params.search) searchParams.append('search', params.search);
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return {
          url: `payroll/employees/all?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['PAYROLL'],
    }),

    // Get Salaries with Payroll Status
    getSalariesWithPayroll: builder.query<GetSalariesWithPayrollResponse, GetSalariesWithPayrollParams>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params.restaurantId) searchParams.append('restaurantId', params.restaurantId);
        if (params.departmentId) searchParams.append('departmentId', params.departmentId);
        if (params.month) searchParams.append('month', params.month.toString());
        if (params.year) searchParams.append('year', params.year.toString());
        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());

        return {
          url: `payroll/salaries?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['PAYROLL'],
    }),
  }),
});

export const {
  useProcessPayrollMutation,
  useBulkProcessPayrollMutation,
  useUpdatePayrollStatusMutation,
  useGetPayrollListQuery,
  useGetPayrollStatsQuery,
  useGetPayrollByIdQuery,
  useGetAllEmployeesQuery,
  useGetSalariesWithPayrollQuery,
} = payrollApi;

