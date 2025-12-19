import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useReactToPrint } from 'react-to-print';

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

interface Order {
  id: string;
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
  paymentType?: string | null;
}

interface CombinedReceiptProps {
  orders: Order[];
  bankDetails: BankDetail[] | BankDetail | null;
  subdomain: string;
  onClose?: () => void;
}

export interface CombinedReceiptHandle {
  print: () => void;
}

const CombinedReceipt = forwardRef<CombinedReceiptHandle, CombinedReceiptProps>(
  ({ orders, bankDetails, subdomain, onClose }, ref) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const reactToPrintFn = useReactToPrint({ contentRef: componentRef });

    useImperativeHandle(ref, () => ({
      print: () => {
        reactToPrintFn();
      },
    }));

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    };

    // Sort orders by date (oldest first)
    const sortedOrders = [...orders].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Combine all order items
    const combinedItems = sortedOrders.reduce((acc, order) => {
      order.orderItems.forEach((item) => {
        const existingItem = acc.find((i) => i.menuItem.name === item.menuItem.name && i.menuItem.price === item.menuItem.price);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          acc.push({
            ...item,
            orderId: order.id, // Keep track of which order this item came from
          });
        }
      });
      return acc;
    }, [] as (OrderItem & { orderId: string })[]);

    // Calculate combined totals
    const combinedSubtotal = sortedOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const combinedDiscountAmount = sortedOrders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);
    const combinedVatTax = sortedOrders.reduce((sum, order) => sum + order.vatTax, 0);
    const combinedServiceFee = sortedOrders.reduce((sum, order) => sum + order.serviceFee, 0);
    const combinedTotal = sortedOrders.reduce((sum, order) => sum + order.total, 0);
    const combinedDiscountPercentage = combinedSubtotal > 0 
      ? (combinedDiscountAmount / combinedSubtotal) * 100 
      : 0;

    // Get unique waiters
    const waiters = Array.from(
      new Set(
        sortedOrders
          .map((order) => 
            order.waiter 
              ? `${order.waiter.firstName || ''} ${order.waiter.lastName || ''}`.trim()
              : 'N/A'
          )
          .filter((w) => w !== 'N/A')
      )
    );

    // Get unique payment types
    const paymentTypes = Array.from(
      new Set(sortedOrders.map((order) => order.paymentType || 'CASH').filter(Boolean))
    );

    // Get all special notes
    const specialNotes = sortedOrders
      .map((order) => order.specialNote)
      .filter(Boolean)
      .filter((note, index, self) => self.indexOf(note) === index);

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
        <div
        ref={componentRef}
        className="invisible h-0 w-0 overflow-hidden print:visible print:h-auto print:w-full"
      >
        <div className="w-full p-3 bg-white font-sans text-xs leading-tight relative">
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="inline-block">
                <h1 className="text-[30px] font-extrabold tracking-widest leading-tight" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                  {subdomain} {subdomain === '355' ? 'Steakhouse' : ''}
                </h1>
                <p className="text-sm font-semibold mt-1">Combined Receipt</p>
                <p className="text-xs mt-1">Orders: {sortedOrders.map((o) => `#${o.id.substring(0, 6)}`).join(', ')}</p>
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
                    {index === 0 && paymentTypes.length > 0 && (
                      <p>Payment Type(s): {paymentTypes.join(', ')}</p>
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <p>Bank Name: {(bankDetails as BankDetail)?.bankName || 'N/A'}</p>
                  <p>Account Number: {(bankDetails as BankDetail)?.accountNumber || 'N/A'}</p>
                  <p>Account Name: {(bankDetails as BankDetail)?.accountName || 'N/A'}</p>
                  {paymentTypes.length > 0 && (
                    <p>Payment Type(s): {paymentTypes.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
            <hr className="border-gray-300 my-1" />
            <div className="mb-2">
              <p>
                <span className="font-semibold">Date Range:</span> {formatDate(sortedOrders[0]?.createdAt || '')} 
                {sortedOrders.length > 1 && ` - ${formatDate(sortedOrders[sortedOrders.length - 1]?.createdAt || '')}`}
              </p>
              {waiters.length > 0 && (
                <p>
                  <span className="font-semibold">Waiter(s):</span> {waiters.join(', ')}
                </p>
              )}
              <p>
                <span className="font-semibold">Number of Orders:</span> {sortedOrders.length}
              </p>
              {specialNotes.length > 0 && (
                <div>
                  <p className="font-semibold">Special Notes:</p>
                  {specialNotes.map((note, idx) => (
                    <p key={idx} className="pl-2">- {note}</p>
                  ))}
                </div>
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
                {combinedItems.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className="border-b border-gray-200">
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
                <span className="font-semibold">Subtotal:</span> ₦{combinedSubtotal.toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">Discount ({combinedDiscountPercentage.toFixed(1)}%):</span> ₦{combinedDiscountAmount.toFixed(2)}
              </p>
              <p>
                <span className="font-semibold">VAT:</span> ₦{combinedVatTax.toFixed(2)}
              </p>
              {subdomain !== "355" && (
                <p>
                  <span className="font-semibold">Service Fee:</span> ₦{combinedServiceFee.toFixed(2)}
                </p>
              )}
              <p className="font-semibold">
                <span className="font-semibold">Total:</span> ₦{combinedTotal.toFixed(2)}
              </p>
              {subdomain === "355" ? (
                <div className="text-right" style={{ marginTop: '-10px' }}>
                  <p className="font-bold text-sm" style={{ color: '#ff6b35', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', fontWeight: '800' }}>
                    🎉 Thank you for dining with us! 🎉
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
  }
);

CombinedReceipt.displayName = 'CombinedReceipt';

export default CombinedReceipt;

