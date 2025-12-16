import Modal from "@/components/modal/modal";
import { Button } from "@/components/ui/button";
import { Trash, Filter } from "iconsax-react";
import { Pencil, Eye, Search, Plus } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import StaffForm from "./components/staff-form";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import {
  useCreateUserUnderRestaurantMutation,
  useGetUsersByRestaurantQuery,
  useGetRestaurantBySubdomainQuery,
  useGetUsersStatsQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/redux/api/restaurant/restaurant.api";
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { toast } from "react-toastify";

// Staff Component
function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const { subdomain, user } = useSelector(selectAuth);
  const { canCreate, canUpdate, canDelete } = usePermissions();

  const {
    data: restaurant,
    isLoading: isRestaurantLoading,
    error: restaurantError,
  } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

  const {
    data: staffDataRaw,
    isLoading: isStaffLoading,
    error: staffError,
    refetch: refetchStaff,
  } = useGetUsersByRestaurantQuery(
    { restaurantId: restaurant?.id, ...(searchTerm ? { search: searchTerm } : {}) },
    { skip: !restaurant?.id }
  );

  const [createUser, { isLoading: isCreating }] = useCreateUserUnderRestaurantMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const loaders = { isCreating, isDeleting, isUpdating };

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STAFF",
    restaurantId: restaurant?.id || "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, restaurantId: restaurant?.id || "" }));
  }, [restaurant?.id]);

  useEffect(() => {
    if (selectedUser) {
      setFormValues({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        password: "",
        role: selectedUser.role || "STAFF",
        restaurantId: restaurant?.id || "",
        phoneNumber: selectedUser.phoneNumber || "",
        address: selectedUser.address || "",
      });
    }
  }, [selectedUser, restaurant?.id]);

  const staffData = Array.isArray(staffDataRaw) ? staffDataRaw : [];

  // Filter staff based on search term
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staffData;
    
    const searchLower = searchTerm.toLowerCase();
    return staffData.filter((staff) => {
      const fullName = `${staff.firstName || ''} ${staff.lastName || ''}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        staff.email?.toLowerCase().includes(searchLower) ||
        staff.role?.toLowerCase().includes(searchLower) ||
        staff.phoneNumber?.toLowerCase().includes(searchLower)
      );
    });
  }, [staffData, searchTerm]);

  // Pagination
  const totalRecords = filteredStaff.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await createUser(formValues).unwrap();
      setModalOpen(false);
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "STAFF",
        restaurantId: restaurant?.id || "",
        phoneNumber: "",
        address: "",
      });
      refetchStaff();
      toast.success("Staff created successfully");
    } catch (error) {
      console.error("Failed to create staff:", error);
      toast.error(error?.error?.data?.message || "Failed to create staff");
    }
  };

  const handleDeleteStaff = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete).unwrap();
      toast.success("User deleted successfully");
      refetchStaff();
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete staff:", error);
      toast.error(error?.error?.data?.message || "Failed to delete user");
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    if (!selectedUser?.id) return;
    try {
      const updateData = { ...formValues };
      if (updateData.password === "") {
        delete updateData.password;
      }
      await updateUser({ userId: selectedUser.id, data: updateData }).unwrap();
      toast.success("User updated successfully");
      setEditModalOpen(false);
      setSelectedUser(null);
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "STAFF",
        restaurantId: restaurant?.id || "",
        phoneNumber: "",
        address: "",
      });
      refetchStaff();
    } catch (error) {
      console.error("Failed to update staff:", error);
      toast.error(error?.error?.data?.message || "Failed to update user");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '??';
  };

  const getFullName = (staff: any) => {
    return `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'N/A';
  };

  // Mock data for employee ID, department, designation, type - replace with actual data when available
  const getEmployeeId = (staff: any) => {
    return staff.employeeId || staff.id?.slice(0, 9) || 'N/A';
  };

  const getDepartment = (staff: any) => {
    return staff.department?.name || staff.department || 'N/A';
  };

  const getDesignation = (staff: any) => {
    return staff.role || 'N/A';
  };

  const getType = (staff: any) => {
    return staff.type || 'Office';
  };

  if (isRestaurantLoading || isStaffLoading) {
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

  if (restaurantError || staffError) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded-lg text-center">
        Error loading data. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">All Employees</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Search bar in header - can be hidden on mobile */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:border-transparent text-sm"
            />
          </div>
          {/* Notification and Avatar - placeholder */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05431E] focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-gray-700">
            <Filter size={18} />
            Filter
          </button>
          {canCreate && (
            <button
              onClick={() => navigate('/staffs/add')}
              className="px-4 py-2 bg-[#05431E] hover:bg-[#043020] text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={18} />
              Add New Employee
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Employee ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Department</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Designation</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No employees found</p>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-gray-600">
                            {getInitials(staff.firstName, staff.lastName)}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{getFullName(staff)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getEmployeeId(staff)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getDepartment(staff)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getDesignation(staff)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{getType(staff)}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        Permanent
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/staffs/${staff.id}`)}
                          className="text-gray-500 hover:text-[#05431E] transition-colors"
                          aria-label="View staff"
                        >
                          <Eye size={18} />
                        </button>
                        {/* Pencil icon hidden */}
                        {/* {canUpdate && (
                          <button
                            onClick={() => {
                              setSelectedUser(staff);
                              setEditModalOpen(true);
                            }}
                            className="text-gray-500 hover:text-blue-600 transition-colors"
                            aria-label="Edit staff"
                          >
                            <Pencil size={18} />
                          </button>
                        )} */}
                        {canDelete && (
                          <button
                            onClick={() => {
                              setUserToDelete(staff.id);
                              setDeleteConfirmOpen(true);
                            }}
                            className="text-gray-500 hover:text-red-600 transition-colors"
                            aria-label="Delete staff"
                          >
                            <Trash size={18} />
                          </button>
                        )}
          </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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

      {/* Modals */}
      <div className="overflow-y-auto">
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position="right" className="w-full sm:w-96">
          <StaffForm
            formValues={formValues}
            handleChange={handleChange}
            setFormValues={setFormValues}
            setModalOpen={setModalOpen}
            onSubmit={handleCreateStaff}
            loaders={loaders as any}
          />
        </Modal>

        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} position="right" className="w-full sm:w-96">
          <StaffForm
            formValues={formValues}
            handleChange={handleChange}
            setFormValues={setFormValues}
            setModalOpen={setEditModalOpen}
            onSubmit={handleUpdateStaff}
          />
        </Modal>

        <Modal isOpen={deleteConfirmOpen} onClose={() => !isDeleting && setDeleteConfirmOpen(false)} position="center" className="w-11/12 sm:w-96">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteConfirmOpen(false)} 
                className="text-sm"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteStaff}
                className="bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <ColorRing
                      height="16"
                      width="16"
                      colors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff']}
                      ariaLabel="loading"
                      visible={true}
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Staff;
