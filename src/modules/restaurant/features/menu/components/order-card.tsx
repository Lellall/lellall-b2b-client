import { useState } from "react";
import { useUpdateOrdersMutation } from "@/redux/api/order/order.api";
import { useGetVatConfigQuery } from "@/redux/api/vat/vat.api";
import { useGetServiceFeeConfigQuery } from "@/redux/api/service-fee/service-fee.api";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/api/auth/auth.slice";
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
  discountAmount?: string; // New: Optional discount amount
  vatTax: string;
  serviceFee?: string; // Optional, as it may not apply (e.g., subdomain "355")
  total: string;
  status: string;
  subdomain: string;
  id: string;
  specialNote?: string; // Optional special note
  paymentType?: string | null; // Optional payment type
  discountPercentage?: number; // New: Optional discount percentage
}

const statusOptions = ["PENDING", "PREPARING", "READY", "SERVED", "CREDIT", "CANCELLED"];

const OrderCard = ({
  orderNumber,
  date,
  time,
  items,
  subtotal,
  discountAmount,
  vatTax,
  serviceFee,
  total,
  status,
  subdomain,
  id,
  specialNote,
  paymentType,
  discountPercentage,
}: OrderCardProps) => {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [updateOrderStatus] = useUpdateOrdersMutation();
  
  // Get VAT configuration
  const { data: vatConfig } = useGetVatConfigQuery(subdomain, {
    skip: !subdomain,
  });

  // Get service fee configuration
  const { data: serviceFeeConfig } = useGetServiceFeeConfigQuery(subdomain, {
    skip: !subdomain,
  });

  // Extract service fee rate from config
  const serviceFeeRate = serviceFeeConfig?.rate || 0;

  const handleStatusChange = async (newStatus: string) => {
    setSelectedStatus(newStatus);
    try {
      await updateOrderStatus({ subdomain, data: { status: newStatus }, id }).unwrap();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Try again.");
    }
  };

  return (
    <div className="w-full mx-auto py-4 sm:py-6 px-4 sm:px-6 bg-gradient-to-br from-gray-50 via-white to-green-50 rounded-xl shadow-xs font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight bg-gradient-to-r from-[#05431E] to-gray-700 bg-clip-text text-transparent">
            Order #{orderNumber}
          </h2>
          <p className="text-[10px] sm:text-sm text-gray-800 flex items-center gap-2">
            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 bg-[#05431E] rounded-full animate-pulse" />
            {date} <span className="mx-1 sm:mx-2 text-gray-500">/</span> {time}
          </p>
          {specialNote && (
            <p className="text-[10px] sm:text-sm text-gray-600">Note: {specialNote}</p>
          )}
          {discountPercentage && discountPercentage > 0 && (
            <p className="text-[10px] sm:text-sm text-gray-600">
              Discount: {discountPercentage}% ({discountAmount})
            </p>
          )}
        </div>
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36 sm:w-44 h-9 sm:h-10 text-[10px] sm:text-sm font-semibold text-white bg-gradient-to-r from-[#05431E] to-[#0A6B34] rounded-full shadow-md hover:from-[#04391A] hover:to-[#095F2E] focus:ring-2 focus:ring-[#05431E]/30 transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-xl mt-1 sm:mt-2">
            {statusOptions.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-[10px] sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-5 hover:bg-gradient-to-r hover:from-green-50 hover:to-[#05431E]/10 hover:text-[#05431E] text-gray-800 cursor-pointer transition-all duration-150"
              >
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items */}
      <div className="mb-4 sm:mb-8">
        <div className="grid grid-cols-12 gap-2 sm:gap-4 text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-100/80 py-2 sm:py-3 px-3 sm:px-4 rounded-t-lg shadow-sm">
          <div className="col-span-2">Qty</div>
          <div className="col-span-6 sm:col-span-7">Item</div>
          <div className="col-span-4 sm:col-span-3 text-right">Price</div>
        </div>
        {items?.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 sm:gap-4 text-[10px] sm:text-sm text-gray-900 py-2 sm:py-4 px-3 sm:px-4 border-b border-gray-200/50 hover:bg-gradient-to-r hover:from-green-50 hover:to-[#05431E]/5 rounded-md transition-all duration-200 group"
          >
            <div className="col-span-2 font-bold text-[#05431E]">{item.qty}</div>
            <div className="col-span-6 sm:col-span-7 group-hover:text-[#05431E] transition-colors truncate">{item.name}</div>
            <div className="col-span-4 sm:col-span-3 text-right font-semibold text-gray-900">{item.price}</div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="flex justify-end items-center">
        <div className="inline-flex flex-col items-end gap-2 sm:gap-3 bg-gradient-to-r from-[#05431E] to-[#0A6B34] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-[10px] sm:text-sm font-medium">Subtotal</span>
            <span className="text-[10px] sm:text-sm font-semibold">{subtotal}</span>
          </div>
          {discountPercentage && discountPercentage > 0 && (
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-[10px] sm:text-sm font-medium">Discount ({discountPercentage}%)</span>
              <span className="text-[10px] sm:text-sm font-semibold">{discountAmount}</span>
            </div>
          )}
          {vatConfig?.vatEnabled && (
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-[10px] sm:text-sm font-medium">
                VAT ({(vatConfig.vatRate * 100).toFixed(1)}%)
              </span>
              <span className="text-[10px] sm:text-sm font-semibold">{vatTax}</span>
            </div>
          )}
          {serviceFee && serviceFeeRate > 0 && (
            <div className="flex items-center gap-4 sm:gap-6">
              <span className="text-[10px] sm:text-sm font-medium">
                Service Fee ({(serviceFeeRate * 100).toFixed(1)}%)
              </span>
              <span className="text-[10px] sm:text-sm font-semibold">{serviceFee}</span>
            </div>
          )}
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-[10px] sm:text-sm font-medium">Total</span>
            <span className="text-base sm:text-lg font-extrabold tracking-tight">{total}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-4 sm:mt-8 h-px bg-gradient-to-r from-transparent via-[#05431E]/20 to-transparent" />
    </div>
  );
};

export default OrderCard;