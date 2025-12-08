import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X } from 'lucide-react';
import { ArrowRight2 } from 'iconsax-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import { useGetDepartmentsQuery, useLinkStaffToDepartmentMutation } from '@/redux/api/department/department.api';
import { useGetStaffForAttendanceQuery, StaffMember } from '@/redux/api/attendance/attendance.api';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { toast } from 'react-toastify';

const ViewDepartment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subdomain } = useSelector(selectAuth);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set());
  const [isBulkLinking, setIsBulkLinking] = useState(false);

  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
  } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

  // Get parent restaurant ID
  const parentRestaurantId = restaurant?.parentId || restaurant?.id;

  // Fetch departments
  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
  } = useGetDepartmentsQuery(
    { restaurantId: parentRestaurantId || '' },
    { skip: !parentRestaurantId }
  );

  // Fetch all staff
  const {
    data: staffData,
    isLoading: isStaffLoading,
    refetch: refetchStaff,
  } = useGetStaffForAttendanceQuery(
    { parentRestaurantId: parentRestaurantId || '' },
    { skip: !parentRestaurantId }
  );

  const [linkStaffToDepartment, { isLoading: isLinking }] = useLinkStaffToDepartmentMutation();

  // Find the department
  const department = departmentsData?.find((dept) => dept.id === id);

  // Get staff in this department
  const departmentStaff = useMemo(() => {
    if (!staffData?.staff || !id) return [];
    return staffData.staff.filter((staff) => staff.departmentId === id);
  }, [staffData, id]);

  // Get staff not in any department or in other departments (for adding to this department)
  const availableStaff = useMemo(() => {
    if (!staffData?.staff || !id) return [];
    return staffData.staff.filter((staff) => !staff.departmentId || staff.departmentId !== id);
  }, [staffData, id]);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return departmentStaff;
    
    const searchLower = searchTerm.toLowerCase();
    return departmentStaff.filter((emp) => {
      return (
        emp.fullName.toLowerCase().includes(searchLower) ||
        emp.role.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
      );
    });
  }, [departmentStaff, searchTerm]);

  // Pagination
  const totalRecords = filteredEmployees.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handleLinkStaff = async (userId: string) => {
    if (!id) return;
    
    try {
      await linkStaffToDepartment({
        userId,
        departmentId: id,
      }).unwrap();
      refetchStaff();
      setShowAddStaffModal(false);
      setSelectedStaffIds(new Set());
    } catch (error) {
      console.error('Failed to link staff:', error);
    }
  };

  const handleBulkLinkStaff = async () => {
    if (!id || selectedStaffIds.size === 0) return;
    
    setIsBulkLinking(true);
    const userIds = Array.from(selectedStaffIds);
    
    try {
      const results = await Promise.allSettled(
        userIds.map((userId) =>
          linkStaffToDepartment({
            userId,
            departmentId: id,
          }).unwrap()
        )
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      if (successful > 0) {
        refetchStaff();
        setSelectedStaffIds(new Set());
        
        if (failed === 0) {
          toast.success(`Successfully linked ${successful} staff member${successful !== 1 ? 's' : ''} to department`);
          setShowAddStaffModal(false);
        } else {
          toast.warning(`Linked ${successful} staff member${successful !== 1 ? 's' : ''}, but ${failed} failed`);
        }
      } else {
        toast.error(`Failed to link ${failed} staff member${failed !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Failed to bulk link staff:', error);
      toast.error('An error occurred while linking staff members');
    } finally {
      setIsBulkLinking(false);
    }
  };

  const handleToggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(staffId)) {
        newSet.delete(staffId);
      } else {
        newSet.add(staffId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedStaffIds.size === availableStaff.length) {
      setSelectedStaffIds(new Set());
    } else {
      setSelectedStaffIds(new Set(availableStaff.map((s) => s.id)));
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isRestaurantLoading || isDepartmentsLoading || isStaffLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing
          height="80"
          width="80"
          colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
          ariaLabel="loading"
          visible={true}
        />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-500">Department not found</p>
          <button
            onClick={() => navigate('/departments')}
            className="mt-4 text-[#05431E] hover:text-[#043020] transition-colors"
          >
            ← Back to All Departments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/departments')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{department?.name || 'Department'}</h1>
            <p className="text-sm text-gray-500 mt-1">{departmentStaff.length} Members</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddStaffModal(true)}
          className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search employees"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/3 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No employees found</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {getInitials(employee.fullName)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{employee.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.email}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/staffs/${employee.id}`)}
                        className="text-gray-500 hover:text-[#05431E] transition-colors"
                      >
                        <ArrowRight2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Showing</span>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalRecords)} out of {totalRecords} records
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-200 rounded-lg bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 4) {
                pageNum = i + 1;
              } else if (currentPage <= 2) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 1) {
                pageNum = totalPages - 3 + i;
              } else {
                pageNum = currentPage - 1 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    currentPage === pageNum
                      ? 'bg-[#05431E] text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-200 rounded-lg bg-white text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Staff to Department</h2>
                {selectedStaffIds.size > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedStaffIds.size} staff member{selectedStaffIds.size !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setSelectedStaffIds(new Set());
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            {/* Bulk Actions Bar */}
            {availableStaff.length > 0 && (
              <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedStaffIds.size === availableStaff.length && availableStaff.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#05431E] border-gray-300 rounded focus:ring-[#05431E] cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({availableStaff.length})
                  </span>
                </div>
                {selectedStaffIds.size > 0 && (
                  <button
                    onClick={handleBulkLinkStaff}
                    disabled={isBulkLinking || isLinking}
                    className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isBulkLinking ? (
                      <>
                        <ColorRing
                          height="16"
                          width="16"
                          colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
                          ariaLabel="loading"
                          visible={true}
                        />
                        Linking {selectedStaffIds.size}...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Link Selected ({selectedStaffIds.size})
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {availableStaff.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No available staff to add</p>
              ) : (
                <div className="space-y-2">
                  {availableStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        selectedStaffIds.has(staff.id)
                          ? 'border-[#05431E] bg-green-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.has(staff.id)}
                          onChange={() => handleToggleStaffSelection(staff.id)}
                          className="w-4 h-4 text-[#05431E] border-gray-300 rounded focus:ring-[#05431E] cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {getInitials(staff.fullName)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{staff.fullName}</div>
                          <div className="text-xs text-gray-500">{staff.role} • {staff.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLinkStaff(staff.id)}
                        disabled={isLinking || isBulkLinking}
                        className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                      >
                        {isLinking ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDepartment;

