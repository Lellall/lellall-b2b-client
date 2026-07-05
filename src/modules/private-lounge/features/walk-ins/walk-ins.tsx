import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Eye } from 'lucide-react';
import { DocumentText, TickCircle, CloseCircle, Clock, Profile2User } from 'iconsax-react';
import { WalkInDrawer } from './components/walk-in-drawer';
import { NewWalkInModal } from './components/new-walk-in-modal';
import { useGetTodaysWalkInsQuery, useCheckOutWalkInMutation, useConfirmWalkInPaymentMutation, useLogDishSelectionMutation, useCreateWalkInMutation } from '../../../../redux/api/private-lounge/walk-ins.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';

// ─── STATUS BADGE COMPONENT ───────────────────────────────────────────────────
const StatusBadge = ({ status, paymentConfirmed }: { status: string; paymentConfirmed?: boolean }) => {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
        <TickCircle size="14" variant="Bold" />
        COMPLETED
      </span>
    );
  }
  if (status === 'VOIDED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
        <CloseCircle size="14" variant="Bold" />
        VOIDED
      </span>
    );
  }
  if (status === 'CHECKED_IN') {
    if (paymentConfirmed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
          <TickCircle size="14" variant="Bold" />
          PAID & ACTIVE
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size="14" variant="Bold" />
          PENDING PAYMENT
        </span>
      );
    }
  }
  return null;
};

