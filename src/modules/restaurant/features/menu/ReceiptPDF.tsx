import { useRef } from 'react';
import { Receipt as Btn } from 'iconsax-react';

interface BankDetail {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  menuItem: {
    name: string;
    price: number;
  };
}

interface OrderData {
  createdAt: string;
  waiter?: {
    firstName?: string;
    lastName?: string;
  };
  status: string;
  specialNote?: string;
  orderItems: OrderItem[];
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  vatTax: number;
  serviceFee: number;
  total: number;
  paymentType: string;
}

const Receipt = ({ orderData, reactToPrintFn, bankDetails, subdomain, orderId }: {
  orderData: OrderData;
  reactToPrintFn: () => void;
  bankDetails: BankDetail[] | BankDetail | null;
  subdomain: string;
  orderId?: string;
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div>
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
        data-order-id={orderId}
        className="flex text-[10px] sm:text-xs text-[#05431E] hover:underline focus:outline-none"
      >
        <Btn size={14} className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Print
      </button>
      <div
        ref={componentRef}
        className="invisible h-0 w-0 overflow-hidden print:visible print:h-auto print:w-full"
      >
        <div className="w-full p-3 bg-white font-sans text-xs leading-tight relative">
          {/* Background watermark for 355 */}
          {subdomain === "355" && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ 
                opacity: 0.08,
                zIndex: 0,
                fontSize: '120px',
                fontWeight: '900',
                color: '#ff6b35',
                fontFamily: 'Arial, sans-serif',
                letterSpacing: '10px'
              }}
            >
              @10
            </div>
          )}
          <div className="relative z-10">
          <div className="text-center mb-4">
            <div className="inline-block">
              <h1 className="text-[30px] font-extrabold tracking-widest leading-tight" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                {subdomain} {subdomain === '355' ? 'Steakhouse' : ''}
              </h1>
            </div>
          </div>
          <div className="mb-2 text-right">
            <p className="font-semibold">Bank Details</p>
            {bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0 ? (
              bankDetails.map((bank, index) => (
                <div key={bank.id || index} className="mb-2">
                  <p>Bank Name: {bank.bankName}</p>
                  <p>Account Number: {bank.accountNumber}</p>
                  <p>Account Name: {bank.accountName}</p>
                  {index === 0 && <p>Payment Type: {orderData.paymentType}</p>}
                </div>
              ))
            ) : (
              <div>
                <p>Bank Name: {(bankDetails as BankDetail)?.bankName || 'N/A'}</p>
                <p>Account Number: {(bankDetails as BankDetail)?.accountNumber || 'N/A'}</p>
                <p>Account Name: {(bankDetails as BankDetail)?.accountName || 'N/A'}</p>
                <p>Payment Type: {orderData.paymentType}</p>
              </div>
            )}
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
              {orderData.orderItems.map((item: OrderItem) => (
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
              <span className="font-semibold">Discount ({orderData.discountPercentage ?? 0}%):</span> ₦{(orderData.discountAmount ?? 0).toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">VAT:</span> ₦{orderData.vatTax.toFixed(2)}
            </p>
            {subdomain !== "355" && (
              <p>
                <span className="font-semibold">Service Fee:</span> ₦{orderData.serviceFee.toFixed(2)}
              </p>
            )}
            <p className="font-semibold">
              <span className="font-semibold">Total:</span> ₦{orderData.total.toFixed(2)}
            </p>
            {subdomain === "355" ? (
              <div className="text-right" style={{ marginTop: '-10px' }}>
                <p className="font-bold text-sm" style={{ color: '#ff6b35', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', fontWeight: '800' }}>
                  🎉 Thank you for dining with us! 🎉
                </p>
                <p className="text-xs font-semibold mt-1" style={{ color: '#2d3748', letterSpacing: '2px', fontWeight: '700' }}>
                  ✨ 355 @ 10: ✨
                </p>
                <p className="text-xs font-medium italic" style={{ color: '#1a365d', lineHeight: '1.3', fontWeight: '600' }}>
                  Your patronage for the past 10 years<br/>
                  is well celebrated thanks! 🏆
                </p>
              </div>
            ) : (
              <p className="mt-1">Thank you for dining with us!</p>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;