import React, { useState, useMemo } from 'react';
import { Calendar, Search, Plus, Users, TrendingDown, Eye, Filter, Edit, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { usePermissions } from '@/hooks/usePermissions';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import {
  useGetSalariesQuery,
  useCreateSalaryMutation,
  useAddDeductionMutation,
  useGetSalaryByIdQuery,
  useUpdateSalaryMutation,
  useRecalculateSalaryMutation,
  useDeleteSalaryMutation,
  Salary,
  CreateSalaryRequest,
  UpdateSalaryRequest,
} from '@/redux/api/attendance/attendance.api';
import { useGetAllEmployeesQuery } from '@/redux/api/payroll/payroll.api';
import { ColorRing } from 'react-loader-spinner';
import { toast } from 'react-toastify';

const SalaryManagement: React.FC = () => {
  const { subdomain } = useSelector(selectAuth);
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<number>(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: restaurant } = useGetRestaurantBySubdomainQuery(subdomain || '', { skip: !subdomain });
  const restaurantId = restaurant?.id || restaurant?.parentId;

  const { data: salariesData, isLoading: isLoadingSalaries, error: salariesError, refetch: refetchSalaries } = useGetSalariesQuery(
    { restaurantId: restaurantId || '', month: monthFilter, year: yearFilter },
    { skip: !restaurantId }
  );

  const { data: employeesData, isLoading: isLoadingEmployees } = useGetAllEmployeesQuery(
    { restaurantId: restaurantId || '' },
    { skip: !restaurantId }
  );

  const [createSalary, { isLoading: isCreating }] = useCreateSalaryMutation();
  const [addDeduction, { isLoading: isAddingDeduction }] = useAddDeductionMutation();
  const [updateSalary, { isLoading: isUpdating }] = useUpdateSalaryMutation();
  const [recalculateSalary, { isLoading: isRecalculating }] = useRecalculateSalaryMutation();
  const [deleteSalary, { isLoading: isDeleting }] = useDeleteSalaryMutation();

  // Get detailed salary data when viewing details
  const { data: detailedSalary, isLoading: isLoadingDetails } = useGetSalaryByIdQuery(
    selectedSalary?.id || '',
    { skip: !selectedSalary?.id || !showDetailsModal }
  );

  // Handle both response structures: { data: [...] } or direct array
  const salaries = React.useMemo(() => {
    if (!salariesData) return [];
    // If the response is directly an array
    if (Array.isArray(salariesData)) {
      return salariesData;
    }
    // If the response has a data property
    if (salariesData.data && Array.isArray(salariesData.data)) {
      return salariesData.data;
    }
    return [];
  }, [salariesData]);

  const employees = employeesData?.data || [];

  // Create Salary Form State
  const [createForm, setCreateForm] = useState<CreateSalaryRequest>({
    userId: '',
    baseSalary: 0,
    month: monthFilter,
    year: yearFilter,
  });

  // Add Deduction Form State
  const [deductionForm, setDeductionForm] = useState({
    type: 'OTHER' as 'ABSENCE' | 'LATE_ARRIVAL' | 'HALF_DAY' | 'OTHER',
    amount: 0,
    reason: '',
    description: '',
  });

  // Edit Salary Form State
  const [editForm, setEditForm] = useState<UpdateSalaryRequest>({
    baseSalary: 0,
  });

  // Filter salaries by search term
  const filteredSalaries = useMemo(() => {
    if (!searchTerm) return salaries;
    
    return salaries.filter((salary) => {
      const name = `${salary.user.firstName} ${salary.user.lastName}`.toLowerCase();
      const employeeId = salary.user.employeeId?.toLowerCase() || '';
      return name.includes(searchTerm.toLowerCase()) || employeeId.includes(searchTerm.toLowerCase());
    });
  }, [salaries, searchTerm]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalSalaries = filteredSalaries.length;
    const totalBaseSalary = filteredSalaries.reduce((sum, s) => sum + s.baseSalary, 0);
    const totalGrossSalary = filteredSalaries.reduce((sum, s) => sum + s.grossSalary, 0);
    const totalNetSalary = filteredSalaries.reduce((sum, s) => sum + s.netSalary, 0);
    const totalDeductions = filteredSalaries.reduce((sum, s) => {
      return sum + (s.deductions?.reduce((dSum, d) => dSum + d.amount, 0) || 0);
    }, 0);

    return {
      totalSalaries,
      totalBaseSalary,
      totalGrossSalary,
      totalNetSalary,
      totalDeductions,
    };
  }, [filteredSalaries]);

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleCreateSalary = async () => {
    if (!createForm.userId || !createForm.baseSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createSalary(createForm).unwrap();
      toast.success('Salary created successfully');
      setShowCreateModal(false);
      setCreateForm({
        userId: '',
        baseSalary: 0,
        month: monthFilter,
        year: yearFilter,
      });
      refetchSalaries();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to create salary');
    }
  };

  const handleAddDeduction = async () => {
    if (!selectedSalary || !deductionForm.amount || !deductionForm.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addDeduction({
        salaryId: selectedSalary.id,
        ...deductionForm,
      }).unwrap();
      toast.success('Deduction added successfully');
      setShowDeductionModal(false);
      setSelectedSalary(null);
      setDeductionForm({
        type: 'OTHER',
        amount: 0,
        reason: '',
        description: '',
      });
      refetchSalaries();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to add deduction');
    }
  };

  const handleEditSalary = async () => {
    if (!selectedSalary || !editForm.baseSalary) {
      toast.error('Please enter a valid base salary');
      return;
    }

    try {
      await updateSalary({
        salaryId: selectedSalary.id,
        data: editForm,
      }).unwrap();
      toast.success('Salary updated successfully');
      setShowEditModal(false);
      setSelectedSalary(null);
      setEditForm({ baseSalary: 0 });
      refetchSalaries();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update salary');
    }
  };

  const handleRecalculate = async () => {
    if (!selectedSalary) return;

    try {
      await recalculateSalary(selectedSalary.id).unwrap();
      toast.success('Salary deductions recalculated successfully');
      refetchSalaries();
      if (showDetailsModal) {
        // Refetch details if modal is open
        setSelectedSalary(null);
        setTimeout(() => setSelectedSalary(selectedSalary), 100);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to recalculate salary');
    }
  };

  const handleDeleteSalary = async () => {
    if (!selectedSalary) return;

    try {
      await deleteSalary(selectedSalary.id).unwrap();
      toast.success('Salary deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedSalary(null);
      refetchSalaries();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to delete salary');
    }
  };

  // Check if salary is paid (locked)
  const isSalaryPaid = (salary: Salary | null) => {
    if (!salary) return false;
    // Check if salary has payroll with PAID status
    return (salary as any).payroll?.status === 'PAID';
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-semibold text-gray-800">Salary Management</h1>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Salary
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Salaries</div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{summary.totalSalaries}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Base Salary</div>
            <span className="text-lg">₦</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{formatCurrency(summary.totalBaseSalary)}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Deductions</div>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-semibold text-red-600">{formatCurrency(summary.totalDeductions)}</div>
        </div>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500">Total Net Salary</div>
            <span className="text-lg text-[#05431E]">₦</span>
          </div>
          <div className="text-2xl font-semibold text-[#05431E]">{formatCurrency(summary.totalNetSalary)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
            />
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="month"
                value={`${yearFilter}-${String(monthFilter).padStart(2, '0')}`}
                onChange={(e) => {
                  const [year, month] = e.target.value.split('-');
                  setYearFilter(Number(year));
                  setMonthFilter(Number(month));
                }}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm cursor-pointer"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Department</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Base Salary</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Deductions</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Net Salary</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Period</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoadingSalaries ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <ColorRing visible={true} height="40" width="40" ariaLabel="loading" wrapperStyle={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : salariesError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <p className="font-medium">Error loading salaries</p>
                      <p className="text-sm mt-1">{(salariesError as any)?.data?.message || (salariesError as any)?.message || 'Unknown error'}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div>
                      <p>No salary records found</p>
                      {salariesData && (
                        <p className="text-xs mt-2 text-gray-400">
                          Response received but no data. Check console for details.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((salary) => {
                  const totalDeductions = salary.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
                  return (
                    <tr key={salary.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {salary.user.firstName} {salary.user.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{salary.user.employeeId || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{salary.department?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatCurrency(salary.baseSalary)}</td>
                      <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(totalDeductions)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(salary.netSalary)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {format(new Date(salary.year, salary.month - 1, 1), 'MMM yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedSalary(salary);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          {!isSalaryPaid(salary) && (
                            <>
                              {canUpdate && (
                                <button
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    setEditForm({ baseSalary: salary.baseSalary });
                                    setShowEditModal(true);
                                  }}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit Salary"
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </button>
                              )}
                              {canUpdate && (
                                <button
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    setShowDeductionModal(true);
                                  }}
                                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded transition-colors"
                                  title="Add Deduction"
                                >
                                  Add Deduction
                                </button>
                              )}
                              {canUpdate && (
                                <button
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    handleRecalculate();
                                  }}
                                  disabled={isRecalculating}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                                  title="Recalculate Deductions"
                                >
                                  <RefreshCw className={`w-4 h-4 text-green-600 ${isRecalculating ? 'animate-spin' : ''}`} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                  title="Delete Salary"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              )}
                            </>
                          )}
                          {isSalaryPaid(salary) && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                              Paid
                            </span>
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
      </div>

      {/* Create Salary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Salary</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee *</label>
                <select
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeId || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary *</label>
                <input
                  type="number"
                  value={createForm.baseSalary || ''}
                  onChange={(e) => setCreateForm({ ...createForm, baseSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  placeholder="Enter base salary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={createForm.month}
                    onChange={(e) => setCreateForm({ ...createForm, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    value={createForm.year}
                    onChange={(e) => setCreateForm({ ...createForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSalary}
                disabled={isCreating}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Salary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Deduction Modal */}
      {showDeductionModal && selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Manual Deduction</h2>
            <p className="text-sm text-gray-600 mb-4">
              For: {selectedSalary.user.firstName} {selectedSalary.user.lastName}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={deductionForm.type}
                  onChange={(e) => setDeductionForm({ ...deductionForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                >
                  <option value="ABSENCE">Absence</option>
                  <option value="LATE_ARRIVAL">Late Arrival</option>
                  <option value="HALF_DAY">Half Day</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  value={deductionForm.amount || ''}
                  onChange={(e) => setDeductionForm({ ...deductionForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  placeholder="Enter deduction amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                <input
                  type="text"
                  value={deductionForm.reason}
                  onChange={(e) => setDeductionForm({ ...deductionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  placeholder="Enter reason for deduction"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  value={deductionForm.description}
                  onChange={(e) => setDeductionForm({ ...deductionForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeductionModal(false);
                  setSelectedSalary(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeduction}
                disabled={isAddingDeduction}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingDeduction ? 'Adding...' : 'Add Deduction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Salary Modal */}
      {showEditModal && selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Salary</h2>
            <p className="text-sm text-gray-600 mb-4">
              For: {selectedSalary.user.firstName} {selectedSalary.user.lastName}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary *</label>
                <input
                  type="number"
                  value={editForm.baseSalary || ''}
                  onChange={(e) => setEditForm({ baseSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  placeholder="Enter base salary"
                />
              </div>
              <div className="text-xs text-gray-500">
                Net salary will be automatically recalculated based on existing deductions.
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSalary(null);
                  setEditForm({ baseSalary: 0 });
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSalary}
                disabled={isUpdating}
                className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Salary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Salary</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the salary record for{' '}
              <strong>{selectedSalary.user.firstName} {selectedSalary.user.lastName}</strong>?
            </p>
            <p className="text-xs text-red-600 mb-4">
              This action cannot be undone. All deductions will also be deleted.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedSalary(null);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSalary}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Salary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Salary Details Modal */}
      {showDetailsModal && selectedSalary && (
        <SalaryDetailsModal
          salary={detailedSalary || selectedSalary}
          isLoading={isLoadingDetails}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedSalary(null);
          }}
          onRecalculate={handleRecalculate}
          onEdit={() => {
            setShowDetailsModal(false);
            setEditForm({ baseSalary: selectedSalary.baseSalary });
            setShowEditModal(true);
          }}
          isPaid={isSalaryPaid(selectedSalary)}
          isRecalculating={isRecalculating}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

// Salary Details Modal Component
interface SalaryDetailsModalProps {
  salary: Salary | null;
  isLoading?: boolean;
  onClose: () => void;
  onRecalculate?: () => void;
  onEdit?: () => void;
  isPaid?: boolean;
  isRecalculating?: boolean;
  formatCurrency: (amount: number) => string;
}

const SalaryDetailsModal: React.FC<SalaryDetailsModalProps> = ({
  salary,
  isLoading = false,
  onClose,
  onRecalculate,
  onEdit,
  isPaid = false,
  isRecalculating = false,
  formatCurrency,
}) => {
  if (isLoading || !salary) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <div className="flex items-center justify-center py-12">
            <ColorRing visible={true} height="40" width="40" ariaLabel="loading" />
          </div>
        </div>
      </div>
    );
  }

  const totalDeductions = salary.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
  const payroll = (salary as any).payroll;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Salary Breakdown</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Employee Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-base font-semibold text-gray-900">
              {salary.user.firstName} {salary.user.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {salary.user.employeeId || 'N/A'} • {salary.department?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {format(new Date(salary.year, salary.month - 1, 1), 'MMMM yyyy')}
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Base Salary</span>
                <span className="text-base font-semibold text-gray-900">{formatCurrency(salary.baseSalary)}</span>
              </div>
            </div>

            {salary.deductions && salary.deductions.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-900">Deductions</span>
                </div>
                <div className="space-y-2">
                  {salary.deductions.map((deduction) => (
                    <div key={deduction.id} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-700">{deduction.reason}</span>
                        {deduction.attendance && (
                          <div className="text-xs text-gray-500">
                            Date: {format(new Date(deduction.attendance.date), 'dd MMM yyyy')}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-red-700">{formatCurrency(deduction.amount)}</span>
                    </div>
                  ))}
                  <div className="border-t border-red-300 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-red-900">Total Deductions</span>
                    <span className="text-base font-bold text-red-900">{formatCurrency(totalDeductions)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border-2 border-[#05431E] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#05431E]">Net Salary</span>
                <span className="text-xl font-bold text-[#05431E]">{formatCurrency(salary.netSalary)}</span>
              </div>
            </div>
          </div>

          {payroll && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Payment Information</h3>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Status:</strong> <span className="text-green-600">{payroll.status}</span></p>
                {payroll.paymentDate && (
                  <p><strong>Payment Date:</strong> {format(new Date(payroll.paymentDate), 'MMM dd, yyyy')}</p>
                )}
                {payroll.paymentMethod && (
                  <p><strong>Payment Method:</strong> {payroll.paymentMethod}</p>
                )}
                {payroll.processedBy && (
                  <p><strong>Processed By:</strong> {payroll.processedBy.name}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {!isPaid && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Salary
              </button>
            )}
            {!isPaid && onRecalculate && (
              <button
                onClick={onRecalculate}
                disabled={isRecalculating}
                className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                {isRecalculating ? 'Recalculating...' : 'Recalculate Deductions'}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement;

