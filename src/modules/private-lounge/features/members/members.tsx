import React, { useState, useMemo } from 'react';
import { DocumentText, TickCircle, CloseCircle, Clock } from 'iconsax-react';
import { Search, Filter, Plus, ChevronRight, Crown, Shield, Wine } from 'lucide-react';
import { MemberDrawer } from './components/member-drawer';
import { useGetAllMembersQuery } from '../../../../redux/api/private-lounge/members.api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';

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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 rounded-full border border-blue-200">
          <TickCircle size="12" /> Approved
        </span>
      );
    case 'ACTIVE':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-green-700 bg-green-50 rounded-full border border-green-200">
          <TickCircle size="12" /> Active
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-red-700 bg-red-50 rounded-full border border-red-200">
          <CloseCircle size="12" /> Rejected
        </span>
      );
    case 'SUSPENDED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-orange-700 bg-orange-50 rounded-full border border-orange-200">
          <CloseCircle size="12" /> Suspended
        </span>
      );
    case 'DELETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-gray-700 bg-gray-100 rounded-full border border-gray-300">
          <CloseCircle size="12" /> Deleted
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-gray-500 bg-gray-50 rounded-full border border-gray-200">
          {status}
        </span>
      );
  }
};

// ─── TIER BADGE ───────────────────────────────────────────────────────────────
const TierBadge = ({ tier }: { tier: string }) => {
  switch (tier) {
    case 'BLACK':
      return (
        <span className="px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-white bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-full shadow-sm border border-gray-700">
          Black
        </span>
      );
    case 'GOLD':
      return (
        <span className="px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-yellow-900 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 rounded-full shadow-sm border border-amber-300">
          Gold
        </span>
      );
    case 'SILVER':
      return (
        <span className="px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-gray-700 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 rounded-full shadow-sm border border-gray-300">
          Silver
        </span>
      );
    default:
      return null;
  }
};

// ─── STAT CARD (top summary row) ──────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent }: { label: string; value: number; icon: React.ReactNode; accent: string }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── MEMBERS PAGE ─────────────────────────────────────────────────────────────
export const Members: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const { data: response, isLoading } = useGetAllMembersQuery(user?.privateLoungeId || '', {
    skip: !user?.privateLoungeId
  });

  const members = useMemo(() => {
    if (Array.isArray(response)) return response;
    return response?.data || [];
  }, [response]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member: any) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        member.fullName.toLowerCase().includes(term) ||
        (member.membershipNumber && member.membershipNumber.toLowerCase().includes(term)) ||
        member.company?.toLowerCase().includes(term) ||
        member.email.toLowerCase().includes(term);
      const matchesTier = selectedTier === 'ALL' || member.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [searchTerm, selectedTier, members]);

  // Tier counts
  const tierCounts = useMemo(() => ({
    total: members.length,
    black: members.filter((m: any) => m.tier === 'BLACK').length,
    gold: members.filter((m: any) => m.tier === 'GOLD').length,
    silver: members.filter((m: any) => m.tier === 'SILVER').length,
  }), [members]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
      {/* ─── PAGE HEADER ─────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage VIP members, preferences & bottle storage</p>
        </div>
        <button
          onClick={() => alert('Invite flow: Direct applicants to your Lounge Application Portal.')}
          className="bg-[#05431E] hover:bg-[#042f15] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* ─── STAT CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Active Members" value={tierCounts.total} icon={<Crown className="w-5 h-5 text-[#05431E]" />} accent="bg-[#05431E]/10" />
        <StatCard label="Black Tier" value={tierCounts.black} icon={<Shield className="w-5 h-5 text-gray-800" />} accent="bg-gray-900/10" />
        <StatCard label="Gold Tier" value={tierCounts.gold} icon={<Crown className="w-5 h-5 text-amber-600" />} accent="bg-amber-100" />
        <StatCard label="Silver Tier" value={tierCounts.silver} icon={<Shield className="w-5 h-5 text-gray-500" />} accent="bg-gray-100" />
      </div>

      {/* ─── SEARCH + FILTER BAR ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or company…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all bg-white shadow-sm text-sm"
          />
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 cursor-pointer outline-none pr-2"
          >
            <option value="ALL">All Tiers</option>
            <option value="BLACK">Black</option>
            <option value="GOLD">Gold</option>
            <option value="SILVER">Silver</option>
          </select>
        </div>
      </div>

      {/* ─── MEMBERS TABLE ───────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100">
          <span className="col-span-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
          <span className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visits</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bottles</span>
          <span className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Last Visit</span>
        </div>

        {/* Rows */}
        {filteredMembers.map((member, index) => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer hover:bg-[#05431E]/[0.02] transition-colors group ${
              index !== filteredMembers.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            {/* Member Info */}
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#05431E]/10 to-[#05431E]/20 flex items-center justify-center border border-[#05431E]/10 shrink-0 overflow-hidden">
                {member.passportPhotoUrl ? (
                  <img src={member.passportPhotoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[#05431E]">
                    {member.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#05431E] transition-colors truncate">
                  {member.title ? `${member.title} ` : ''}{member.fullName}
                </h3>
                <p className="text-xs text-gray-400 font-mono">{member.membershipNumber || 'Pending ID'}</p>
              </div>
            </div>

            {/* Tier */}
            <div className="col-span-2 flex items-center">
              <TierBadge tier={member.tier} />
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center">
              <StatusBadge status={member.status} />
            </div>

            {/* Visits */}
            <div className="col-span-1">
              <span className="text-sm font-semibold text-gray-800">{member.totalVisits || 0}</span>
            </div>

            {/* Bottles */}
            <div className="col-span-2 flex items-center gap-1.5">
              {(member.bottlesStored || 0) > 0 ? (
                <>
                  <Wine className="w-4 h-4 text-[#05431E]" />
                  <span className="text-sm font-semibold text-gray-800">{member.bottlesStored}</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>

            {/* Last Visit */}
            <div className="col-span-2 flex items-center justify-end gap-2">
              <span className="text-xs text-gray-500">
                {member.lastVisit ? new Date(member.lastVisit).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Never'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#05431E] transition-colors" />
            </div>
          </div>
        ))}

        {!isLoading && filteredMembers.length === 0 && (
          <div className="py-16 text-center">
            <Search className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No members found matching your search.</p>
          </div>
        )}
        
        {isLoading && (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05431E] mx-auto mb-3"></div>
            <p className="text-sm text-gray-400">Loading members...</p>
          </div>
        )}
      </div>

      {/* ─── MEMBER DRAWER ───────────────────────────────── */}
      <MemberDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
};
