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
import { useCurrency } from "@/contexts/CurrencyContext";


interface Order {
  id: string;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'CANCELLED' | 'CREDIT' | 'UNPAID';
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    menuItem: { name: string; price: number };
  }>;
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  appliedTaxes?: Array<{ name: string; rate: number; amount: number }>;
  vatTax: number;
  serviceFee: number;
  total: number;
  specialNote?: string;
  waiter?: { firstName: string; lastName: string };
  restaurantId: string;
  paymentType?: string | null;
  splitPayments?: { type: string; amount: number }[] | null;
  changeAmount?: number | null;
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
  const { formatCurrency } = useCurrency();
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState(order.paymentType || "CASH");
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState<number>(order.discountPercentage || 0);

  // Split payment state
  const [isSplitMode, setIsSplitMode] = useState(order.paymentType === 'SPLIT');
  const [splitRows, setSplitRows] = useState<{ type: string; amount: string }[]>(
    order.splitPayments && order.splitPayments.length >= 2
      ? order.splitPayments.map(s => ({ type: s.type, amount: String(s.amount) }))
      : [{ type: 'CASH', amount: '' }, { type: 'TRANSFER', amount: '' }]
  );
  // Amount tendered for single-payment change
  const [amountTendered, setAmountTendered] = useState<string>(
    order.changeAmount != null ? String((order.total ?? 0) + (order.changeAmount ?? 0)) : ''
  );

  const orderTotal = order.total ?? 0;
  const splitSum = splitRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const splitChange = Math.max(0, splitSum - orderTotal);
  const splitRemaining = Math.max(0, orderTotal - splitSum);
  const singleChange = Math.max(0, (parseFloat(amountTendered) || 0) - orderTotal);
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

    if (!order.id) {
      toast.error('Invalid order ID', { position: 'top-right' });
      return;
    }
    setIsUpdating(true);
    try {
      const updateData: {
        status: string;
        paymentType: string | null;
        discountPercentage?: number;
        splitPayments?: { type: string; amount: number }[];
        amountTendered?: number;
      } = {
        status: selectedStatus,
        paymentType: isSplitMode ? 'SPLIT' : (selectedPaymentType || null),
      };

      if ((selectedStatus === 'SERVED' || selectedStatus === 'CREDIT') && discountPercentage > 0) {
        updateData.discountPercentage = discountPercentage;
      }

      if (isSplitMode) {
        updateData.splitPayments = splitRows
          .filter(r => parseFloat(r.amount) > 0)
          .map(r => ({ type: r.type, amount: parseFloat(r.amount) }));
      } else if (parseFloat(amountTendered) > 0) {
        updateData.amountTendered = parseFloat(amountTendered);
      }

      await updateOrderStatus({
        subdomain,
        data: updateData,
        id: order.id,
      }).unwrap();
      toast.success('Order updated successfully', { position: 'top-right' });
    } catch (err: any) {
      console.error('Failed to update order:', err);
      toast.error(err?.data?.message || 'Failed to update order', { position: 'top-right' });
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
                : order.status === 'CREDIT' || order.status === 'UNPAID'
                  ? 'bg-orange-100 text-orange-800'
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
              discountPercentage: order.discountPercentage,
              discountAmount: order.discountAmount,
              appliedTaxes: order.appliedTaxes,
              vatTax: order.vatTax,
              serviceFee: order.serviceFee,
              total: order.total,
              paymentType: isSplitMode ? 'SPLIT' : (selectedPaymentType || order.paymentType || ''),
              splitPayments: isSplitMode
                ? splitRows.filter(r => parseFloat(r.amount) > 0).map(r => ({ type: r.type, amount: parseFloat(r.amount) }))
                : order.splitPayments,
              changeAmount: isSplitMode ? splitChange : (singleChange > 0 ? singleChange : order.changeAmount),
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
            <span>{formatCurrency(order.subtotal.toLocaleString())}</span>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span>Discount ({order.discountPercentage ?? 0}%)</span>
            <span>{formatCurrency((order.discountAmount ?? 0).toLocaleString())}</span>
          </div>
          {order.appliedTaxes && order.appliedTaxes.length > 0 ? (
            order.appliedTaxes.map((tax, index) => (
              tax.amount > 0 && (
                <div key={index} className="flex justify-between mt-1 text-xs">
                  <span>{tax.name} ({(tax.rate * 100).toFixed(2)}%)</span>
                  <span>{formatCurrency(tax.amount.toLocaleString())}</span>
                </div>
              )
            ))
          ) : (
            <div className="flex justify-between mt-1 text-xs">
              <span>VAT</span>
              <span>{formatCurrency(order.vatTax.toLocaleString())}</span>
            </div>
          )}
          {subdomain !== "355" && (
            <div className="flex justify-between mt-1 text-xs">
              <span>Service Fee</span>
              <span>{formatCurrency(order.serviceFee.toLocaleString())}</span>
            </div>
          )}
          <div className="flex justify-between mt-1 font-semibold">
            <span>Total</span>
            <span>{formatCurrency((
              (order.subtotal - (order.discountAmount ?? 0))
              + (order.appliedTaxes && order.appliedTaxes.length > 0
                  ? order.appliedTaxes.reduce((sum, tax) => sum + tax.amount, 0)
                  : (order.vatTax ?? 0))
              + (order.serviceFee ?? 0)
            ).toLocaleString())}</span>
          </div>
        </div>
        <form onSubmit={handleFormSubmit} className="mt-2 space-y-2">
          {/* Payment Method Selection */}
          {!isSplitMode ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center space-x-1 p-[0.5px] rounded-md cursor-pointer text-[10px] transition-all duration-200 ${
                      selectedPaymentType === option.value
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
                    />
                    <span
                      className={`w-2 h-2 border rounded-sm flex items-center justify-center ${
                        selectedPaymentType === option.value ? 'border-[#05431E] bg-[#05431E]' : 'border-gray-300'
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
                {/* Split toggle */}
                <label
                  className={`flex items-center space-x-1 p-[0.5px] rounded-md cursor-pointer text-[10px] transition-all duration-200 ${
                    isSplitMode
                      ? 'border-[#05431E] bg-[#05431E] text-white'
                      : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsSplitMode(true)}
                >
                  <span
                    className={`w-2 h-2 border rounded-sm flex items-center justify-center ${
                      isSplitMode ? 'border-[#05431E] bg-[#05431E]' : 'border-gray-300'
                    }`}
                  >
                    {isSplitMode && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span>Split</span>
                </label>
              </div>
              {/* Amount Tendered (single payment change) */}
              <div>
                <label className="text-[10px] sm:text-xs text-gray-500 block mb-0.5">Amount Tendered (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                  className="w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                  placeholder={`Order total: ${formatCurrency(orderTotal.toFixed(2))}`}
                />
                {singleChange > 0 && (
                  <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                    💵 Change Due: {formatCurrency(singleChange.toFixed(2))}
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Split Payment Panel */
            <div className="border border-purple-200 bg-purple-50 rounded-lg p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold text-purple-700">Split Payment</span>
                <button
                  type="button"
                  onClick={() => setIsSplitMode(false)}
                  className="text-[9px] text-purple-500 hover:underline"
                >
                  Cancel Split
                </button>
              </div>
              {splitRows.map((row, idx) => (
                <div key={idx} className="flex gap-1 items-center">
                  <select
                    value={row.type}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[idx] = { ...updated[idx], type: e.target.value };
                      setSplitRows(updated);
                    }}
                    className="flex-1 border rounded-md p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-400"
                  >
                    {paymentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.amount}
                    onChange={(e) => {
                      const updated = [...splitRows];
                      updated[idx] = { ...updated[idx], amount: e.target.value };
                      setSplitRows(updated);
                    }}
                    placeholder="Amount"
                    className="flex-1 border rounded-md p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  {splitRows.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSplitRows(splitRows.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 text-[10px] px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {splitRows.length < 5 && (
                <button
                  type="button"
                  onClick={() => setSplitRows([...splitRows, { type: 'CASH', amount: '' }])}
                  className="text-[10px] text-purple-600 hover:underline"
                >
                  + Add method
                </button>
              )}
              <div className="text-[10px] space-y-0.5 border-t border-purple-200 pt-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Total</span>
                  <span className="font-semibold">{formatCurrency(orderTotal.toFixed(2))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Entered</span>
                  <span>{formatCurrency(splitSum.toFixed(2))}</span>
                </div>
                {splitRemaining > 0.01 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Remaining</span>
                    <span className="font-semibold">{formatCurrency(splitRemaining.toFixed(2))}</span>
                  </div>
                )}
                {splitChange > 0.01 && (
                  <div className="flex justify-between text-green-600">
                    <span>💵 Change Due</span>
                    <span className="font-semibold">{formatCurrency(splitChange.toFixed(2))}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
          >
            <option value="PENDING">Pending</option>
            <option value="PREPARING">In Process</option>
            {!(user?.role === 'WAITER' && subdomain !== 'burger-hub') && (
              <option value="SERVED">Completed</option>
            )}
            <option value="CREDIT">Credit/Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          {/* Discount field - only shown when closing order (SERVED or CREDIT) */}
          {(selectedStatus === 'SERVED' || selectedStatus === 'CREDIT') && (
            <div>
              <label className="text-[10px] sm:text-xs text-gray-600 mb-1 block">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountPercentage}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 0 && value <= 100) {
                    setDiscountPercentage(value);
                  }
                }}
                className="w-full border rounded-md p-1 text-[10px] sm:text-xs focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                placeholder="Enter discount (0-100)"
              />
            </div>
          )}
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
              disabled={isUpdatingItems || (canEditOrDelete ? !['PENDING', 'PREPARING'].includes(order.status) : order.status !== 'PENDING')}
              className={`flex-1 flex justify-center items-center ${isUpdatingItems || (canEditOrDelete ? !['PENDING', 'PREPARING'].includes(order.status) : order.status !== 'PENDING') ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'
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