// ─── WALK-INS LIST ────────────────────────────────────────────────────────────
export const WalkIns: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: response, isLoading } = useGetTodaysWalkInsQuery(user?.privateLoungeId || '', {
    skip: !user?.privateLoungeId,
    pollingInterval: 30000,
  });

  const [checkoutWalkIn] = useCheckOutWalkInMutation();
  const [confirmPayment] = useConfirmWalkInPaymentMutation();
  const [logDish] = useLogDishSelectionMutation();

  const walkins = useMemo(() => {
    if (!response?.walkIns) return [];
    return response.walkIns.map((w: any) => ({
      id: w.id,
      fullName: w.guestName || 'Walk-in Guest',
      phone: w.guestPhone || '-',
      email: w.guestEmail || '-',
      timeIn: w.accessDate,
      expectedPartySize: 1, // Walkins are typically single day passes, but can be adjusted
      referredBy: null, // Backend doesn't support referrals for walk-ins yet
      status: w.status,
      notes: w.notes,
      paymentConfirmed: w.paymentConfirmed,
      dishSelectionsUsed: w.dishSelectionsUsed,
      maxDishSelections: w.maxDishSelections,
      dishSelections: w.dishSelections,
    }));
  }, [response]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedWalkIn, setSelectedWalkIn] = useState<any | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const filteredWalkins = useMemo(() => {
    return walkins.filter((w) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        w.fullName.toLowerCase().includes(term) ||
        w.id.toLowerCase().includes(term);
      const matchesStatus = selectedStatus === 'ALL' || w.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, walkins]);

  // Counts
  const counts = useMemo(() => ({
    total: response?.totalWalkIns || 0,
    waiting: response?.pendingPayments || 0,
    admitted: response?.confirmedPayments || 0,
    revenue: response?.totalRevenue || 0,
  }), [response]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // We only handle checkout from here
    if (newStatus === 'COMPLETED') {
      try {
        await checkoutWalkIn(id).unwrap();
        toast.success('Walk-in checked out successfully');
        if (selectedWalkIn && selectedWalkIn.id === id) {
           setSelectedWalkIn({ ...selectedWalkIn, status: 'COMPLETED' });
        }
      } catch (error: any) {
        toast.error(error?.data?.message || 'Failed to checkout');
      }
    }
  };

  const [createWalkIn] = useCreateWalkInMutation();

  const handleAddNew = async (data: any) => {
    if (!user?.privateLoungeId) return;
    try {
      await createWalkIn({ 
        loungeId: user.privateLoungeId,
        guestName: data.fullName,
        guestPhone: data.phone,
        guestEmail: data.email,
        notes: data.notes
      }).unwrap();
      setIsNewModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to check-in guest');
      throw error;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* ─── HEADER ────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Walk-In Guests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage today's lounge walk-ins and guest passes</p>
        </div>
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 bg-[#05431E] hover:bg-[#042f15] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
        >
          <Plus size="18" />
          Check-in Guest
        </button>
      </div>

      {/* ─── METRICS CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
            <Profile2User size="24" className="text-gray-400" variant="Bulk" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Today</p>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
            <Clock size="24" className="text-amber-500" variant="Bulk" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{counts.waiting}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Currently Waiting</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
            <TickCircle size="24" className="text-green-500" variant="Bulk" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{counts.admitted}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admitted</p>
          </div>
        </div>
      </div>

      {/* ─── CONTROLS ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size="18" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search walk-ins by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] appearance-none shadow-sm cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── DATA TABLE ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
          <div className="col-span-3 pl-2">Guest</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-2">Referral / Party</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right pr-2">Arrival Time</div>
        </div>

        {/* Table Body */}
        {filteredWalkins.map((w) => (
          <div key={w.id} className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors last:border-0">
            
            {/* Guest */}
            <div className="col-span-3 flex items-center gap-3 pl-2">
              <div className="w-10 h-10 rounded-full bg-[#05431E]/5 border border-[#05431E]/10 flex items-center justify-center shrink-0">
                <Profile2User size="18" className="text-[#05431E]" variant="Bulk" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{w.fullName}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{w.id}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="col-span-2 hidden md:block">
              <p className="text-sm font-medium text-gray-700">{w.phone}</p>
              <p className="text-xs text-gray-400 truncate pr-4">{w.email || 'No email provided'}</p>
            </div>

            {/* Referral */}
            <div className="col-span-2 hidden md:block">
              <p className="text-sm font-medium text-gray-900">{w.referredBy ? w.referredBy : <span className="text-gray-400 italic">None</span>}</p>
              <p className="text-xs text-gray-500 mt-0.5">Party of {w.expectedPartySize}</p>
            </div>

            {/* Status */}
            <div className="col-span-2">
              <StatusBadge status={w.status} paymentConfirmed={w.paymentConfirmed} />
            </div>

            {/* Time / Actions */}
            <div className="col-span-3 flex items-center justify-between md:justify-end gap-4 pr-2">
              <span className="text-sm text-gray-500 hidden md:block font-medium">
                {new Date(w.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button 
                onClick={() => setSelectedWalkIn(w)}
                className="p-2 text-gray-400 hover:text-[#05431E] hover:bg-[#05431E]/10 rounded-lg transition-colors"
                title="View Walk-in Details"
              >
                <Eye size="18" />
              </button>
            </div>
          </div>
        ))}

        {!isLoading && filteredWalkins.length === 0 && (
          <div className="py-16 text-center">
            <DocumentText size="40" className="text-gray-200 mx-auto mb-3" variant="Bulk" />
            <p className="text-sm text-gray-400">No walk-in guests found.</p>
          </div>
        )}

        {isLoading && (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05431E] mx-auto mb-3"></div>
            <p className="text-sm text-gray-400">Loading walk-ins...</p>
          </div>
        )}
      </div>

      {/* ─── MODALS & DRAWERS ──────────────────────────────────── */}
      <WalkInDrawer
        walkIn={selectedWalkIn}
        isOpen={selectedWalkIn !== null}
        onClose={() => setSelectedWalkIn(null)}
        onStatusChange={handleStatusChange}
        onConfirmPayment={async (id, ref, method) => {
          try {
            await confirmPayment({ id, paymentReference: ref, method }).unwrap();
            toast.success('Payment confirmed successfully');
            setSelectedWalkIn({ ...selectedWalkIn, paymentConfirmed: true });
          } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to confirm payment');
          }
        }}
        onLogDish={async (id, dishName, notes) => {
          try {
            const res = await logDish({ id, dishName, notes }).unwrap();
            toast.success(res.message);
            setSelectedWalkIn({
              ...selectedWalkIn,
              dishSelectionsUsed: res.selectionsUsed,
              dishSelections: [...(selectedWalkIn.dishSelections || []), res.dish],
            });
          } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to log dish');
          }
        }}
      />

      <NewWalkInModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleAddNew}
      />
      
    </div>
  );
};
