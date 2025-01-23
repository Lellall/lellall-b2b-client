import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { Filter, Download } from "lucide-react";
import StatCard from "./components/stat-card";
import ProductsTable from "./components/products-table";
import { NewOrderDialog } from "./components/add-product-dialog";

const Inventory = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Overall Inventory Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Overall Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Categories"
              color="text-blue-500"
              value="14"
              subtitle="Last 7 days"
            />
            <StatCard
              title="Total Products"
              color="text-orange-500"
              value="868"
              subtitle="Last 7 days"
              secondaryValue="₦25000"
              secondarySubtitle="Revenue"
            />
            <StatCard
              title="Reordered Products"
              color="text-purple-500"
              value="5"
              subtitle="Last 7 days"
              secondaryValue="₦2500"
              secondarySubtitle="Cost"
            />
            <StatCard
              title="Low Stocks"
              color="text-red-500"
              value="12"
              subtitle="Ordered"
              secondaryValue="2"
              secondarySubtitle="Not in stock"
            />
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-xl font-semibold">Products</h2>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default" className="bg-primary hover:bg-green-700">
                  Request Supply
                </Button>
                <NewOrderDialog />
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button variant="outline" className="gap-2">
                  Import
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download all
                </Button>
              </div>
            </div>
          </div>
          <ProductsTable />
        </div>
      </div>
    </div>
  );
};

export default Inventory;