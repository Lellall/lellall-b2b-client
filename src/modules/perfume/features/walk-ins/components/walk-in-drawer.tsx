import React from 'react';
import { X, Phone, User as UserIcon, Users, AlignLeft } from 'lucide-react';
import { Profile2User, TickCircle, CloseCircle, Clock } from 'iconsax-react';
import { toast } from 'react-toastify';

interface WalkInDrawerProps {
  walkIn: any | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onConfirmPayment?: (id: string, ref: string, method: string) => void;
  onLogDish?: (id: string, dishName: string, notes: string) => void;
}

export const WalkInDrawer: React.FC<WalkInDrawerProps> = ({ 
  walkIn, 
  isOpen, 
  onClose,
  onStatusChange,
  onConfirmPayment,
  onLogDish
}) => {
  if (!isOpen || !walkIn) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#F9FAFB] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto border-l border-gray-200 flex flex-col`}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-10 px-6 py-5 border-b border-gray-100 flex justify-between items-center shadow-sm shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Walk-In Details</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-red-50 rounded-full transition-colors text-gray-500 hover:text-red-500 border border-transparent hover:border-red-100"
          >
            <X size="20" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Status Banner */}
          <div className={`mb-6 rounded-xl p-4 flex items-center justify-between border ${
            walkIn.status === 'CHECKED_IN' ? 'bg-green-50 border-green-200' :
            walkIn.status === 'COMPLETED' ? 'bg-gray-50 border-gray-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                walkIn.status === 'CHECKED_IN' ? 'text-green-800' :
                walkIn.status === 'COMPLETED' ? 'text-gray-800' :
                'text-red-800'
              }`}>
                Current Status
              </p>
              <p className={`text-sm font-semibold flex items-center gap-2 ${
                walkIn.status === 'CHECKED_IN' ? 'text-green-900' :
                walkIn.status === 'COMPLETED' ? 'text-gray-900' :
                'text-red-900'
              }`}>
                {(walkIn.status === 'CHECKED_IN' || walkIn.status === 'COMPLETED') && <TickCircle size="18" variant="Bold" />}
                {walkIn.status === 'VOIDED' && <CloseCircle size="18" variant="Bold" />}
                {walkIn.status === 'CHECKED_IN' ? 'ACTIVE (IN LOUNGE)' : walkIn.status === 'COMPLETED' ? 'PAID & CHECKED OUT' : walkIn.status}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Arrival Time</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(walkIn.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
              <UserIcon size="14" /> Primary Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400">Guest Name</p>
                <p className="text-lg font-bold text-gray-900">{walkIn.fullName}</p>
                <div className="flex gap-4 items-center">
                  <p className="text-xs font-mono text-gray-400">ID: {walkIn.id}</p>
                  <span className="text-xs font-bold text-[#05431E] bg-[#05431E]/10 px-2 py-0.5 rounded-md">Code: {walkIn.accessCode}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{walkIn.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate pr-2">{walkIn.email || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
              <Users size="14" /> Bill Summary
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Check-in Fees</p>
                {walkIn.adultCount > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded mb-1">
                    <span>{walkIn.adultCount}x Adult</span>
                    <span>₦{(walkIn.adultCount * 20000).toLocaleString()}</span>
                  </div>
                )}
                {walkIn.childrenCount > 0 && (
                  <div className="flex justify-between items-center text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded mb-1">
                    <span>{walkIn.childrenCount}x Child</span>
                    <span>₦{(walkIn.childrenCount * 10000).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {walkIn.orders && walkIn.orders.length > 0 && (
                <div className="pt-4 border-t border-gray-50 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu Orders</p>
                  {walkIn.orders.map((order: any, idx: number) => (
                    <div key={order.id || idx} className="mb-2">
                      {order.items?.map((item: any, iIdx: number) => (
                        <div key={iIdx} className="flex justify-between items-center text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded mb-1">
                          <span>{item.quantity}x {item.inventoryItem?.name || 'Item'}</span>
                          <span>₦{(item.totalPrice || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center text-base font-black text-gray-900 pt-4 border-t border-gray-200 mt-4">
                <span>Grand Total:</span>
                <span>
                  ₦{(
                    (walkIn.amount || 0) + 
                    (walkIn.orders?.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0) || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {walkIn.notes && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
                <AlignLeft size="14" /> Notes & Conditions
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {walkIn.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-white border-t border-gray-200 shrink-0">
          {walkIn.status === 'CHECKED_IN' && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  onConfirmPayment?.(walkIn.id, '', 'POS_TERMINAL');
                }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors shadow-md"
              >
                Confirm Payment & Close Tab
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
