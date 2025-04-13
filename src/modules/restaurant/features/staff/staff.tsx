import Modal from "@/components/modal/modal";
import SearchBar from "@/components/search-bar/search-bar";
import { TabButton, TabContainer, TabPanel } from "@/components/tab";
import { Button } from "@/components/ui/button";
import { Eye, More, Trash } from "iconsax-react";
import { Pencil } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { theme } from "@/theme/theme";
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
    newSelectedRows.has(index) ? newSelectedRows.delete(index) : newSelectedRows.add(index);
    setSelectedRows(newSelectedRows);
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectAll ? new Set() : new Set(data.map((_, index) => index)));
    setSelectAll(!selectAll);
  };

  if (sortedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-lg">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h-2m-2 0H7" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700">No Staff Found</h3>
        <p className="text-sm text-gray-500 text-center mt-2">It looks like there are no staff members yet. Click "Add Staff" to get started!</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
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
                  onClick={(e) => e.stopPropagation()}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-4 text-left text-sm text-gray-700 font-light ${col.key === "actions" ? "w-20" : "min-w-[120px]"} ${bordered ? "border-r border-gray-200" : ""}`}
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
              onClick={(e) => e.stopPropagation()}
            >
              {selectable && (
                <td className={`px-4 text-sm py-4 text-gray-900 font-light w-12 ${bordered ? "border-r border-gray-200" : ""}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-green-900 focus:ring-green-500"
                    checked={selectedRows.has(index)}
                    onChange={() => handleRowSelect(index)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 text-sm py-4 text-gray-900 font-light ${col.key === "actions" ? "w-20" : "min-w-[120px] truncate"} ${bordered ? "border-r border-gray-200" : ""} relative`}
                  onClick={(e) => col.key === "actions" && e.stopPropagation()}
                >
                  {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Staff Component
interface AttendanceRecordProps {
  recordId: string | number;
  imageUrl: string;
  name: string;
  position: string;
  date: string;
  time: string;
  onStatusChange?: (status: "present" | "absent" | "half" | "leave") => void;
  className?: string;
}

function Staff() {
  const sampleAttendanceData = [];
  const [activeTab, setActiveTab] = useState("staff");
  const [searchTerm, setSearchTerm] = useState(null); // Add search term state
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const dropdownRefs = useRef({});
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

  const [createUser] = useCreateUserUnderRestaurantMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        Object.values(dropdownRefs.current).every(
          (ref) => ref && !ref.contains(event.target)
        )
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const statColors = [
    "bg-amber-50 border-amber-200 text-amber-900",
    "bg-red-50 border-red-200 text-red-900",
    "bg-indigo-50 border-indigo-200 text-indigo-900",
    "bg-green-50 border-green-200 text-green-900",
    "bg-orange-50 border-orange-200 text-orange-900",
  ];

  const staffData = Array.isArray(staffDataRaw) ? staffDataRaw : [];

  const handleTabSwitch = (val: string) => {
    setActiveTab(val);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // Update search term from input value
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
      setDropdownOpen(null);
    } catch (error) {
      console.error("Failed to delete staff:", error);
      toast.error(error?.error?.data?.message || "Failed to delete user");
    }
  };

  const handleConfirmDelete = (userId) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
    setDropdownOpen(null);
  };

  const handleEditStaff = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
    setDropdownOpen(null);
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

  const handleMoreClick = (rowId) => {
    setDropdownOpen(dropdownOpen === rowId ? null : rowId);
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone" },
    { key: "address", label: "Address" },
    { key: "role", label: "Role" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row, index) => (
        <div className="relative" ref={(el) => (dropdownRefs.current[row.id || index] = el)}>
          <button
            className="text-blue-500 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleMoreClick(row.id || index);
            }}
          >
            <More size="18" color={theme.colors.active} />
          </button>
          {dropdownOpen === (row.id || index) && (
            <div
              className="absolute right-0 top-6 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-[100]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("View", row.id, "index:", index);
                  setDropdownOpen(null);
                }}
              >
                <Eye size={16} />
                View
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-700 whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditStaff(row);
                }}
              >
                <Pencil size={16} />
                Edit
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-500 whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  handleConfirmDelete(row.id);
                }}
              >
                <Trash size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isRestaurantLoading || isStatsLoading || isStaffLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (restaurantError || statsError || staffError) {
    return (
      <div className="text-red-500 bg-red-100 p-4 rounded-lg">
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
        <div className="flex justify-between items-center mb-8">
          <input
            placeholder="Search staff"
            type="text"
            className="w-full max-w-md p-2 border border-gray-50 rounded-lg rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            onChange={handleSearch}
            value={searchTerm}
          />
          <div className="flex gap-4">
            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Add Staff
            </Button>
          </div>
        </div>
      </div>

      <main className="mt-8">
        <TabPanel active={activeTab === "staff"}>
          <div className="bg-white rounded-xl p-6 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
              {statsData.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-center font-medium ${statColors[index % statColors.length]}`}
                >
                  <p className="text-sm text-gray-600">{item.label}</p>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="my-4">
              <Table selectable columns={columns} data={staffData} className="mt-8" />
            </div>
          </div>
        </TabPanel>
        <TabPanel active={activeTab === "attendance"}>
          {sampleAttendanceData.map((item) => (
            <AttendanceRecord key={item.recordId} {...item} />
          ))}
        </TabPanel>
      </main>

      <div className="overflow-y-auto">
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} position="right">
          <StaffForm
            formValues={formValues}
            handleChange={handleChange}
            setFormValues={setFormValues}
            setModalOpen={setModalOpen}
            onSubmit={handleCreateStaff}
          />
        </Modal>

        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} position="right">
          <StaffForm
            formValues={formValues}
            handleChange={handleChange}
            setFormValues={setFormValues}
            setModalOpen={setEditModalOpen}
            onSubmit={handleUpdateStaff}
            isEdit={true}
          />
        </Modal>

        <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} position="center">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteStaff}
                className="bg-red-600 hover:bg-red-700 text-white"
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

