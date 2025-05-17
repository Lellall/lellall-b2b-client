import Modal from "@/components/modal/modal";
import { Button } from "@/components/ui/button";
import { Trash } from "iconsax-react";
import { Pencil } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import StaffForm from "./components/staff-form";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
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

// Table Component
interface TableProps {
  columns: { key: string; label: string; render?: (value: any, row: any, index: number) => React.ReactNode }[];
  data: Record<string, any>[];
  selectable?: boolean;
  bordered?: boolean;
}

const Table: React.FC<TableProps> = ({ columns, data, selectable, bordered = false }) => {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSort = (key: string) => {
    const newOrder = sortKey === key && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortOrder(newOrder);
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === "asc" ? (aValue || 0) - (bValue || 0) : (bValue || 0) - (aValue || 0);
    });
  }, [data, sortKey, sortOrder]);

  const handleRowSelect = (index: number) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(index)) {
      newSelectedRows.delete(index);
    } else {
      newSelectedRows.add(index);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === data.length);
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectAll ? new Set() : new Set(data.map((_, index) => index)));
    setSelectAll(!selectAll);
  };

  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h-2m-2 0H7" />
        </svg>
        <h3 className="text-base font-medium text-gray-700">No Staff Found</h3>
        <p className="text-xs text-gray-500 text-center mt-2">It looks like there are no staff members yet. Click "Add Staff" to get started!</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Desktop/Table View (sm and above) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className={`w-full bg-white ${bordered ? "border border-gray-200 rounded-lg" : ""} table-auto`}>
          <thead>
            <tr className={`${bordered ? "border-b border-gray-200 first:rounded-t-lg" : ""}`}>
              {selectable && (
                <th className={`px-4 py-4 text-left text-sm text-gray-700 font-light w-12 ${bordered ? "border-r border-gray-200" : ""}`}>
                  <input
                    type="checkbox"
                    className="rounded h-4 w-4 accent-green-900 focus:ring-green-500"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${col.key === "actions" ? "w-20" : "min-w-[120px]"} ${bordered ? "border-r border-gray-200" : ""} ${col.key === "lastName" || col.key === "phoneNumber" || col.key === "role" ? "hidden lg:table-cell" : ""}`}
                  onClick={() => col.key !== "actions" && handleSort(col.key)}
                >
                  {col.label} {sortKey === col.key && col.key !== "actions" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={row.id || index}
                className={`transition-colors duration-200 ${bordered ? "border-b border-gray-200 last:rounded-b-lg" : ""} ${index % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                {selectable && (
                  <td className={`px-4 text-sm py-4 text-gray-900 font-light w-12 ${bordered ? "border-r border-gray-200" : ""}`}>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-green-900 focus:ring-green-500"
                      checked={selectedRows.has(index)}
                      onChange={() => handleRowSelect(index)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 text-sm py-4 text-gray-900 font-light ${col.key === "actions" ? "w-20" : "min-w-[120px] truncate"} ${bordered ? "border-r border-gray-200" : ""} ${col.key === "lastName" || col.key === "phoneNumber" || col.key === "role" ? "hidden lg:table-cell" : ""}`}
                  >
                    {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (below sm) */}
      <div className="block sm:hidden space-y-4">
        {sortedData.map((row, index) => (
          <div
            key={row.id || index}
            className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2"
          >
            {selectable && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-green-900 focus:ring-green-500"
                  checked={selectedRows.has(index)}
                  onChange={() => handleRowSelect(index)}
                />
                <span className="text-sm text-gray-700">Select</span>
              </div>
            )}
            {columns
              .filter((col) => col.key !== "actions" && col.key !== "lastName" && col.key !== "phoneNumber" && col.key !== "role")
              .map((col) => (
                <div key={col.key} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">{col.label}:</span>
                  <span className="text-sm text-gray-900 truncate max-w-[60%]">
                    {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                  </span>
                </div>
              ))}
            <div className="flex justify-end gap-2">
              {columns
                .filter((col) => col.key === "actions")
                .map((col) => (
                  <div key={col.key} className="relative">
                    {col.render && col.render(row[col.key], row, index)}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Staff Component
function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const { subdomain } = useSelector(selectAuth);

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

  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useGetUsersStatsQuery(restaurant?.id, { skip: !restaurant?.id });

  const [createUser, { isLoading: isCreating }] = useCreateUserUnderRestaurantMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const loaders = { isCreating, isDeleting, isUpdating }

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

  const statColors = [
    "bg-amber-50 border-amber-200 text-amber-900",
    "bg-red-50 border-red-200 text-red-900",
    "bg-indigo-50 border-indigo-200 text-indigo-900",
    "bg-green-50 border-green-200 text-green-900",
    "bg-orange-50 border-orange-200 text-orange-900",
  ];

  const staffData = Array.isArray(staffDataRaw) ? staffDataRaw : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name", className: "hidden lg:table-cell" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone", className: "hidden lg:table-cell" },
    { key: "role", label: "Role", className: "hidden lg:table-cell" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            aria-label="Edit staff"
            className="text-blue-500 p-2 rounded hover:bg-gray-100"
            onClick={() => {
              setSelectedUser(row);
              setEditModalOpen(true);
            }}
          >
            <Pencil size={18} />
          </button>
          <button
            aria-label="Delete staff"
            className="text-red-500 p-2 rounded hover:bg-gray-100"
            onClick={() => {
              setUserToDelete(row.id);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isRestaurantLoading || isStatsLoading || isStaffLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing
          height="80"
          width="80"
          radius="9"
          color={theme.colors.active}
          ariaLabel="three-dots-loading"
          visible={true}
        />
      </div>
    )
  }

  if (restaurantError || statsError || staffError) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded-lg text-center">
        Error loading data. Please try again later.
      </div>
    );
  }

  const totalUsers = stats?.totalUsers || 0;
  const roleCounts = stats?.roleCounts || {};

  const statsData = [
    { label: "Total Users", value: totalUsers },
    ...Object.entries(roleCounts).map(([role, count]) => ({
      label: role.toLowerCase().replace(/([A-Z])/g, " $1"),
      value: count || 0,
    })),
  ].slice(0, 5);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <input
            placeholder="Search staff"
            type="text"
            className="w-full md:max-w-md p-3 border border-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            onChange={handleSearch}
            value={searchTerm}
          />
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm"
            >
              Add Staff
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
            <Table selectable columns={columns} data={staffData} className="mt-8" />
          </div>
        </div>
      </main>

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

        <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} position="center" className="w-11/12 sm:w-96">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="text-sm">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteStaff}
                className="bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Staff;