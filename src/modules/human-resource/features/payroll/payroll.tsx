import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Search, Download, Filter, FileText, Users, TrendingUp, CheckCircle2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ColorRing } from 'react-loader-spinner';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { usePermissions } from '@/hooks/usePermissions';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import { 
  useGetPayrollListQuery, 
  useGetPayrollStatsQuery,
  useGetSalariesWithPayrollQuery,
  useProcessPayrollMutation,
  useBulkProcessPayrollMutation,
  useUpdatePayrollStatusMutation,
  PayrollRecord
} from '@/redux/api/payroll/payroll.api';
import { useGetSalariesQuery } from '@/redux/api/attendance/attendance.api';
import { toast } from 'react-toastify';
import PayrollDetailsModal from './payroll-details-modal';
import ProcessPayrollModal from './process-payroll-modal';
import UpdateStatusModal from './update-status-modal';

const Payroll: React.FC = () => {
  const { canUpdate } = usePermissions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'PROCESSING' | 'FAILED' | 'CANCELLED'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [payPeriodFilter, setPayPeriodFilter] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayrollItem, setSelectedPayrollItem] = useState<PayrollRecord | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [viewMode, setViewMode] = useState<'payrolls' | 'salaries'>('salaries'); // 'salaries' shows all, 'payrolls' shows only processed

  // Parse month and year from payPeriodFilter (YYYY-MM format)
  const [year, month] = payPeriodFilter.split('-').map(Number);

  // Get restaurant ID
  const { subdomain } = useSelector(selectAuth);
  const { data: restaurant } = useGetRestaurantBySubdomainQuery(subdomain || '', { skip: !subdomain });
  const restaurantId = restaurant?.id || restaurant?.parentId;

  // API Queries - Use salaries with payroll status to see all (paid and unpaid)
  const { 
    data: salariesData, 
    isLoading: isLoadingSalaries, 
    refetch: refetchSalaries,
    error: salariesError,
    isError: isSalariesError
  } = useGetSalariesWithPayrollQuery(
    {
      restaurantId: restaurantId || '',
      month,
      year,
      page: currentPage,
      limit: recordsPerPage,
    },
    { skip: !restaurantId || viewMode === 'payrolls' }
  );

  // Fallback: Use existing salary endpoint if new endpoint is not available (404)
  const is404Error = isSalariesError && (salariesError as any)?.status === 404;
  const { 
    data: fallbackSalariesData
  } = useGetSalariesQuery(
    {
      restaurantId: restaurantId || '',
      month,
      year,
    },
    { skip: !restaurantId || viewMode === 'payrolls' || !is404Error }
  );

  // Also keep payroll list query for processed-only view
  const { data: payrollData, isLoading: isLoadingPayroll, refetch: refetchPayroll } = useGetPayrollListQuery({
    month,
    year,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    departmentId: departmentFilter !== 'ALL' ? departmentFilter : undefined,
    page: currentPage,
    limit: recordsPerPage,
  }, { skip: viewMode === 'salaries' });

  const { data: statsData } = useGetPayrollStatsQuery({
    month,
    year,
  });

  const [processPayroll, { isLoading: isProcessing }] = useProcessPayrollMutation();
  const [bulkProcessPayroll, { isLoading: isBulkProcessing }] = useBulkProcessPayrollMutation();
  const [updatePayrollStatus, { isLoading: isUpdatingStatus }] = useUpdatePayrollStatusMutation();

  // Get data based on view mode
  // Use fallback if new endpoint returns 404
  const salaries = is404Error && fallbackSalariesData
    ? (fallbackSalariesData.data || []).map(salary => {
        // Map fallback salary structure to SalaryWithPayrollStatus format
        const payrollStatus = (salary as any).payroll ? ((salary as any).payroll.status as any) : 'UNPAID' as const;
        return {
          ...salary,
          payrollStatus,
          payroll: (salary as any).payroll || null,
          employee: (salary as any).user ? {
            id: (salary as any).user.id,
            name: `${(salary as any).user.firstName || ''} ${(salary as any).user.lastName || ''}`.trim(),
            email: (salary as any).user.email || '',
            employeeId: (salary as any).user.employeeId || '',
            phoneNumber: (salary as any).user.phoneNumber || '',
          } : undefined,
        };
      })
    : (salariesData?.data || []);
  const payrollItems = payrollData?.data || [];
  const pagination = viewMode === 'salaries' 
    ? (is404Error && fallbackSalariesData
        ? { page: 1, limit: 100, total: fallbackSalariesData.data?.length || 0, totalPages: 1 }
        : salariesData?.pagination)
    : payrollData?.pagination;

  // Convert salaries to a format compatible with the table
  const allItems = useMemo(() => {
    if (viewMode === 'salaries') {
      return salaries.map((salary: any) => {
        const employee = salary.employee || (salary.user ? {
          id: salary.user.id,
          name: `${salary.user.firstName || ''} ${salary.user.lastName || ''}`.trim(),
          email: salary.user.email || '',
          employeeId: salary.user.employeeId || '',
          phoneNumber: salary.user.phoneNumber || '',
        } : { id: '', name: 'Unknown', email: '', employeeId: '', phoneNumber: '' });

        return {
          id: salary.payroll?.id || salary.id, // Use payroll ID if exists, else salary ID
          salaryId: salary.id,
          status: salary.payrollStatus,
          paymentDate: salary.payroll?.paymentDate,
          paymentMethod: salary.payroll?.paymentMethod,
          paymentReference: salary.payroll?.paymentReference,
          notes: salary.payroll?.notes,
          processedBy: salary.payroll?.processedBy,
          salary: {
            id: salary.id,
            userId: salary.userId,
            employee: {
              id: employee.id,
              name: employee.name,
              email: employee.email,
              employeeId: employee.employeeId,
              phoneNumber: employee.phoneNumber,
            },
            department: salary.department,
            branch: salary.branch,
            baseSalary: salary.baseSalary,
            grossSalary: salary.grossSalary,
            netSalary: salary.netSalary,
            month: salary.month,
            year: salary.year,
            deductions: salary.deductions,
          },
          payroll: salary.payroll,
          isUnpaid: salary.payrollStatus === 'UNPAID',
        } as any;
      });
    } else {
      return payrollItems as any[];
    }
  }, [salaries, payrollItems, viewMode]);

  // Filter items by search term and status (client-side filtering)
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    // Apply search filter
    if (searchTerm) {
      items = items.filter((item) => {
        const employeeName = item.salary.employee.name || '';
        const employeeId = item.salary.employee.employeeId || '';
        const department = item.salary.department?.name || '';
        
        return (
          employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Apply status filter (for salaries view, filter by payrollStatus)
    if (statusFilter !== 'ALL') {
      if (viewMode === 'salaries') {
        items = items.filter((item) => {
          if (statusFilter === 'PENDING') {
            return item.status === 'PENDING' || item.status === 'UNPAID';
          }
          return item.status === statusFilter;
        });
      } else {
        items = items.filter((item) => item.status === statusFilter);
      }
    }

    // Apply department filter
    if (departmentFilter !== 'ALL') {
      items = items.filter((item) => item.salary.department?.name === departmentFilter);
    }

    return items;
  }, [allItems, searchTerm, statusFilter, departmentFilter, viewMode]);

  // Get unique departments for filter
  const departments = useMemo(() => {
    const deptSet = new Set(
      allItems
        .map((item) => item.salary.department?.name)
        .filter((dept): dept is string => !!dept)
    );
    return Array.from(deptSet).sort();
  }, [allItems]);

  // Calculate summary from API data
  const summary = useMemo(() => {
    const items = filteredItems;
    const totalDeductions = items.reduce((sum: number, item: any) => {
      return sum + (item.salary.deductions?.reduce((dSum: number, d: any) => dSum + d.amount, 0) || 0);
    }, 0);

    return {
      totalEmployees: statsData?.total || items.length,
      totalGrossSalary: statsData?.totalPaidAmount || items.reduce((sum, item) => sum + item.salary.grossSalary, 0),
      totalAllowances: 0, // Not directly available in API response
      totalDeductions,
      totalOvertime: 0, // Not directly available in API response
      totalBonuses: 0, // Not directly available in API response
      totalNetSalary: statsData?.totalPaidAmount || items.reduce((sum, item) => sum + item.salary.netSalary, 0),
      paidCount: statsData?.paid || items.filter((item) => item.status === 'PAID').length,
      pendingCount: statsData?.pending || items.filter((item) => item.status === 'PENDING').length,
      processingCount: statsData?.processing || items.filter((item) => item.status === 'PROCESSING').length,
    };
  }, [filteredItems, statsData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case 'UNPAID':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
            Unpaid
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Failed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleExport = () => {
    try {
      // Prepare CSV data
      const headers = [
        'Employee Name',
        'Employee ID',
        'Department',
        'Base Salary',
        'Deductions',
        'Net Salary',
        'Status',
        'Payment Date',
        'Payment Method',
        'Payment Reference'
      ];

      const rows = filteredItems.map((item: any) => {
        const totalDeductions = item.salary.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0;
        return [
          item.salary.employee.name || 'N/A',
          item.salary.employee.employeeId || 'N/A',
          item.salary.department?.name || 'N/A',
          item.salary.baseSalary || 0,
          totalDeductions,
          item.salary.netSalary || 0,
          item.status || 'N/A',
          item.paymentDate ? format(new Date(item.paymentDate), 'yyyy-MM-dd') : 'N/A',
          item.paymentMethod || 'N/A',
          item.paymentReference || 'N/A'
        ];
      });

      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          // Escape commas and quotes in cell values
          const cellValue = String(cell || '');
          if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
            return `"${cellValue.replace(/"/g, '""')}"`;
          }
          return cellValue;
        }).join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Payroll data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export payroll data');
    }
  };

  const handleProcessPayroll = async (paymentMethod: string = 'BANK_TRANSFER', paymentReference?: string, paymentDate?: string) => {
    if (selectedItems.size === 0) return;

    try {
      // Get salary IDs from selected items
      const salaryIds = Array.from(selectedItems).map((itemId) => {
        const item = allItems.find((p) => p.id === itemId || p.salaryId === itemId);
        // If it's an unpaid salary, use salaryId directly
        if ((item as any)?.isUnpaid) {
          return (item as any).salaryId;
        }
        // If it's a payroll record, get the salaryId from the payroll
        return item?.salaryId || '';
      }).filter(Boolean);

      if (salaryIds.length === 0) {
        toast.error('No valid salary IDs found');
        return;
      }

      if (salaryIds.length === 1) {
        await processPayroll({
          salaryId: salaryIds[0],
          paymentMethod,
          paymentReference,
          paymentDate,
        }).unwrap();
        toast.success('Payroll processed successfully');
      } else {
        await bulkProcessPayroll({
          salaryIds,
          paymentMethod,
        }).unwrap();
        toast.success(`Successfully processed ${salaryIds.length} payroll records`);
      }

      setSelectedItems(new Set());
      setShowProcessModal(false);
      if (viewMode === 'salaries') {
        refetchSalaries();
      } else {
        refetchPayroll();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to process payroll');
    }
  };

  const handleUpdateStatus = async (status: string, notes?: string, paymentReference?: string) => {
    if (!selectedPayrollItem || !selectedPayrollItem.id) return;

    try {
      await updatePayrollStatus({
        payrollId: selectedPayrollItem.id,
        data: {
          status: status as any,
          notes,
          paymentReference,
        },
      }).unwrap();
      toast.success('Payroll status updated successfully');
      setShowUpdateStatusModal(false);
      setSelectedPayrollItem(null);
      if (viewMode === 'salaries') {
        refetchSalaries();
      } else {
        refetchPayroll();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update payroll status');
    }
  };

  const handleRecordsPerPageChange = (value: number) => {
    setRecordsPerPage(value);
    setCurrentPage(1);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, departmentFilter, payPeriodFilter]);

  // Update pagination when API data changes
  useEffect(() => {
    if (pagination && currentPage > pagination.totalPages) {
      setCurrentPage(1);
    }
  }, [pagination, currentPage]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-800">Payroll Management</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 flex-shrink-0">
              <button
                onClick={() => {
                  setViewMode('salaries');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'salaries'
                    ? 'bg-white text-[#05431E] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Salaries
              </button>
              <button
                onClick={() => {
                  setViewMode('payrolls');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  viewMode === 'payrolls'
                    ? 'bg-white text-[#05431E] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Processed Only
              </button>
            </div>
            {selectedItems.size > 0 && canUpdate && (
              <button
                onClick={() => setShowProcessModal(true)}
                disabled={isProcessing || isBulkProcessing}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isProcessing || isBulkProcessing ? 'Processing...' : `Process Selected (${selectedItems.size})`}</span>
                <span className="sm:hidden">{isProcessing || isBulkProcessing ? 'Processing...' : `Process (${selectedItems.size})`}</span>
              </button>
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Employees</div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{summary.totalEmployees}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Gross Salary</div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalGrossSalary)}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Net Salary</div>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-[#05431E]">{formatCurrency(summary.totalNetSalary)}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Paid Employees</div>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-semibold text-green-600">{summary.paidCount}</div>
          <div className="text-xs text-gray-500 mt-1">
            {summary.pendingCount} Pending, {summary.processingCount} Processing
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">Total Allowances</div>
          <div className="text-xl font-semibold text-gray-900">{formatCurrency(summary.totalAllowances)}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">Total Deductions</div>
          <div className="text-xl font-semibold text-red-600">{formatCurrency(summary.totalDeductions)}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-2">Total Overtime & Bonuses</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatCurrency(summary.totalOvertime + summary.totalBonuses)}
          </div>
        </div>
      </div>

      {/* Top Control Bar */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <div className="relative flex-shrink-0">
              <input
                type="month"
                value={payPeriodFilter}
                onChange={(e) => setPayPeriodFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer w-full"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer appearance-none bg-white w-full"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative flex-shrink-0">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer appearance-none bg-white w-full"
              >
                <option value="ALL">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#05431E] border-gray-300 rounded focus:ring-[#05431E]"
                  />
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Employee</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Department</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Base Salary</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 hidden lg:table-cell">Allowances</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Deductions</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 hidden lg:table-cell">Overtime</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700 hidden lg:table-cell">Bonuses</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Net Salary</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(isLoadingPayroll || isLoadingSalaries) ? (
                <tr>
                  <td colSpan={11} className="px-3 py-12 text-center">
                    <ColorRing
                      visible={true}
                      height="40"
                      width="40"
                      ariaLabel="loading"
                      wrapperStyle={{ margin: '0 auto' }}
                    />
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'ALL' || departmentFilter !== 'ALL'
                      ? 'No payroll records found matching your filters'
                      : 'No payroll records found'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => {
                  const totalDeductions = item.salary.deductions?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0;
                  const allowances = 0; // Not available in API
                  const overtime = 0; // Not available in API
                  const bonuses = 0; // Not available in API
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          disabled={item.status === 'PAID'}
                          className="w-4 h-4 text-[#05431E] border-gray-300 rounded focus:ring-[#05431E] disabled:opacity-50"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.salary.employee.name}</div>
                          <div className="text-xs text-gray-500">{item.salary.employee.employeeId}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-700">{item.salary.department?.name || 'N/A'}</td>
                      <td className="px-3 py-3 text-sm text-gray-700">{formatCurrency(item.salary.baseSalary)}</td>
                      <td className="px-3 py-3 text-sm text-green-600 hidden lg:table-cell">{formatCurrency(allowances)}</td>
                      <td className="px-3 py-3 text-sm text-red-600">{formatCurrency(totalDeductions)}</td>
                      <td className="px-3 py-3 text-sm text-blue-600 hidden lg:table-cell">{formatCurrency(overtime)}</td>
                      <td className="px-3 py-3 text-sm text-blue-600 hidden lg:table-cell">{formatCurrency(bonuses)}</td>
                      <td className="px-3 py-3">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(item.salary.netSalary)}</div>
                      </td>
                      <td className="px-3 py-3">{getStatusBadge(item.status)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedPayrollItem(item as PayrollRecord);
                              setShowDetailsModal(true);
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {item.status !== 'UNPAID' && item.status !== 'PAID' && canUpdate && (
                            <button
                              onClick={() => {
                                setSelectedPayrollItem(item as PayrollRecord);
                                setShowUpdateStatusModal(true);
                              }}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Update Status"
                            >
                              <FileText className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Showing</span>
              <select
                value={recordsPerPage}
                onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} out of {pagination.total} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded text-sm transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-[#05431E] text-white border-[#05431E]'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-200 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && selectedItems.size > 0 && (
        <ProcessPayrollModal
          isOpen={showProcessModal}
          onClose={() => setShowProcessModal(false)}
          onProcess={handleProcessPayroll}
          selectedCount={selectedItems.size}
          isProcessing={isProcessing || isBulkProcessing}
        />
      )}

      {/* Update Status Modal */}
      {showUpdateStatusModal && selectedPayrollItem && (
        <UpdateStatusModal
          isOpen={showUpdateStatusModal}
          onClose={() => {
            setShowUpdateStatusModal(false);
            setSelectedPayrollItem(null);
          }}
          payrollItem={selectedPayrollItem}
          onUpdate={handleUpdateStatus}
          isUpdating={isUpdatingStatus}
        />
      )}

      {/* Payroll Details Modal */}
      {showDetailsModal && selectedPayrollItem && (
        <PayrollDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPayrollItem(null);
          }}
          payrollItem={selectedPayrollItem}
        />
      )}
    </div>
  );
};

export default Payroll;

