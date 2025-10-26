import { useState, useEffect } from "react";
import { Sun, Moon, User, Headphones, LogOut, Settings as SettingsIcon, Wallet, Building2 } from "lucide-react";
import Input from "@/components/input/input";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout } from "@/redux/api/auth/auth.slice";
import { useNavigate } from "react-router-dom";
import { persistor } from "@/redux/store";
import { AppDispatch } from "@/redux/store";
import { useGetVatConfigQuery, useUpdateVatConfigMutation, VatConfig } from "@/redux/api/vat/vat.api";
import { useGetServiceFeeConfigQuery, useUpdateServiceFeeConfigMutation, ServiceFeeConfig } from "@/redux/api/service-fee/service-fee.api";
import { getSubdomainFromUrl } from "@/utils/config";
import { toast } from "react-toastify";
import BankDetailsManager from "./components/bank-details-manager";

const Settings = () => {
  const [theme, setTheme] = useState("light");
  const [activeSection, setActiveSection] = useState("profile");
  const { isAuthenticated, user } = useSelector(selectAuth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Debug: Log user object to see its structure
  console.log("Settings - User object:", user);
  console.log("Settings - User restaurantId:", user?.restaurantId);
  console.log("Settings - User restaurant.id:", user?.restaurant?.id);
  console.log("Settings - User ownedRestaurants:", user?.ownedRestaurants);
  console.log("Settings - Final restaurantId being passed:", user?.restaurantId || user?.restaurant?.id || "");

  // Get subdomain for VAT API calls
  const subdomain = getSubdomainFromUrl();

  // VAT configuration state
  const [vatConfig, setVatConfig] = useState<VatConfig>({
    vatEnabled: false,
    vatRate: 0.00,
  });

  // Service fee configuration state
  const [serviceFeeConfig, setServiceFeeConfig] = useState<ServiceFeeConfig>({
    serviceFeeRate: 0,
    restaurantId: "",
    restaurantName: "",
    subdomain: "",
  });

  // VAT API hooks
  const { data: vatData, isLoading: vatLoading } = useGetVatConfigQuery(subdomain || "", {
    skip: !subdomain,
  });
  const [updateVatConfig, { isLoading: vatUpdating }] = useUpdateVatConfigMutation();

  // Service fee API hooks
  const { data: serviceFeeData, isLoading: serviceFeeLoading } = useGetServiceFeeConfigQuery(subdomain || "", {
    skip: !subdomain,
  });
  const [updateServiceFeeConfig, { isLoading: serviceFeeUpdating }] = useUpdateServiceFeeConfigMutation();

  // Check if user has permission to access VAT and service fee settings
  const canAccessFinancialSettings = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Update VAT config when data is fetched
  useEffect(() => {
    if (vatData) {
      setVatConfig(vatData);
    }
  }, [vatData]);

  // Update service fee config when data is fetched
  useEffect(() => {
    if (serviceFeeData) {
      setServiceFeeConfig(serviceFeeData);
    }
  }, [serviceFeeData]);

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

  // Handle VAT configuration changes
  const handleVatEnabledChange = (enabled: boolean) => {
    setVatConfig(prev => ({
      ...prev,
      vatEnabled: enabled,
      vatRate: enabled ? prev.vatRate : 0.00,
    }));
  };

  const handleVatRateChange = (rate: number) => {
    setVatConfig(prev => ({
      ...prev,
      vatRate: rate,
    }));
  };

  // Handle VAT configuration submission
  const handleVatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!subdomain) {
        toast.error("Subdomain not found");
        return;
      }
      
      await updateVatConfig({
        subdomain,
        data: vatConfig,
      }).unwrap();
      
      toast.success("VAT configuration updated successfully!");
    } catch (error) {
      console.error("VAT update failed:", error);
      toast.error("Failed to update VAT configuration");
    }
  };

  // Handle service fee configuration changes
  const handleServiceFeeRateChange = (rate: number) => {
    setServiceFeeConfig(prev => ({
      ...prev,
      serviceFeeRate: rate,
    }));
  };

  // Handle service fee configuration submission
  const handleServiceFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!subdomain) {
        toast.error("Subdomain not found");
        return;
      }
      
      await updateServiceFeeConfig({
        subdomain,
        data: {
          serviceFeeRate: serviceFeeConfig.serviceFeeRate,
          userId: user?.id || "",
        },
      }).unwrap();
      
      toast.success("Service fee configuration updated successfully!");
    } catch (error) {
      console.error("Service fee update failed:", error);
      toast.error("Failed to update service fee configuration");
    }
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
                <button 
                  className={`flex items-center w-full px-4 py-3 rounded-lg text-sm ${
                    activeSection === "profile" 
                      ? "bg-gray-100 text-green-900 font-medium" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveSection("profile")}
                >
                  <User className="w-5 h-5 mr-3" /> My Profile
                </button>
                {canAccessFinancialSettings && (
                  <button 
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-sm ${
                      activeSection === "vat" 
                        ? "bg-gray-100 text-green-900 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveSection("vat")}
                  >
                    <SettingsIcon className="w-5 h-5 mr-3" /> VAT Settings
                  </button>
                )}
                {canAccessFinancialSettings && (
                  <button 
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-sm ${
                      activeSection === "service-fee" 
                        ? "bg-gray-100 text-green-900 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveSection("service-fee")}
                  >
                    <Wallet className="w-5 h-5 mr-3" /> Service Fee
                  </button>
                )}
                {canAccessFinancialSettings && (
                  <button 
                    className={`flex items-center w-full px-4 py-3 rounded-lg text-sm ${
                      activeSection === "bank-details" 
                        ? "bg-gray-100 text-green-900 font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setActiveSection("bank-details")}
                  >
                    <Building2 className="w-5 h-5 mr-3" /> Bank Details
                  </button>
                )}
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

          {/* Main Content */}
          <div className="w-full lg:w-[700px] bg-white rounded-xl p-6 shadow-md">
            {activeSection === "profile" && (
              <>
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
              </>
            )}

            {activeSection === "vat" && (
              <>
                <div className="text-xl sm:text-2xl p-2 text-green-800 font-semibold">
                  VAT Configuration
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  Configure VAT settings for your restaurant orders
                </div>

                {/* VAT Form */}
                <form onSubmit={handleVatSubmit}>
                  <div className="space-y-6">
                    {/* VAT Enabled Toggle */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Enable VAT
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Enable or disable VAT calculation for orders
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={vatConfig.vatEnabled}
                            onChange={(e) => handleVatEnabledChange(e.target.checked)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* VAT Rate Input */}
                    {vatConfig.vatEnabled && (
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          VAT Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={vatConfig.vatRate * 100}
                          onChange={(e) => handleVatRateChange(parseFloat(e.target.value) / 100)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter VAT rate (e.g., 7.5 for 7.5%)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Current rate: {(vatConfig.vatRate * 100).toFixed(2)}%
                        </p>
                      </div>
                    )}

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <div className="text-sm text-gray-600">
                        <p>VAT Status: <span className="font-medium">{vatConfig.vatEnabled ? 'Enabled' : 'Disabled'}</span></p>
                        {vatConfig.vatEnabled && (
                          <p>VAT Rate: <span className="font-medium">{(vatConfig.vatRate * 100).toFixed(2)}%</span></p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={vatUpdating || vatLoading}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {vatUpdating ? "Saving..." : "Save VAT Settings"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeSection === "service-fee" && (
              <>
                <div className="text-xl sm:text-2xl p-2 text-green-800 font-semibold">
                  Service Fee Configuration
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  Configure service fee settings for your restaurant orders
                </div>

                {/* Service Fee Form */}
                <form onSubmit={handleServiceFeeSubmit}>
                  <div className="space-y-6">
                    {/* Service Fee Rate Input */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Fee Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={serviceFeeConfig.serviceFeeRate * 100}
                        onChange={(e) => handleServiceFeeRateChange(parseFloat(e.target.value) / 100)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter service fee rate (e.g., 10 for 10%)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Current rate: {(serviceFeeConfig.serviceFeeRate * 100).toFixed(2)}%
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <div className="text-sm text-gray-600">
                        <p>Service Fee Rate: <span className="font-medium">{(serviceFeeConfig.serviceFeeRate * 100).toFixed(2)}%</span></p>
                        <p className="text-xs text-gray-500 mt-1">
                          This fee will be applied to all orders as a percentage of the subtotal
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={serviceFeeUpdating || serviceFeeLoading}
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {serviceFeeUpdating ? "Saving..." : "Save Service Fee Settings"}
                    </button>
                  </div>
                </form>
              </>
            )}

            {activeSection === "bank-details" && (
              <>
                <div className="text-xl sm:text-2xl p-2 text-green-800 font-semibold">
                  Bank Details Management
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  Manage your restaurant's bank account information for payments and settlements
                </div>

                {/* Bank Details Manager Component */}
                <BankDetailsManager restaurantId={user?.restaurantId || user?.restaurant?.id || user?.ownedRestaurants?.[0]?.id || ""} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;