import { useState } from "react";
import { useUpdateOrdersMutation } from "@/redux/api/order/order.api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderItem {
  name: string;
  qty: string;
  price: string;
}

interface OrderCardProps {
  orderNumber: string;
  date: string;
  time: string;
  items: OrderItem[];
  subtotal: string;
  status: string;
  subdomain: string;
  id: string;
}

const statusOptions = ["PENDING", "PREPARING", "READY", "SERVED", "CANCELLED"];

const OrderCard = ({ orderNumber, date, time, items, subtotal, status, subdomain, id }: OrderCardProps) => {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [updateOrderStatus] = useUpdateOrdersMutation();

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    await updateOrderStatus({ subdomain, data: { status: newStatus }, id });
  };

  return (
    <div className="w-full mx-auto py-8 px-6 bg-gradient-to-br from-gray-50 via-white to-green-50 rounded-xl shadow-xs font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-[#05431E] to-gray-700 bg-clip-text text-transparent">
            Order #{orderNumber}
          </h2>
          <p className="text-sm text-gray-800 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-[#05431E] rounded-full animate-pulse" />
            {date} <span className="mx-2 text-gray-500">/</span> {time}
          </p>
        </div>
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44 h-11 text-sm font-semibold text-white bg-gradient-to-r from-[#05431E] to-[#0A6B34] rounded-full shadow-md hover:from-[#04391A] hover:to-[#095F2E] focus:ring-4 focus:ring-[#05431E]/30 transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-xl mt-2">
            {statusOptions.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-sm font-medium py-2 px-5 hover:bg-gradient-to-r hover:from-green-50 hover:to-[#05431E]/10 hover:text-[#05431E] text-gray-800 cursor-pointer transition-all duration-150"
              >
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      <div className="mb-8">
        <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-100/80 py-3 px-4 rounded-t-lg shadow-sm">
          <div className="col-span-2">Qty</div>
          <div className="col-span-7">Item</div>
          <div className="col-span-3 text-right">Price</div>
        </div>
        {items?.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-4 text-sm text-gray-900 py-4 px-4 border-b border-gray-200/50 hover:bg-gradient-to-r hover:from-green-50 hover:to-[#05431E]/5 rounded-md transition-all duration-200 group"
          >
            <div className="col-span-2 font-bold text-[#05431E]">{item.qty}</div>
            <div className="col-span-7 group-hover:text-[#05431E] transition-colors">{item.name}</div>
            <div className="col-span-3 text-right font-semibold text-gray-900">{item.price}</div>
          </div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="flex justify-end items-center">
        <div className="inline-flex items-center gap-6 bg-gradient-to-r from-[#05431E] to-[#0A6B34] text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200">
          <span className="text-sm font-medium">Subtotal</span>
          <span className="text-lg font-extrabold tracking-tight">{subtotal}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-[#05431E]/20 to-transparent" />
    </div>
  );
};

export default OrderCard;