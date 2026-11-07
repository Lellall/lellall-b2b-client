import React from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useCheckOutMemberMutation } from '../../../../redux/api/private-lounge/members.api';

const formatCurrency = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

interface MemberCloseTabModalProps {
  visitId: string;
  name: string;
  // Shown when known, so staff can see what is on the tab
  orderTotal?: number;
  orderCount?: number;
  onClose: () => void;
  onClosed?: () => void;
}

// Closing a member's tab is one step. The member is emailed their receipt, so they know it is closed.
export const MemberCloseTabModal: React.FC<MemberCloseTabModalProps> = ({
  visitId,
  name,
  orderTotal,
  orderCount,
  onClose,
  onClosed,
}) => {
  const [checkOut, { isLoading }] = useCheckOutMemberMutation();

  const handleClose = async () => {
    try {
      await checkOut(visitId).unwrap();
      toast.success(`${name}'s tab is closed and their receipt has been emailed`);
      onClosed?.();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Could not close this tab');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[70] px-4">
        <div className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Close tab</h2>
              <p className="text-sm text-gray-500">{name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Cancel"
            >
              <X size={16} />
            </button>
          </div>

          {orderTotal !== undefined && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">On the tab</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(orderTotal)}</p>
              </div>
              {orderCount !== undefined && (
                <p className="text-sm text-gray-500">
                  {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-600 mb-5">
            Close {name}'s tab? They are emailed their receipt straight away, so they know it is closed.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Closing…' : 'Close tab'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
