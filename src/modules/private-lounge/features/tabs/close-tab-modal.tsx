import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { ActiveTab } from '../../../../redux/api/private-lounge/tabs.api';
import {
  useCheckOutWalkInMutation,
  useConfirmWalkInPaymentMutation,
} from '../../../../redux/api/private-lounge/walk-ins.api';

const formatCurrency = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

const METHODS = [
  { value: 'POS_TERMINAL', label: 'POS' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CASH', label: 'Cash' },
];

interface CloseTabModalProps {
  tab: ActiveTab | null;
  onClose: () => void;
}

export const CloseTabModal: React.FC<CloseTabModalProps> = ({ tab, onClose }) => {
  const [method, setMethod] = useState('POS_TERMINAL');
  const [reference, setReference] = useState('');
  const [confirmPayment, { isLoading: isConfirming }] = useConfirmWalkInPaymentMutation();
  const [checkOut, { isLoading: isCheckingOut }] = useCheckOutWalkInMutation();

  if (!tab) return null;

  // Entry already paid at the door: closing only ends the visit
  const alreadyPaid = tab.paymentConfirmed === true;
  const nothingToCollect = !alreadyPaid && tab.amountDue === 0;
  const isBusy = isConfirming || isCheckingOut;

  const handleClose = async () => {
    try {
      if (alreadyPaid) {
        await checkOut(tab.customer.id).unwrap();
      } else {
        await confirmPayment({
          id: tab.customer.id,
          paymentReference: reference.trim() || undefined,
          method: nothingToCollect ? 'MANUAL_OVERRIDE' : method,
        }).unwrap();
      }
      toast.success(`${tab.name}'s tab is closed`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Could not close this tab');
    }
  };

  const buttonLabel = isBusy
    ? 'Closing…'
    : alreadyPaid || nothingToCollect
      ? 'Close tab'
      : `Confirm ${formatCurrency(tab.amountDue)} received & close tab`;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4">
        <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Close tab</h2>
              <p className="text-sm text-gray-500">{tab.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {alreadyPaid ? 'Orders this visit' : 'To collect'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(alreadyPaid ? tab.orderTotal : tab.amountDue)}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {tab.orderCount} {tab.orderCount === 1 ? 'order' : 'orders'}
            </p>
          </div>

          {alreadyPaid && (
            <p className="text-sm text-gray-500 mb-5">
              Their entry is already paid, so this ends their visit.
            </p>
          )}

          {nothingToCollect && (
            <p className="text-sm text-gray-500 mb-5">
              Nothing to collect: they only had complimentary items.
            </p>
          )}

          {!alreadyPaid && !nothingToCollect && (
            <div className="space-y-4 mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">How did they pay?</p>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setMethod(value)}
                      className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        method === value
                          ? 'bg-[#05431E] text-white border-[#05431E]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {method !== 'CASH' && (
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={method === 'POS_TERMINAL' ? 'POS receipt number (optional)' : 'Transfer reference (optional)'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/30 focus:border-[#05431E]"
                />
              )}
            </div>
          )}

          <button
            onClick={handleClose}
            disabled={isBusy}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buttonLabel}
          </button>
          <p className="text-xs text-gray-400 mt-3 text-center">
            If they gave an email address, their final receipt is sent when the tab closes.
          </p>
        </div>
      </div>
    </>
  );
};
