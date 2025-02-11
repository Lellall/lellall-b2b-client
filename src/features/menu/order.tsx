import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OrderCard from "./components/order-card";
import SearchBar from "@/components/search-bar/search-bar";

const Orders = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <SearchBar
              placeholder="Search Items"
              width="300px"
              height="42px"
              border="1px solid #fff"
              borderRadius="10px"
              backgroundColor="#ffffff"
              shadow={false}
              fontSize="11px"
              color="#444"
              inputPadding="10px"
              placeholderColor="#bbb"
              iconColor="#ccc"
              iconSize={15}
            />
            <div className="flex gap-2">
              <Button variant="default" className="bg-primary text-white">All</Button>
              <Button variant="ghost">In Process</Button>
              <Button variant="ghost">Completed</Button>
              <Button variant="ghost">Cancelled</Button>
            </div>
          </div>
          <Button variant="secondary" className="gap-2 text-xs">
            <Plus className="h-4 w-4" />
            Add New Order
          </Button>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <OrderCard
            orderNumber="01"
            status="Ready"
            date="Wednesday, 28, 2024"
            time="4:48 PM"
            items={[
              { name: "Scrambled eggs with toast", qty: "01", price: "₦199" },
              { name: "Smoked Salmon Bagel", qty: "01", price: "₦120" },
              { name: "Belgian Wiffles", qty: "02", price: "₦220" },
              { name: "Classi Lemoniade", qty: "01", price: "₦110" },
            ]}
            subtotal="₦649"
          />
          <OrderCard
            orderNumber="02"
            status="Pending"
            date="Wednesday, 28, 2024"
            time="4:48 PM"
            items={[
              { name: "Scrambled eggs with toast", qty: "01", price: "₦199" },
              { name: "Smoked Salmon Bagel", qty: "01", price: "₦120" },
              { name: "Belgian Wiffles", qty: "02", price: "₦220" },
              { name: "Classi Lemoniade", qty: "01", price: "₦110" },
            ]}
            subtotal="₦649"
          />
          <OrderCard
            orderNumber="03"
            status="Ready"
            date="Wednesday, 28, 2024"
            time="4:48 PM"
            items={[
              { name: "Scrambled eggs with toast", qty: "01", price: "₦199" },
              { name: "Smoked Salmon Bagel", qty: "01", price: "₦120" },
              { name: "Belgian Wiffles", qty: "02", price: "₦220" },
              { name: "Classi Lemoniade", qty: "01", price: "₦110" },
            ]}
            subtotal="₦649"
          />
        </div>
      </div>
    </div>
  );
};

export default Orders;