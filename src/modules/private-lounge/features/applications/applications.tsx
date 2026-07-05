import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentText, TickCircle, CloseCircle, Clock } from 'iconsax-react';
import { Search, Filter, Plus, Eye } from 'lucide-react';
import { ApplicationDrawer } from './components/application-drawer';
import { useGetApplicationsQuery, useApproveApplicationMutation, useDeclineApplicationMutation, useConfirmPaymentMutation } from '../../../../redux/api/private-lounge/applications.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';


// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-amber-700 bg-amber-50 rounded-full border border-amber-200">
          <Clock size="12" /> Pending
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-green-700 bg-green-50 rounded-full border border-green-200">
          <TickCircle size="12" /> Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-red-700 bg-red-50 rounded-full border border-red-200">
          <CloseCircle size="12" /> Rejected
        </span>
      );
    default:
      return null;
  }
};

// ─── TIER BADGE ───────────────────────────────────────────────────────────────
const TierBadge = ({ tier }: { tier: string }) => {
  switch (tier) {
    case 'BLACK':
      return <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-900 text-white">BLACK</span>;
    case 'GOLD':
      return <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">GOLD</span>;
    case 'SILVER':
      return <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">SILVER</span>;
    default:
      return null;
  }
};

// ─── APPLICATIONS LIST ────────────────────────────────────────────────────────
export const Applications: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: response, isLoading } = useGetApplicationsQuery(user?.privateLoungeId || '', {
    skip: !user?.privateLoungeId
  });
  const [approveApplication] = useApproveApplicationMutation();
  const [declineApplication] = useDeclineApplicationMutation();
  const [confirmPayment] = useConfirmPaymentMutation();

  const applications: any[] = useMemo(() => {
    if (Array.isArray(response)) return response;
    return response?.data || [];
  }, [response]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        app.fullName.toLowerCase().includes(term) ||
        app.company.toLowerCase().includes(term) ||
        app.id.toLowerCase().includes(term);
      const matchesStatus = selectedStatus === 'ALL' || app.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, selectedStatus, applications]);

  // Counts
  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    approved: applications.filter(a => a.status === 'APPROVED').length,
  }), [applications]);

  const handleApprove = async (id: string) => {
    try {
      await approveApplication(id).unwrap();
      toast.success('Application approved successfully!');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await declineApplication(id).unwrap();
      toast.success('Application declined successfully.');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error?.message || 'Failed to decline application');
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      await confirmPayment(id).unwrap();
      toast.success('Payment confirmed! Member activated.');
      setSelectedApp(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error?.message || 'Failed to confirm payment');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review pending VIP applications or add a new member</p>
        </div>
        <button
          onClick={() => navigate('/lounge/applications/new')}
          className="bg-[#05431E] hover:bg-[#042f15] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus size="18" />
          New Application
        </button>
      </div>

      {/* ─── METRICS CARDS ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
             <DocumentText size="24" className="text-gray-500" variant="Bulk" />
           </div>
           <div>
             <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Applications</p>
           </div>
         </div>
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
             <Clock size="24" className="text-amber-500" variant="Bulk" />
           </div>
           <div>
             <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Review</p>
           </div>
         </div>
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
             <TickCircle size="24" className="text-green-500" variant="Bulk" />
           </div>
           <div>
             <p className="text-2xl font-bold text-gray-900">{counts.approved}</p>
             <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Approved This Month</p>
           </div>
         </div>
      </div>

      {/* ─── SEARCH + FILTER ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size="18" />
          <input
            type="text"
            placeholder="Search by name, ID, or company…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all bg-white shadow-sm text-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <Filter size="18" className="text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer outline-none pr-2"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* ─── DATA TABLE ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/80 border-b border-gray-100">
          <span className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</span>
          <span className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested Tier</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Submitted</span>
        </div>

        {filteredApps.map((app, index) => (
          <div
            key={app.id}
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[#05431E]/[0.02] transition-colors group ${
              index !== filteredApps.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            {/* Applicant */}
            <div className="col-span-3">
              <h3 className="text-sm font-semibold text-gray-900">{app.fullName}</h3>
              <p className="text-xs text-gray-500">{app.company || 'N/A'}</p>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5">{app.id}</p>
            </div>

            {/* Contact */}
            <div className="col-span-3">
              <p className="text-sm text-gray-700">{app.email}</p>
              <p className="text-xs text-gray-500">{app.primaryPhone}</p>
            </div>

            {/* Tier */}
            <div className="col-span-2">
              <TierBadge tier={app.tier || app.requestedTier} />
            </div>

            {/* Status */}
            <div className="col-span-2">
              <StatusBadge status={app.status} />
            </div>

            {/* Actions / Submitted */}
            <div className="col-span-2 flex items-center justify-between md:justify-end gap-4">
              <span className="text-xs text-gray-500 hidden md:block">
                {new Date(app.createdAt || app.submittedAt || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
              <button 
                onClick={() => setSelectedApp(app)}
                className="p-2 text-gray-400 hover:text-[#05431E] hover:bg-[#05431E]/10 rounded-lg transition-colors"
                title="Review Application"
              >
                <Eye size="18" />
              </button>
            </div>
          </div>
        ))}

        {!isLoading && filteredApps.length === 0 && (
          <div className="py-16 text-center">
            <DocumentText size="40" className="text-gray-200 mx-auto mb-3" variant="Bulk" />
            <p className="text-sm text-gray-400">No applications found.</p>
          </div>
        )}
        
        {isLoading && (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05431E] mx-auto mb-3"></div>
            <p className="text-sm text-gray-400">Loading applications...</p>
          </div>
        )}
      </div>

      {/* ─── APPLICATION DRAWER ──────────────────────────── */}
      <ApplicationDrawer
        application={selectedApp}
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onConfirmPayment={handleConfirmPayment}
      />
    </div>
  );
};