const AttendanceRecord = ({
  recordId,
  imageUrl,
  name,
  position,
  date,
  time,
  onStatusChange,
  className = "",
}: AttendanceRecordProps) => {
  const handleStatusClick = (status: "present" | "absent" | "half" | "leave") => {
    onStatusChange?.(status);
  };

  return (
    <div
      className={`flex justify-between items-center gap-6 my-4 p-4 bg-white rounded-lg border border-gray-200 ${className} transition-all duration-200 hover:bg-gray-50`}
    >
      <div className="flex gap-6 items-center">
        <div className="text-sm font-medium text-gray-500">#{recordId}</div>
        <div className="flex gap-6 items-center">
          <img
            className="w-12 h-12 rounded-full border border-gray-300"
            src={imageUrl}
            alt={`${name}'s profile`}
          />
          <div>
            <p className="text-lg font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{position}</p>
          </div>
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700">{date}</div>
      <div className="text-sm font-medium text-gray-700">{time}</div>
      <div className="flex gap-3">
        <Button
          className="bg-green-200 text-green-900 hover:bg-green-300"
          onClick={() => handleStatusClick("present")}
          size="sm"
        >
          Present
        </Button>
        <Button
          className="bg-red-200 text-red-900 hover:bg-red-300"
          onClick={() => handleStatusClick("absent")}
          size="sm"
        >
          Absent
        </Button>
        <Button
          className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
          onClick={() => handleStatusClick("half")}
          size="sm"
        >
          Half Shift
        </Button>
        <Button
          className="bg-gray-200 text-gray-900 hover:bg-gray-300"
          onClick={() => handleStatusClick("leave")}
          size="sm"
        >
          Leave
        </Button>
      </div>
    </div>
  );
};

export default Staff;