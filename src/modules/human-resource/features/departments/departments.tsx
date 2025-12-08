import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { ArrowRight2 } from 'iconsax-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useGetRestaurantBySubdomainQuery } from '@/redux/api/restaurant/restaurant.api';
import { 
  useGetDepartmentsQuery, 
  useCreateDepartmentMutation, 
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation 
} from '@/redux/api/department/department.api';
import { useGetStaffForAttendanceQuery, StaffMember } from '@/redux/api/attendance/attendance.api';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { useNavigate } from 'react-router-dom';

const Departments: React.FC = () => {
  const { subdomain } = useSelector(selectAuth);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
  } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

  // Get parent restaurant ID
  const parentRestaurantId = restaurant?.parentId || restaurant?.id;

  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation();
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation();

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
  } = useGetStaffForAttendanceQuery(
    { parentRestaurantId: parentRestaurantId || '' },
    { skip: !parentRestaurantId }
  );

  // Group staff by department
  const staffByDepartment = useMemo(() => {
    if (!staffData?.staff) return {};
    
    const grouped: Record<string, StaffMember[]> = {};
    staffData.staff.forEach((staff) => {
      const deptId = staff.departmentId || 'unassigned';
      if (!grouped[deptId]) {
        grouped[deptId] = [];
      }
      grouped[deptId].push(staff);
    });
    return grouped;
  }, [staffData]);

  // Combine departments with their staff
  const departmentsWithStaff = useMemo(() => {
    if (!departmentsData) return [];
    
    return departmentsData.map((dept) => {
      const staff = staffByDepartment[dept.id] || [];
      return {
        ...dept,
        memberCount: dept._count?.staff || staff.length,
        employees: staff.slice(0, 5).map((s) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          fullName: s.fullName,
          role: s.role,
        })),
      };
    });
  }, [departmentsData, staffByDepartment]);

  // Filter departments based on search term
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departmentsWithStaff;
    
    const searchLower = searchTerm.toLowerCase();
    return departmentsWithStaff.filter((dept) => {
      return (
        dept.name.toLowerCase().includes(searchLower) ||
        dept.employees.some((emp) =>
          emp.fullName.toLowerCase().includes(searchLower) ||
          emp.role.toLowerCase().includes(searchLower)
        )
      );
    });
  }, [departmentsWithStaff, searchTerm]);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentRestaurantId || !formData.name.trim()) return;

    try {
      await createDepartment({
        name: formData.name,
        restaurantId: parentRestaurantId,
        description: formData.description || undefined,
      }).unwrap();
      setShowCreateModal(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create department:', error);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment || !formData.name.trim()) return;

    try {
      await updateDepartment({
        departmentId: editingDepartment,
        data: {
          name: formData.name,
          description: formData.description || undefined,
        },
      }).unwrap();
      setEditingDepartment(null);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to update department:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this department? Staff members will be unlinked from this department.')) {
      return;
    }

    try {
      await deleteDepartment(departmentId).unwrap();
    } catch (error) {
      console.error('Failed to delete department:', error);
    }
  };

  const openEditModal = (dept: typeof departmentsWithStaff[0]) => {
    setEditingDepartment(dept.id);
    setFormData({ name: dept.name, description: dept.description || '' });
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

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">All Departments</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-1/4 pl-12 pr-4 py-3 bg-white text-sm rounded-lg focus:outline-none  focus:border-transparent"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department.id} className="bg-white rounded-lg p-6">
            {/* Department Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{department.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{department.memberCount} Members</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(department)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit department"
                >
                  <Pencil size={16} className="text-gray-600" />
                </button>
                <button
                  onClick={() => handleDeleteDepartment(department.id)}
                  disabled={isDeleting}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete department"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
                <button
                  onClick={() => navigate(`/departments/${department.id}`)}
                  className="text-sm text-[#05431E] hover:text-[#043020] font-medium transition-colors"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Employees List */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {department.employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                  onClick={() => navigate(`/staffs/${employee.id}`)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {getInitials(employee.fullName)}
                    </span>
                  </div>

                  {/* Employee Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {employee.fullName}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {employee.role}
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <ArrowRight2 size={16} className="text-gray-400 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No departments found matching your search.</p>
        </div>
      )}

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Create Department</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', description: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleCreateDepartment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Edit Department</h2>
              <button
                onClick={() => {
                  setEditingDepartment(null);
                  setFormData({ name: '', description: '' });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleUpdateDepartment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] text-sm"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDepartment(null);
                    setFormData({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;

