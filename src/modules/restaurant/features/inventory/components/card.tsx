import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import ReceiptPDF from '../../menu/ReceiptPDF';
import { ArrowSquareDown, ArrowSquareUp, Trash, Edit } from 'iconsax-react';
import ConfirmationModal from './confirmation-modal';
import { useGetBankDetailsQuery, useUpdateOrderItemsMutation } from '@/redux/api/order/order.api';
import EditOrderItemsModal from './edit-modal';
import { toast } from 'react-toastify';

// Define TypeScript interfaces for props
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
  vatTax: number;
  serviceFee: number;
  total: number;
  specialNote?: string;
  waiter?: { firstName: string; lastName: string };
  restaurantId: string;
}

interface CardItemProps {
  order: Order;
  expandedOrders: string[];
  toggleExpand: (orderId: string) => void;
  handleStatusUpdate: (orderId: string, status: string) => void;
  handleDeleteOrder: (orderId: string) => Promise<void>;
  subdomain: string;
  restaurantId: string;
}

interface CardProps {
  orders: Order[];
  expandedOrders: string[];
  toggleExpand: (orderId: string) => void;
  handleDeleteOrder: (orderId: string) => Promise<void>;
  handleStatusUpdate: (orderId: string, status: string) => void;
  subdomain: string;
}

const CardItem: React.FC<CardItemProps> = ({
  order,
  expandedOrders,
  toggleExpand,
  handleStatusUpdate,
  handleDeleteOrder,
  subdomain,
  restaurantId,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updateOrderItems, { isLoading: isUpdating }] = useUpdateOrderItemsMutation();
  const {
    data: bankDetails,
    isLoading: isBankDetailsLoading,
    error: bankDetailsError,
    refetch,
  } = useGetBankDetailsQuery(restaurantId);

  // Log for debugging
  console.log({ restaurantId, bankDetails, isBankDetailsLoading, bankDetailsError }, 'Bank Details Query');

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteOrder(order.id);
      setIsModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOrderItems = async (items: { orderItemId?: string; menuItemId: string; quantity: number }[]) => {
    try {
      console.log('Received items in handleEditOrderItems:', items); // Debug log
      await updateOrderItems({
        subdomain,
        orderId: order.id,
        data: { items },
      }).unwrap();
      console.log('Order items updated successfully:', items); // Debug log
      setIsEditModalOpen(false);
      toast.success('Order items updated successfully', { position: 'top-right' });
    } catch (err) {
      console.error('Failed to update order items:', err);
      toast.error('Failed to update order items', { position: 'top-right' });
      throw err;
    }
  };

  // Handle loading and error states
  if (isBankDetailsLoading) {
    return <div className="text-xs sm:text-sm text-gray-600">Loading bank details...</div>;
  }

  if (bankDetailsError) {
    console.error('Error fetching bank details:', bankDetailsError);
    return <div className="text-xs sm:text-sm text-red-600">Error loading bank details</div>;
  }

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 flex flex-col hover:bg-gray-50 transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs sm:text-sm font-semibold text-gray-800">
          #{order.id.substring(0, 6)}
        </span>
        <span
          className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
            order.status === 'PENDING'
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
        {/* Only render ReceiptPDF if bankDetails is available */}
        {!isBankDetailsLoading && (
          <div ref={contentRef}>
            <ReceiptPDF
              orderData={{
                ...order,
                subtotal: order.subtotal,
                vatTax: order.vatTax,
                serviceFee: order.serviceFee,
                total: order.total,
              }}
              reactToPrintFn={reactToPrintFn}
              bankDetails={bankDetails}
            />
          </div>
        )}
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
            <span>VAT</span>
            <span>₦{order.vatTax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span>Service Fee</span>
            <span>₦{order.serviceFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1 font-semibold">
            <span>Total</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>
        <select
          value={order.status}
          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
          className="mt-2 w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
        >
          <option value="PENDING">Pending</option>
          <option value="PREPARING">In Process</option>
          <option value="SERVED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            disabled={isUpdating || order.status !== 'PENDING'}
            className={`flex-1 flex justify-center items-center ${
              isUpdating || order.status !== 'PENDING' ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500`}
            aria-label={`Edit order ${order.id}`}
          >
            <Edit size={16} color="#FFFFFF" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isDeleting || order.status !== 'PENDING'}
            className={`flex-1 flex justify-center items-center ${
              isDeleting || order.status !== 'PENDING' ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'
            } text-white rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-red-500`}
            aria-label={`Delete order ${order.id}`}
          >
            <Trash size={16} color="#FFFFFF" />
          </button>
        </div>
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
        isLoading={isUpdating}
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
}) => {
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
        />
      ))}
    </div>
  );
};

export default Card;