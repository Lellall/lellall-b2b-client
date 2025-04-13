import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Filter, Download } from "lucide-react";
import StatCard from "./components/stat-card";
import ProductsTable from "./components/products-table";
import { NewOrderDialog } from "./components/add-product-dialog";
import { RequestSupplyDialog } from "./components/request-supply-dialog";
import { useState } from "react";
import StockSheet from "./stock/stock-sheet";
import Kitchen from "./stock/kitchen";
import Orders from "../menu/order";
import InventoryComponent from "./inventory";
import KitchenView from "./stock/view-orders";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('tab-1');
  const openTab = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <>
      <div className="flex mb-4 border-b border-gray-200">
        <button
          className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-1' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
          onClick={() => openTab('tab-1')}
        >
          Orders
        </button>
        <button
          className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-2' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
          onClick={() => openTab('tab-2')}
        >
          Stock Sheet
        </button>
        <button
          className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-3' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
          onClick={() => openTab('tab-3')}
        >
          Kitchen
        </button>
        <button
          className={`py-2 px-4 text-xs  text-center text-gray-600 hover:text-gray-800 focus:outline-none ${activeTab === 'tab-4' ? 'border-b-2 border-green-900 text-green-900' : ''}`}
          onClick={() => openTab('tab-4')}
        >
          Inventory
        </button>
      </div>
      <div className="pt-4">
        {activeTab === 'tab-1' && <div>
          <KitchenView />
        </div>}
        {activeTab === 'tab-2' && <div>
          <StockSheet />
        </div>}
        {activeTab === 'tab-3' && <div>
          <Kitchen />
        </div>}
        {activeTab === 'tab-4' && <div>
        <InventoryComponent />
        </div>}
      </div>
    </>
  );
};

export default Inventory;