import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import OrderCard from "./components/order-card";
import SearchBar from "@/components/search-bar/search-bar";
import { useGetOrdersQuery } from "@/redux/api/orders/order.api";

const Orders = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();
  
  if(isLoading) return <div>Loading...</div>;
  if(error) return <div>Error: {error?.data?.message}</div>;

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
          {orders?.map( (o, i) => (
            <OrderCard
              key={o.id}
              orderId={o.id}
              orderNumber={i + 1}
              status={o.status.toUpperCase() as "READY" | "PENDING"}
              date={o.createdAt}
              time={o.updatedAt}
              items={o.orderItems.map( item => ({
                name: item.name,
                qty: item.quantity.toString(),
                price: item.price.toString()
              }))}
              subtotal={o.orderItems.reduce((acc, item) => acc + item.price, 0).toString()}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;