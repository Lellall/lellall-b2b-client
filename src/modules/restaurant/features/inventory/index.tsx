import { useEffect, useState } from "react";
import StockSheet from "./stock/stock-sheet";
import Kitchen from "./stock/kitchen";
import InventoryComponent from "./inventory";
import KitchenView from "./stock/view-orders";
import TemplateList from "./template-list";
import { useSearchParams } from "react-router-dom";
import SupplyRequests from "../gpt-supply-request/gpt-supply";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
import DeletedOrders from "./stock/deleted-orders";

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("tab-1");
  const { user } = useSelector(selectAuth);

  const openTab = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam); // ✅ Use string directly
    }
  }, [searchParams]);

  // Check if user is a WAITER
  const isWaiter = user.role === "WAITER" || user.role === "CASHIER";
  // Check if user is ADMIN (only admins can see deleted orders)
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  return (
    <>
      <div className="flex mb-4 border-b border-gray-200">
        {/* Always show Orders tab */}
        <button
          className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-1" ? "border-b-2 border-green-900 text-green-900" : ""}`}
          onClick={() => openTab("tab-1")}
        >
          Orders
        </button>
        {/* Show other tabs only if user is not a WAITER */}
        {!isWaiter && (
          <>
            <button
              className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-2" ? "border-b-2 border-green-900 text-green-900" : ""}`}
              onClick={() => openTab("tab-2")}
            >
              Stock Sheet
            </button>
            <button
              className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-3" ? "border-b-2 border-green-900 text-green-900" : ""}`}
              onClick={() => openTab("tab-3")}
            >
              Kitchen
            </button>
            <button
              className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-4" ? "border-b-2 border-green-900 text-green-900" : ""}`}
              onClick={() => openTab("tab-4")}
            >
              Inventory
            </button>
            <button
              className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-5" ? "border-b-2 border-green-900 text-green-900" : ""}`}
              onClick={() => openTab("tab-5")}
            >
              Templates
            </button>
            <button
              className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-6" ? "border-b-2 border-green-900 text-green-900" : ""}`}
              onClick={() => openTab("tab-6")}
            >
              Supply Requests
            </button>
            {/* Only show Deleted Orders tab for ADMIN users */}
            {isAdmin && (
              <button
                className={`py-2 px-4 text-xs text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === "tab-7" ? "border-b-2 border-green-900 text-green-900" : ""}`}
                onClick={() => openTab("tab-7")}
              >
                Deleted Orders
              </button>
            )}
          </>
        )}
      </div>
      <div className="pt-4">
        {activeTab === "tab-1" && (
          <div>
            <KitchenView />
          </div>
        )}
        {/* Render other tabs only if user is not a WAITER */}
        {!isWaiter && (
          <>
            {activeTab === "tab-2" && (
              <div>
                <StockSheet />
              </div>
            )}
            {activeTab === "tab-3" && (
              <div>
                <Kitchen />
              </div>
            )}
            {activeTab === "tab-4" && (
              <div>
                <InventoryComponent />
              </div>
            )}
            {activeTab === "tab-5" && (
              <div>
                <TemplateList inventory={[]} />
              </div>
            )}
            {activeTab === "tab-6" && (
              <div>
                <SupplyRequests />
              </div>
            )}
            {/* Only render Deleted Orders tab for ADMIN users */}
            {isAdmin && activeTab === "tab-7" && (
              <div>
                <DeletedOrders />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Inventory;