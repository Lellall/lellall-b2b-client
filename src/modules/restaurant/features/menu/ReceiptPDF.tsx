import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Receipt as Btn } from 'iconsax-react';
import { useGetBankDetailsQuery } from '@/redux/api/order/order.api';

const Receipt = ({ orderData, reactToPrintFn, bankDetails }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  // const { data: bankDetails, isLoading: isBankDetailsLoading, error: bankDetailsError } = useGetBankDetailsQuery(restaurantId);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div>
      {/* Inline style tag to ensure the media query is applied */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      <button
        onClick={reactToPrintFn}
        className="flex text-[10px] sm:text-xs text-[#05431E] hover:underline focus:outline-none"
      >
        <Btn size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Print
      </button>
      <div
        ref={componentRef}
        className="invisible h-0 w-0 overflow-hidden print:visible print:h-auto print:w-full"
      >
        <div className="w-full p-3 bg-white font-sans text-xs leading-tight">
          <h2 className="text-sm font-bold text-center mb-2">Payment Receipt</h2>
          {/* Bank Details Section */}
          {/* {isBankDetailsLoading ? (
            <p className="text-center text-gray-500">Loading bank details...</p>
          ) : bankDetailsError ? (
            <p className="text-center text-red-500">Bank details unavailable</p>
          ) : bankDetails ? (
            
          ) : null} */}
          <div className="mb-2 text-center">
            <p className="font-semibold">Bank Details</p>
            <p>Bank Name: {bankDetails?.bankName}</p>
            <p>Account Number: {bankDetails?.accountNumber}</p>
            <p>Account Name: {bankDetails?.accountName}</p>
          </div>
          <hr className="border-gray-300 my-1" />
          <div className="mb-2">
            <p>
              <span className="font-semibold">Date:</span> {formatDate(orderData.createdAt)}
            </p>
            <p>
              <span className="font-semibold">Waiter:</span> {orderData.waiter?.firstName || 'N/A'}{' '}
              {orderData.waiter?.lastName || ''}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {orderData.status}
            </p>
            {orderData.specialNote && (
              <p>
                <span className="font-semibold">Special Note:</span> {orderData.specialNote}
              </p>
            )}
          </div>
          <hr className="border-gray-300 my-1" />
          <table className="w-full border-collapse mb-2 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-1 text-left">Item</th>
                <th className="p-1 text-left">Qty</th>
                <th className="p-1 text-left">Price</th>
                <th className="p-1 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderData.orderItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="p-1 truncate">{item.menuItem.name}</td>
                  <td className="p-1">{item.quantity}</td>
                  <td className="p-1">₦{item.menuItem.price.toFixed(2)}</td>
                  <td className="p-1">₦{(item.quantity * item.menuItem.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr className="border-gray-300 my-1" />
          <div className="text-left">
            <p>
              <span className="font-semibold">Subtotal:</span> ₦{orderData.subtotal.toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">VAT (7.5%):</span> ₦{orderData.vatTax.toFixed(2)}
            </p>
            <p className="font-semibold">
              <span className="font-semibold">Total:</span> ₦{orderData.total.toFixed(2)}
            </p>
            <p className="mt-1">Thank you for dining with us!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;