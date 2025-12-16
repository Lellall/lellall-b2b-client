import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReceiptPDF from '../../menu/ReceiptPDF';
import { ArrowSquareDown, ArrowSquareUp, Trash, Edit } from 'iconsax-react';
import ConfirmationModal from './confirmation-modal';
import { useGetBankDetailsQuery } from '@/redux/api/bank-details/bank-details.api';
import { useUpdateOrderItemsMutation, useUpdateOrdersMutation } from '@/redux/api/order/order.api';
import EditOrderItemsModal from './edit-modal';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

interface Order {
  id: string;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'CANCELLED';
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    menuItem: { name: string; price: number };
  }>;
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  vatTax: number;
  serviceFee: number;
  total: number;
  specialNote?: string;
  waiter?: { firstName: string; lastName: string };
  restaurantId: string;
  paymentType?: string | null;
}

interface CardItemProps {
  order: Order;
  expandedOrders: string[];
  toggleExpand: (orderId: string) => void;
  handleStatusUpdate: (orderId: string, status: string) => void;
  handleDeleteOrder: (orderId: string, deleteReason?: string) => Promise<void>;
  subdomain: string;
  restaurantId: string;
  isSelected: boolean;
  toggleOrderSelection: (orderId: string) => void;
}

interface CardProps {
  orders: Order[];
  expandedOrders: string[];
  toggleExpand: (orderId: string) => void;
  handleDeleteOrder: (orderId: string, deleteReason?: string) => Promise<void>;
  handleStatusUpdate: (orderId: string, status: string) => void;
  subdomain: string;
  selectedOrders: Set<string>;
  toggleOrderSelection: (orderId: string) => void;
}

