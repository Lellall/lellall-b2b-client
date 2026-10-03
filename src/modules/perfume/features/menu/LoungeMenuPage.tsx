import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  ShoppingCart, X, Plus, Minus, Search,
  Star, Flame, Sparkles, ChevronRight,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';
import { useGetPerfumeInventoryItemsQuery } from '../../../../redux/api/perfume-store/inventory.api';
import { useCreatePerfumeOrderMutation } from '../../../../redux/api/perfume-store/orders.api';
import { useGetBankDetailsQuery } from '../../../../redux/api/bank-details/bank-details.api';
import { useGetPerfumeVatConfigQuery } from '../../../../redux/api/perfume-store/vat.api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface FragranceItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currentStock: number;
  tag?: 'bestseller' | 'new-arrival' | 'limited' | 'signature';
  concentration?: string; // EDP, EDT, Parfum etc. parsed from description
}

interface CartItem {
  item: FragranceItem;
  qty: number;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const BRAND_GREEN = '#05431E';
const BRAND_GREEN_LIGHT = '#0E5D37';

const formatCurrency = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

// Map inventory category to emoji for visual variety
const CATEGORY_ICON: Record<string, string> = {
  'Oud & Resinous': '🪔',
  'Floral': '🌸',
  'Fresh & Citrus': '🍋',
  'Oriental & Spicy': '✨',
  'Woody & Earthy': '🌿',
};

const TAG_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
  'bestseller': { label: 'Bestseller', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Star size={10} className="fill-amber-500 text-amber-500" /> },
  'new-arrival': { label: 'New Arrival', className: 'bg-[#05431E]/5 text-[#05431E] border-[#05431E]/20', icon: <Sparkles size={10} className="text-[#05431E]" /> },
  'limited': { label: 'Limited', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  'signature': { label: 'Signature', className: 'bg-red-50 text-red-700 border-red-200', icon: <Flame size={10} className="text-red-600" /> },
};

// Derive a tag from stock level for display
const deriveTag = (stock: number): FragranceItem['tag'] | undefined => {
  if (stock <= 3) return 'limited';
  return undefined;
};

// ─── FRAGRANCE CARD ───────────────────────────────────────────────────────────

const getLiquidColorClass = (name: string) => {
  const n = name.toLowerCase();
  
  // Keyword matching
  if (n.includes('oud') || n.includes('wood') || n.includes('musk')) return 'bg-gradient-to-br from-[#d4a373] to-[#8a5a19]';
  if (n.includes('rose') || n.includes('floral') || n.includes('blossom')) return 'bg-gradient-to-br from-[#ffb6c1] to-[#e67e98]';
  if (n.includes('fresh') || n.includes('aqua') || n.includes('blue')) return 'bg-gradient-to-br from-[#a8e6cf] to-[#3b8d99]';
  if (n.includes('vanilla') || n.includes('sweet')) return 'bg-gradient-to-br from-[#f5e3b5] to-[#e9c46a]';
  if (n.includes('night') || n.includes('noir') || n.includes('dark')) return 'bg-gradient-to-br from-[#7b2cbf] to-[#3c096c]';
  
  // Fallback beautiful palette
  const fallbackPalette = [
    'bg-gradient-to-br from-[#f0e6d2] to-[#d4af37]', // Classic Gold
    'bg-gradient-to-br from-[#ffcfd2] to-[#f19cbb]', // Soft Pink
    'bg-gradient-to-br from-[#d8e2dc] to-[#a3b18a]', // Sage Green
    'bg-gradient-to-br from-[#e0c3fc] to-[#8ecae6]', // Lilac/Blue
    'bg-gradient-to-br from-[#ffecd1] to-[#ffb5a7]', // Peach
    'bg-gradient-to-br from-[#caf0f8] to-[#90e0ef]', // Light Cyan
    'bg-gradient-to-br from-[#e9edc9] to-[#ccd5ae]', // Moss
    'bg-gradient-to-br from-[#fcd5ce] to-[#f08080]', // Coral
  ];

  // Simple string hash to pick a deterministic color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % fallbackPalette.length;
  return fallbackPalette[index];
};

const FragranceCard: React.FC<{
  item: FragranceItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}> = ({ item, qty, onAdd, onRemove }) => {
  const liquidClass = getLiquidColorClass(item.name);
  const outOfStock = item.currentStock <= 0;

  return (
    <div className={`relative w-full h-[320px] flex flex-col items-center justify-end pb-5 ${outOfStock ? 'opacity-50 grayscale-[50%]' : ''} group`}>
      {/* Bottle Cap */}
      <div className="w-[42px] h-[30px] rounded-t-md relative z-10 shadow-sm" style={{ background: 'linear-gradient(to right, #c5a059, #f3e5ab, #c5a059)' }}>
        <div className="absolute -bottom-[4px] -left-[2px] -right-[2px] h-[6px] rounded-sm" style={{ background: 'linear-gradient(to right, #a67c00, #d4af37, #a67c00)' }} />
      </div>

      {/* Bottle Neck */}
      <div className="w-[22px] h-[14px] bg-white/70 border-l-2 border-r-2 border-white/90 z-0 relative shadow-inner" />

      {/* Bottle Body */}
      <div className="w-[160px] h-[200px] relative flex flex-col items-center justify-center overflow-hidden rounded-t-[45px] rounded-b-[12px] border border-white/50 border-t-2 border-t-white/80 bg-white/10 backdrop-blur-md shadow-[inset_0_0_15px_rgba(255,255,255,0.6),inset_-8px_-8px_20px_rgba(0,0,0,0.05),0_15px_30px_rgba(0,0,0,0.08)] transition-transform duration-300 group-hover:-translate-y-2">
        
        {/* Liquid */}
        <div className={`absolute bottom-0 left-0 right-0 h-[70%] rounded-b-[8px] opacity-85 z-0 transition-all duration-300 group-hover:h-[73%] group-hover:opacity-95 ${liquidClass}`} />
        
        {/* Glass reflection highlight */}
        <div className="absolute top-[5%] left-[12%] w-[25%] h-[85%] rounded-full skew-x-[-12deg] z-10 pointer-events-none bg-gradient-to-r from-transparent via-white/50 to-transparent" />

        {/* Label */}
        <div className="w-[85%] bg-white rounded-sm relative z-20 text-center shadow-lg border border-black/5 flex flex-col items-center justify-center p-3 gap-1">
          <div className="absolute top-1 left-1 right-1 bottom-1 border border-[#d4af37]/30 pointer-events-none" />
          <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em]">{item.brand}</p>
          <h3 className="font-serif font-bold text-gray-900 text-sm leading-tight">{item.name}</h3>
          {item.concentration && (
            <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">
              {item.concentration}
            </span>
          )}
          <p className="text-xs font-bold text-[#d4af37] mt-1">{formatCurrency(item.price)}</p>
        </div>
      </div>

      {/* Out of Stock Badge */}
      {outOfStock && (
        <div className="absolute top-3 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-md rotate-12 z-30">
          SOLD OUT
        </div>
      )}

      {/* Cart Controls Floating Overlay */}
      {!outOfStock && (
        <div className="absolute -bottom-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-30 flex items-center justify-center">
          {qty > 0 ? (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl px-3 py-1.5 border border-gray-100">
              <button onClick={onRemove} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all active:scale-90">
                <Minus size={16} />
              </button>
              <span className="text-sm font-bold text-gray-900 min-w-[24px] text-center">{qty}</span>
              <button onClick={onAdd} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-all active:scale-90">
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-[#111827] text-white shadow-xl hover:bg-[#1f2937] hover:-translate-y-1 transition-all active:scale-95"
            >
              <Plus size={16} />
              Add to Bag
            </button>
          )}
        </div>
      )}

      {/* Cart qty indicator badge when not hovered */}
      {qty > 0 && (
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg bg-[#05431E] z-30 group-hover:opacity-0 transition-opacity">
          {qty}
        </div>
      )}
    </div>
  );
};

// ─── CATEGORY PILL ────────────────────────────────────────────────────────────

const CategoryPill: React.FC<{ label: string; active: boolean; count: number; onClick: () => void }> = ({ label, active, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 min-h-[32px] ${active
      ? 'text-white border-transparent shadow-sm'
      : 'bg-white text-gray-600 border-gray-200 hover:border-[#05431E]/40 hover:text-[#05431E] active:scale-95'}`}
    style={active ? { background: BRAND_GREEN, borderColor: BRAND_GREEN } : {}}
  >
    {label}
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
  </button>
);

// ─── ORDER / CART PANEL ───────────────────────────────────────────────────────

const PAYMENT_OPTS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'DELIVERY', label: 'Delivery' },
];

const CartPanel: React.FC<{
  cart: CartItem[];
  onRemove: (id: string) => void;
  onIncrease: (item: any) => void;
  onDecrease: (item: any) => void;
  onClear: () => void;
  total: number;
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
  restaurantId: string;
}> = ({ cart, onRemove, onIncrease, onDecrease, onClear, total, isOpen, onClose, storeId, storeName, restaurantId }) => {
  const [createOrder, { isLoading }] = useCreatePerfumeOrderMutation();
  const { data: vatConfig } = useGetPerfumeVatConfigQuery(storeId, { skip: !storeId });
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  const vatRate = vatConfig?.vatEnabled ? vatConfig.vatRate : 0;
  const vatAmount = total * vatRate;
  const grandTotal = total + vatAmount;

  const handleConfirmSale = async () => {
    if (!storeId) return;
    try {
      const payload: any = {
        storeId,
        totalAmount: grandTotal,
        paymentMethod,
        items: cart.map(({ item, qty }) => ({
          inventoryItemId: item.id,
          quantity: qty,
          unitPrice: item.price,
        })),
      };
      const result = await createOrder(payload).unwrap();
      toast.success('Sale completed!');
      setReceiptOrder({ ...result, paymentMethod });
      onClear();
    } catch (err: any) {
      console.error('Sale error', err);
      toast.error(err?.data?.message || 'Failed to process sale. Please try again.');
    }
  };

  const itemCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-[0_0_40px_rgba(0,0,0,0.06)] z-50 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-100 relative">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: BRAND_GREEN }} />
          <div>
            <h2 className="font-bold text-xl text-gray-900">View Order</h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest">{itemCount} selection{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 pb-20">
              <div className="w-16 h-16 rounded-full bg-gray-50 shadow-sm flex items-center justify-center mb-4 border border-gray-100">
                <ShoppingCart size={24} className="text-gray-300" />
              </div>
              <p className="text-sm uppercase tracking-widest font-semibold text-gray-400">Bag is empty</p>
            </div>
          ) : (
            cart.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm group">
                <div className={`w-10 h-12 rounded-t-xl rounded-b-sm shadow-inner relative flex justify-center items-end pb-1 border border-white/40 ${getLiquidColorClass(item.name)}`}>
                   <div className="w-3 h-2 bg-white/50 rounded-t-sm absolute -top-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{item.brand}</p>
                  <p className="text-gray-900 text-sm font-semibold truncate leading-tight mt-0.5">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-900 font-bold text-sm" style={{ color: BRAND_GREEN }}>{formatCurrency(item.price)}</p>
                    <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 text-xs transition-colors underline opacity-0 group-hover:opacity-100">Remove</button>
                  </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 p-0.5">
                      <button onClick={() => onDecrease(item)} className="w-7 h-7 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-gray-500 transition-all active:scale-95">
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold text-gray-900 min-w-[20px] text-center">{qty}</span>
                      <button onClick={() => onIncrease(item)} className="w-7 h-7 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-gray-500 transition-all active:scale-95">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-gray-500 flex-1 text-right">
                      {formatCurrency(item.price * qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 space-y-5 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            {/* Payment Type */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 text-center">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_OPTS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPaymentMethod(opt.value)}
                    className="py-2.5 rounded-lg text-xs font-bold border transition-all"
                    style={paymentMethod === opt.value
                      ? { background: BRAND_GREEN, color: '#fff', borderColor: BRAND_GREEN }
                      : { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="w-full h-px border-t border-dashed border-gray-200" />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-semibold">Subtotal</span>
                <span className="text-gray-600 font-semibold">{formatCurrency(total)}</span>
              </div>
              {vatRate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-semibold">VAT ({(vatRate * 100).toFixed(1)}%)</span>
                  <span className="text-gray-600 font-semibold">{formatCurrency(vatAmount)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end pb-1">
              <span className="text-gray-400 text-sm font-bold">Grand Total</span>
              <span className="text-gray-900 font-bold text-2xl" style={{ color: BRAND_GREEN }}>{formatCurrency(grandTotal)}</span>
            </div>
            
            <button
              disabled={isLoading}
              onClick={handleConfirmSale}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
              style={{ background: BRAND_GREEN }}
            >
              {isLoading ? 'Processing...' : 'Complete Sale'}
            </button>
            <button onClick={onClear} className="w-full text-xs text-gray-400 hover:text-red-600 transition-colors py-1 font-medium tracking-wide uppercase">
              Clear Selections
            </button>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <ReceiptModal 
          order={receiptOrder} 
          storeName={storeName}
          restaurantId={restaurantId}
          storeId={storeId}
          onClose={() => { setReceiptOrder(null); onClose(); }} 
        />
      )}
    </>
  );
};

// ─── RECEIPT MODAL ────────────────────────────────────────────────────────────

export const ReceiptModal: React.FC<{ order: any; storeName: string; restaurantId: string; storeId?: string; onClose: () => void }> = ({ order, storeName, restaurantId, storeId, onClose }) => {
  const { data: bankData } = useGetBankDetailsQuery(restaurantId, { skip: !restaurantId });
  const contentRef = useRef<HTMLDivElement>(null);
  // Same print pipeline as the restaurant receipts (react-to-print).
  const reactToPrintFn = useReactToPrint({ contentRef });

  // Use hardcoded bank details for specific perfume store
  const hardcodedBankDetails = storeId === '140558b6-f4e6-410c-9397-96654921a52f'
    ? { bankName: 'TAJ BANK', accountNumber: '0002897287', accountName: 'RAKIYA SULEIMAN SAJE' }
    : null;

  const bankDetails = bankData?.bankDetails?.[0] || hardcodedBankDetails;

  const money = (n: number) =>
    '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paymentType = order.paymentMethod || 'CASH';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[70] px-4">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto">
            {/* Same layout as the 355 Steakhouse (restaurant) receipt */}
            <div ref={contentRef}>
              <div className="w-full p-3 bg-white font-sans text-xs leading-tight relative">
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <div className="inline-block">
                      <h1 className="text-[30px] font-extrabold tracking-widest leading-tight" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                        {storeName}
                      </h1>
                    </div>
                  </div>
                  <div className="mb-2 text-right">
                    {bankDetails && (
                      <>
                        <p className="font-semibold">Bank Details</p>
                        <p>Bank Name: {bankDetails.bankName}</p>
                        <p>Account Number: {bankDetails.accountNumber}</p>
                        {bankDetails.accountName && <p>Account Name: {bankDetails.accountName}</p>}
                      </>
                    )}
                    <p>Payment Type: {paymentType}</p>
                  </div>
                  <hr className="border-gray-300 my-1" />
                  <div className="mb-2">
                    <p>
                      <span className="font-semibold">Date:</span>{' '}
                      {new Date(order.createdAt || Date.now()).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <p>
                      <span className="font-semibold">Order:</span> {(order.id || '').substring(0, 8).toUpperCase()}
                    </p>
                    {order.client && (
                      <p>
                        <span className="font-semibold">Client:</span> {order.client.firstName} {order.client.lastName}
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
                      {(order.items || []).map((li: any) => (
                        <tr key={li.id} className="border-b border-gray-200">
                          <td className="p-1">{li.inventoryItem?.name || 'Item'}</td>
                          <td className="p-1">{li.quantity}</td>
                          <td className="p-1">{money(li.unitPrice)}</td>
                          <td className="p-1">{money(li.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <hr className="border-gray-300 my-1" />
                  <div className="text-left">
                    {order.subtotal !== undefined && (
                      <p>
                        <span className="font-semibold">Subtotal:</span> {money(order.subtotal)}
                      </p>
                    )}
                    {order.vatRate > 0 && (
                      <p>
                        <span className="font-semibold">VAT ({(order.vatRate * 100).toFixed(2)}%):</span> {money(order.vatAmount)}
                      </p>
                    )}
                    <p className="font-semibold">
                      <span className="font-semibold">Total:</span> {money(order.totalAmount)}
                    </p>
                    <p className="mt-1">Thank you!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-3 border-t border-gray-100">
            <button
              onClick={() => reactToPrintFn()}
              className="w-full py-3 rounded-xl border-2 font-bold text-sm transition-all hover:opacity-90"
              style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
              style={{ background: BRAND_GREEN }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const PerfumeMenuPage: React.FC = () => {
  const { user, restaurant } = useSelector((state: RootState) => state.auth);
  const storeId = user?.perfumeStoreId || restaurant?.id || '';

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: rawInventory = [], isLoading: isLoadingInventory } = useGetPerfumeInventoryItemsQuery(storeId, { skip: !storeId });


  // Map raw inventory into FragranceItem shape
  const inventory: FragranceItem[] = (rawInventory as any[]).map(i => ({
    id: i.id,
    name: i.name,
    brand: i.brand || 'Unknown Brand',
    category: i.category || 'Uncategorized',
    price: i.cost,
    currentStock: i.currentStock,
    concentration: i.description, // e.g. "EDP", "EDT", "Parfum"
  }));

  const categories = ['All', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filtered = inventory.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // Group by category for section headers
  const grouped = filtered.reduce<Record<string, FragranceItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (isLoadingInventory) {
    return (
      <div className="flex justify-center items-center h-[80vh] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: BRAND_GREEN }}></div>
      </div>
    );
  }

  const getQty = (id: string) => cart.find(c => c.item.id === id)?.qty || 0;

  const handleAdd = (item: FragranceItem) => {
    if (item.currentStock === 0) return;
    setCart(prev => {
      const ex = prev.find(c => c.item.id === item.id);
      if (ex) {
        if (ex.qty >= item.currentStock) {
          toast.warning(`Only ${item.currentStock} units in stock`);
          return prev;
        }
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const handleRemove = (item: FragranceItem) => {
    setCart(prev => {
      const ex = prev.find(c => c.item.id === item.id);
      if (!ex || ex.qty <= 1) return prev.filter(c => c.item.id !== item.id);
      return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty - 1 } : c);
    });
  };

  const totalCount = cart.reduce((s, c) => s + c.qty, 0);
  const totalAmount = cart.reduce((s, { item, qty }) => s + item.price * qty, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fragrance Catalogue</h1>
          <p className="text-xs text-gray-500 mt-1">Browse inventory and process a sale</p>
        </div>
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(to right, #05431E, #0E5D37)' }}
        >
          <ShoppingCart size={18} />
          View Order ({totalCount})
        </button>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by fragrance name or brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none transition-all text-sm min-h-[40px]"
            style={{ '--tw-ring-color': `${BRAND_GREEN}30` } as any}
          />
        </div>
      </div>

      {/* ── Category pills ────────────────────────────────────────────── */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {categories.map(cat => (
          <CategoryPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            count={cat === 'All' ? inventory.length : inventory.filter(i => i.category === cat).length}
            onClick={() => setActiveCategory(cat)}
          />
        ))}
      </div>

      {/* ── Grouped product grid ──────────────────────────────────────── */}
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-lg">{CATEGORY_ICON[category] || '🌸'}</span>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.1em]">{category}</h2>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">{catItems.length} fragrances</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {catItems.map(item => (
              <FragranceCard
                key={item.id}
                item={item}
                qty={getQty(item.id)}
                onAdd={() => handleAdd(item)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <Search size={44} className="mb-4" />
          {search ? (
            <>
              <p className="text-lg font-semibold text-gray-400">No results for "{search}"</p>
              <p className="text-base mt-1 text-gray-300">Try a different search or category</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-400">No inventory items yet</p>
              <p className="text-base mt-1 text-gray-300">Add items from the Inventory page</p>
            </>
          )}
        </div>
      )}

      {/* ── Cart / Order panel ────────────────────────────────────────── */}
      <CartPanel
        cart={cart}
        onRemove={(id) => setCart(prev => prev.filter(c => c.item.id !== id))}
        onIncrease={handleAdd}
        onDecrease={handleRemove}
        onClear={() => setCart([])}
        total={totalAmount}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeId={storeId}
        storeName={restaurant?.name || (user?.firstName ? `${user?.firstName}'s Store` : 'Perfume Store')}
        restaurantId={restaurant?.id || ''}
      />
    </div>
  );
};

export default PerfumeMenuPage;
