import Modal from "@/components/modal/modal";
import { Button } from "@/components/ui/button";
import { Trash } from "iconsax-react";
import { Pencil } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import StaffForm from "../../staff/components/staff-form";
import {
  useCreateUserUnderRestaurantMutation,
  useGetUsersByRestaurantQuery,
  useGetUsersStatsQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/redux/api/restaurant/restaurant.api";
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import { toast } from "react-toastify";

// Table Component
interface TableProps {
  columns: { key: string; label: string; render?: (value: any, row: any, index: number) => React.ReactNode }[];
  data: Record<string, any>[];
  selectable?: boolean;
  bordered?: boolean;
  onEdit?: (user: any) => void;
  onDelete?: (user: any) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, selectable = false, bordered = false, onEdit, onDelete }) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'cashier':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`overflow-x-auto ${bordered ? 'border border-gray-200 rounded-lg' : ''}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {selectable && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={(e) => handleSelectRow(index, e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : column.key === 'status'
                    ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row[column.key])}`}>
                          {row[column.key]}
                        </span>
                      )
                    : column.key === 'role'
                    ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(row[column.key])}`}>
                          {row[column.key]}
                        </span>
                      )
                    : row[column.key]}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(row);
                    }}
                    className="text-amber-600 hover:text-amber-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(row);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Users Component for Branch
interface BranchUsersProps {
  restaurantId: string;
}

function BranchUsers({ restaurantId }: BranchUsersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const {
    data: usersDataRaw,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useGetUsersByRestaurantQuery(
    { restaurantId, ...(searchTerm ? { search: searchTerm } : {}) },
    { skip: !restaurantId }
  );

  const {
    data: stats,
  } = useGetUsersStatsQuery(restaurantId, { skip: !restaurantId });

  const [createUser, { isLoading: isCreating }] = useCreateUserUnderRestaurantMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "ADMIN",
    restaurantId: restaurantId || "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    setFormValues((prev) => ({ ...prev, restaurantId: restaurantId || "" }));
  }, [restaurantId]);

  useEffect(() => {
    if (selectedUser) {
      setFormValues({
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        password: "",
        role: selectedUser.role || "ADMIN",
        restaurantId: restaurantId || "",
        phoneNumber: selectedUser.phoneNumber || "",
        address: selectedUser.address || "",
      });
    }
  }, [selectedUser, restaurantId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(formValues).unwrap();
      setModalOpen(false);
      toast.success("User created successfully");
      refetchUsers();
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "ADMIN",
        restaurantId: restaurantId || "",
        phoneNumber: "",
        address: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      await updateUser({
        userId: selectedUser.id,
        data: formValues,
      }).unwrap();
      
      setEditModalOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
      refetchUsers();
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "ADMIN",
        restaurantId: restaurantId || "",
        phoneNumber: "",
        address: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id).unwrap();
      
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully");
      refetchUsers();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
  ];

  const usersData = useMemo(() => {
    if (!usersDataRaw) return [];
    return usersDataRaw.map((user: any) => ({
      ...user,
      status: user.isActive ? "Active" : "Inactive",
    }));
  }, [usersDataRaw]);

  const statColors = [
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    "bg-gradient-to-r from-green-500 to-green-600 text-white",
    "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
    "bg-gradient-to-r from-pink-500 to-pink-600 text-white",
  ];

  const totalUsers = stats?.totalUsers || 0;
  const roleCounts = stats?.roleCounts || {};

  const statsData = [
    { label: "Total Users", value: totalUsers },
    ...Object.entries(roleCounts).map(([role, count]) => ({
      label: role.toLowerCase().replace(/([A-Z])/g, " $1"),
      value: count || 0,
    })),
  ].slice(0, 5);

  if (isUsersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="color-ring-loading"
          wrapperStyle={{}}
          wrapperClass="color-ring-wrapper"
          colors={[theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active, theme.colors.active]}
        />
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <input
            placeholder="Search users"
            type="text"
            className="w-full md:max-w-md p-3 border border-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            onChange={handleSearch}
            value={searchTerm}
          />
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => setModalOpen(true)}
              variant="default"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm"
            >
              Add User
            </Button>
          </div>
        </div>
      </div>

      <main className="mt-8">
        <div className="bg-white rounded-xl p-4 sm:p-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {statsData.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg text-center font-medium ${statColors[index % statColors.length]}`}
              >
                <p className="text-xs sm:text-sm text-gray-600 capitalize">{item.label}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="my-4">
            <Table 
              selectable 
              columns={columns} 
              data={usersData} 
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      </main>

      <div className="overflow-y-auto">
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add New User"
          size="lg"
        >
          <StaffForm
            formValues={formValues}
            setFormValues={setFormValues}
            setModalOpen={setModalOpen}
            handleChange={handleChange}
            onSubmit={handleCreateUser}
            loaders={{ isCreating, isDeleting: false, isUpdating: false }}
          />
        </Modal>

        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedUser(null);
          }}
          title="Edit User"
          size="lg"
        >
          <StaffForm
            formValues={formValues}
            setFormValues={setFormValues}
            setModalOpen={setEditModalOpen}
            handleChange={handleChange}
            onSubmit={handleUpdateUser}
            loaders={{ isCreating: false, isDeleting: false, isUpdating }}
          />
        </Modal>

        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
          }}
          title="Delete User"
          size="sm"
        >
          <div className="p-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setUserToDelete(null);
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default BranchUsers;