const CardItem: React.FC<CardItemProps> = ({
  order,
  expandedOrders,
  toggleExpand,
  handleStatusUpdate,
  handleDeleteOrder,
  subdomain,
  restaurantId,
  isSelected,
  toggleOrderSelection,
}) => {
  const { user } = useSelector(selectAuth);
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(order.paymentType || "CASH");
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateOrderItems, { isLoading: isUpdatingItems }] = useUpdateOrderItemsMutation();
  const [updateOrderStatus] = useUpdateOrdersMutation();
  const {
    data: bankDetails,
    isLoading: isBankDetailsLoading,
    error: bankDetailsError,
    refetch,
  } = useGetBankDetailsQuery(restaurantId);

  // Check if user has permission to edit/delete orders (only ADMIN and MANAGER)
  const canEditOrDelete = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  console.log({ restaurantId, bankDetails, isBankDetailsLoading, bankDetailsError }, 'Bank Details Query');
  console.log('Order prop in CardItem:', order); // Debug order prop

  const paymentOptions = [
    { value: "CASH", label: "Cash" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "CARD", label: "Card" },
    { value: "ONLINE", label: "Online" },
    { value: "DELIVERY", label: "Delivery" },
  ];

  const handleDelete = async (deleteReason?: string) => {
    if (!order.id) {
      toast.error('Invalid order ID', { position: 'top-right' });
      return;
    }
    setIsDeleting(true);
    try {
      await handleDeleteOrder(order.id, deleteReason);
      setIsModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOrderItems = async (items: { orderItemId?: string; menuItemId: string; quantity: number }[]) => {
    if (!order.id) {
      toast.error('Invalid order ID', { position: 'top-right' });
      return;
    }
    try {
      console.log('Received items in handleEditOrderItems:', items);
      await updateOrderItems({
        subdomain,
        orderId: order.id,
        data: { items },
      }).unwrap();
      console.log('Order items updated successfully:', items);
      setIsEditModalOpen(false);
      toast.success('Order items updated successfully', { position: 'top-right' });
    } catch (err) {
      console.error('Failed to update order items:', err);
      toast.error('Failed to update order items', { position: 'top-right' });
      throw err;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(order, 'order');

    if (!order.id) {
      toast.error('Invalid order ID', { position: 'top-right' });
      return;
    }
    setIsUpdating(true);
    try {
      await updateOrderStatus({
        subdomain,
        data: { status: selectedStatus, paymentType: selectedPaymentType || null },
        id: order.id,
      }).unwrap();
      toast.success('Order updated successfully', { position: 'top-right' });
    } catch (err) {
      console.error('Failed to update order:', err);
      toast.error('Failed to update order', { position: 'top-right' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isBankDetailsLoading) {
    return <div className="text-xs sm:text-sm text-gray-600">Loading bank details...</div>;
  }

  if (bankDetailsError) {
    console.error('Error fetching bank details:', bankDetailsError);
    return <div className="text-xs sm:text-sm text-red-600">Error loading bank details</div>;
  }

  if (!order || !order.id) {
    console.error('Invalid order data:', order);
    return <div className="text-xs sm:text-sm text-red-600">Invalid order data</div>;
  }

  return (
    <div className={`bg-white rounded-lg p-3 sm:p-4 flex flex-col hover:bg-gray-50 transition-all duration-300 ${isSelected ? 'ring-2 ring-[#05431E] ring-opacity-50 shadow-md border border-[#05431E]' : 'border border-gray-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleOrderSelection(order.id)}
            className="w-4 h-4 text-[#05431E] border-gray-300 rounded focus:ring-[#05431E] cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            #{order.id.substring(0, 6)}
          </span>
        </div>
        <span
          className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${order.status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-800'
            : order.status === 'PREPARING'
              ? 'bg-blue-100 text-blue-800'
              : order.status === 'SERVED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
        >
          {order.status}
        </span>
        <div ref={contentRef}>
          <ReceiptPDF
            orderData={{
              ...order,
              subtotal: order.subtotal,
              discountPercentage: order.discountPercentage, // Pass discountPercentage
              discountAmount: order.discountAmount, // Pass discountAmount
              vatTax: order.vatTax,
              serviceFee: order.serviceFee,
              total: order.total,
              paymentType: selectedPaymentType,
            }}
            reactToPrintFn={reactToPrintFn}
            bankDetails={bankDetails?.bankDetails}
            subdomain={subdomain}
            orderId={order.id}
          />
        </div>
      </div>
      <p className="text-[10px] sm:text-xs text-gray-600 mb-2">
        {new Date(order.createdAt).toLocaleString()}
      </p>
      <div className="text-xs sm:text-sm text-gray-900">
        <button
          onClick={() => toggleExpand(order.id)}
          className="flex items-center text-[#05431E] hover:underline mb-1 focus:outline-none text-[10px] sm:text-sm"
          aria-label={expandedOrders.includes(order.id) ? 'Hide order items' : 'Show order items'}
        >
          {expandedOrders.includes(order.id) ? (
            <>
              Hide Items <ArrowSquareUp size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
            </>
          ) : (
            <>
              Show Items <ArrowSquareDown size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
            </>
          )}
        </button>
        {expandedOrders.includes(order.id) ? (
          <ul className="list-disc pl-4 text-[10px] sm:text-sm">
            {order.orderItems.map((item, index) => (
              <li key={index} className="truncate" title={item.menuItem.name}>
                {item.menuItem.name} (x{item.quantity})
              </li>
            ))}
          </ul>
        ) : (
          <p
            className="truncate text-[10px] sm:text-sm"
            title={order.orderItems
              .map((item) => `${item.menuItem.name} (x${item.quantity})`)
              .join(', ')}
          >
            {order.orderItems
              .map((item) => `${item.menuItem.name} (x${item.quantity})`)
              .join(', ')}
          </p>
        )}
        {order.specialNote && (
          <p className="text-[10px] sm:text-xs text-gray-600 mt-2 italic">
            Note: {order.specialNote}
          </p>
        )}
      </div>
      <div className="mt-3 sm:mt-4">
        <div className="text-xs sm:text-sm text-gray-800">
          <div className="flex justify-between text-xs">
            <span>Subtotal</span>
            <span>₦{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span>Discount ({order.discountPercentage ?? 0}%)</span>
            <span>₦{(order.discountAmount ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span>VAT</span>
            <span>₦{order.vatTax.toLocaleString()}</span>
          </div>
          {subdomain !== "355" && (
            <div className="flex justify-between mt-1 text-xs">
              <span>Service Fee</span>
              <span>₦{order.serviceFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between mt-1 font-semibold">
            <span>Total</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>
        <form onSubmit={handleFormSubmit} className="mt-2 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {paymentOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-1 p-[0.5px] rounded-md  cursor-pointer text-[10px] transition-all duration-200 ${selectedPaymentType === option.value
                  ? 'border-[#05431E] bg-[#05431E] text-white'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  name="paymentType"
                  value={option.value}
                  checked={selectedPaymentType === option.value}
                  onChange={(e) => setSelectedPaymentType(e.target.value)}
                  className="hidden"
                  aria-checked={selectedPaymentType === option.value}
                />
                <span
                  className={`w-2 h-2 border rounded-sm flex items-center justify-center ${selectedPaymentType === option.value
                    ? 'border-[#05431E] bg-[#05431E]'
                    : 'border-gray-300'
                    }`}
                >
                  {selectedPaymentType === option.value && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
          >
            <option value="PENDING">Pending</option>
            <option value="PREPARING">In Process</option>
            <option value="SERVED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="submit"
            disabled={isUpdating || (selectedStatus === order.status && selectedPaymentType === (order.paymentType || ""))}
            className={`w-full flex justify-center items-center ${isUpdating || (selectedStatus === order.status && selectedPaymentType === (order.paymentType || ""))
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-[#05431E] hover:bg-[#04391A]'
              } text-white rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]`}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        {canEditOrDelete && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              disabled={isUpdatingItems || order.status !== 'PENDING'}
              className={`flex-1 flex justify-center items-center ${isUpdatingItems || order.status !== 'PENDING' ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'
                } text-white rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-label={`Edit order ${order.id}`}
            >
              <Edit size={16} color="#FFFFFF" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isDeleting || order.status !== 'PENDING'}
              className={`flex-1 flex justify-center items-center ${isDeleting || order.status !== 'PENDING' ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'
                } text-white rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-red-500`}
              aria-label={`Delete order ${order.id}`}
            >
              <Trash size={16} color="#FFFFFF" />
            </button>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        orderId={order.id}
      />
      <EditOrderItemsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditOrderItems}
        isLoading={isUpdatingItems}
        order={order}
      />
    </div>
  );
};

const Card: React.FC<CardProps> = ({
  orders,
  expandedOrders,
  toggleExpand,
  handleDeleteOrder,
  handleStatusUpdate,
  subdomain,
  selectedOrders,
  toggleOrderSelection,
}) => {
  console.log('Orders prop in Card:', orders); // Debug orders prop
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {orders.map((order) => (
        <CardItem
          key={order.id}
          order={order}
          expandedOrders={expandedOrders}
          toggleExpand={toggleExpand}
          handleStatusUpdate={handleStatusUpdate}
          handleDeleteOrder={handleDeleteOrder}
          subdomain={subdomain}
          restaurantId={order.restaurantId}
          isSelected={selectedOrders.has(order.id)}
          toggleOrderSelection={toggleOrderSelection}
        />
      ))}
    </div>
  );
};

export default Card;