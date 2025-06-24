import { useState } from "react";
import { Sun, Moon, User, Headphones, LogOut } from "lucide-react";
import Input from "@/components/input/input";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout } from "@/redux/api/auth/auth.slice";
import { useNavigate } from "react-router-dom";
import { persistor } from "@/redux/store";
import { AppDispatch } from "@/redux/store";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const { isAuthenticated, user } = useSelector(selectAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // State for editable fields
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    password: "",
    newPassword: "",
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    navigate("/");
    return null;
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name.toLowerCase()]: value,
    }));
  };

  // Handle logout
  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated user data:", {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`,
    });
  };

  // Generate initials for avatar
  const getInitials = () => {
    const firstInitial = user?.firstName?.[0] || "";
    const lastInitial = user?.lastName?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:justify-center gap-6">
          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-white rounded-xl p-4 shadow-md">
            <div className="bg-white p-4 rounded-2xl">
              {/* Theme Toggle */}
              <div className="text-sm font-medium text-gray-700 mb-4">
                Theme
                <div className="mt-2 flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      theme === "light" ? "bg-white shadow-md" : "text-gray-500"
                    }`}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="inline w-4 h-4 mr-1" /> Light
                  </button>
                  <button
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      theme === "dark" ? "bg-white shadow-md" : "text-gray-500"
                    }`}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="inline w-4 h-4 mr-1" /> Dark
                  </button>
                </div>
              </div>

              {/* Menu */}
              <div className="space-y-2">
                <button className="flex items-center w-full px-4 py-3 rounded-lg bg-gray-100 text-green-900 font-medium text-sm">
                  <User className="w-5 h-5 mr-3" /> My Profile
                </button>
                <button className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 text-sm">
                  <Headphones className="w-5 h-5 mr-3" /> Support
                </button>
                <button
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="w-5 h-5 mr-3" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="w-full lg:w-[700px] bg-white rounded-xl p-6 shadow-md">
            <div className="text-xl sm:text-2xl p-2 text-green-800 font-semibold">
              Personal Information
            </div>
            <div className="flex items-center mb-6">
              <div className="ml-3">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-800 text-white flex items-center justify-center text-xl sm:text-2xl font-medium">
                  {getInitials()}
                </div>
              </div>
              <div className="ml-4">
                <div className="text-lg sm:text-xl text-green-800 font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs sm:text-sm font-light text-green-800">
                  {user.role}
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-2">
                  <Input
                    name="firstName"
                    width="100%"
                    label="First Name"
                    placeholder="First Name"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="p-2">
                  <Input
                    name="lastName"
                    width="100%"
                    label="Last Name"
                    placeholder="Last Name"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="p-2 sm:col-span-2">
                  <Input
                    name="email"
                    width="100%"
                    label="Email"
                    placeholder="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="p-2 sm:col-span-2">
                  <Input
                    name="phoneNumber"
                    width="100%"
                    label="Phone Number"
                    placeholder="Phone Number"
                    type="tel"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="p-2 sm:col-span-2">
                  <Input
                    name="address"
                    width="100%"
                    label="Address"
                    placeholder="Address"
                    type="text"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="p-2">
                  <Input
                    name="password"
                    width="100%"
                    label="Current Password"
                    placeholder="Current Password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="p-2">
                  <Input
                    name="newPassword"
                    width="100%"
                    label="New Password"
                    placeholder="New Password"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;