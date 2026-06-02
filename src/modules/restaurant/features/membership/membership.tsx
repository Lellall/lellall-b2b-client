import Modal from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Filter,
  Pencil,
  Plus,
  Power,
  PowerOff,
  QrCode,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { type Member, type MembershipPlan, type MembershipStatus, getDemoMembershipMembers, membershipPlans, planValues, saveDemoMembershipMembers } from './mock-members';

interface MemberFormValues {
  fullName: string;
  phoneNumber: string;
  email: string;
  planType: MembershipPlan;
  startDate: string;
  expiryDate: string;
  notes: string;
  status: MembershipStatus;
}

const emptyForm: MemberFormValues = {
  fullName: '',
  phoneNumber: '',
  email: '',
  planType: 'Classic Monthly',
  startDate: '',
  expiryDate: '',
  notes: '',
  status: 'Active',
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'MC';

const QrPlaceholder = ({ membershipId, size = 48 }: { membershipId: string; size?: number }) => {
  const cells = useMemo(() => {
    const seed = membershipId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: 49 }, (_, index) => {
      const row = Math.floor(index / 7);
      const col = index % 7;
      const isFinder =
        (row < 2 && col < 2) ||
        (row < 2 && col > 4) ||
        (row > 4 && col < 2);
      return isFinder || ((seed + index * 7 + row * col) % 5 < 2);
    });
  }, [membershipId]);

  return (
    <div
      className="grid gap-[2px] rounded-md border border-gray-200 bg-white p-1 shadow-sm"
      style={{ width: size, height: size, gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
      aria-label={`QR placeholder for ${membershipId}`}
    >
      {cells.map((filled, index) => (
        <span key={`${membershipId}-${index}`} className={filled ? 'rounded-[1px] bg-[#05431E]' : 'rounded-[1px] bg-gray-100'} />
      ))}
    </div>
  );
};

const getStatusBadge = (status: MembershipStatus) => {
  const statusConfig: Record<MembershipStatus, { bg: string; text: string; icon: React.ReactNode }> = {
    Active: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    Expired: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      icon: <Clock className="w-3 h-3" />,
    },
    Disabled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      {status}
    </span>
  );
};

const RestaurantMembership: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(() => getDemoMembershipMembers());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | MembershipStatus>('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formValues, setFormValues] = useState<MemberFormValues>(emptyForm);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        member.fullName.toLowerCase().includes(search) ||
        member.phoneNumber.toLowerCase().includes(search) ||
        member.membershipId.toLowerCase().includes(search) ||
        member.planType.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const activeMembers = members.filter((member) => member.status === 'Active');

    return {
      total: members.length,
      active: activeMembers.length,
      expired: members.filter((member) => member.status === 'Expired').length,
      monthlyValue: activeMembers.reduce((total, member) => total + member.monthlyValue, 0),
    };
  }, [members]);

  useEffect(() => {
    saveDemoMembershipMembers(members);
  }, [members]);

  const openRegisterDrawer = () => {
    setEditingMember(null);
    setFormValues(emptyForm);
    setDrawerOpen(true);
  };

  const openEditDrawer = (member: Member) => {
    setEditingMember(member);
    setFormValues({
      fullName: member.fullName,
      phoneNumber: member.phoneNumber,
      email: member.email || '',
      planType: member.planType,
      startDate: member.startDate,
      expiryDate: member.expiryDate,
      notes: member.notes,
      status: member.status,
    });
    setDrawerOpen(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingMember) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id
            ? {
                ...member,
                ...formValues,
                monthlyValue: planValues[formValues.planType],
              }
            : member
        )
      );
    } else {
      const nextNumber = members.length + 1001;
      const newMember: Member = {
        id: Date.now().toString(),
        ...formValues,
        membershipId: `LEL-CLUB-${nextNumber}`,
        monthlyValue: planValues[formValues.planType],
      };

      setMembers((prev) => [newMember, ...prev]);
    }

    setDrawerOpen(false);
    setEditingMember(null);
    setFormValues(emptyForm);
  };

  const toggleMemberStatus = (member: Member) => {
    setMembers((prev) =>
      prev.map((current) =>
        current.id === member.id
          ? {
              ...current,
              status: current.status === 'Active' ? 'Disabled' : 'Active',
            }
          : current
      )
    );
  };

  const openQrModal = (member: Member) => {
    setSelectedMember(member);
    setQrModalOpen(true);
  };

  const statCards = [
    { label: 'Total Members', value: stats.total, icon: Users, color: 'bg-[#05431E]' },
    { label: 'Active Members', value: stats.active, icon: CheckCircle2, color: 'bg-green-600' },
    { label: 'Expired Members', value: stats.expired, icon: Clock, color: 'bg-orange-500' },
    { label: 'Monthly Subscription Value', value: formatCurrency(stats.monthlyValue), icon: CreditCard, color: 'bg-blue-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-6">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#05431E] text-white">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Restaurant Membership Club</h1>
              <p className="mt-1 text-sm text-gray-500">
                Demo UI for subscription-covered members identified by QR code or membership ID.
              </p>
            </div>
          </div>
          <button
            onClick={openRegisterDrawer}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#05431E] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#043020]"
          >
            <Plus className="h-4 w-4" />
            Register Member
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members by name, phone, plan, or membership ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'ALL' | MembershipStatus)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Member Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Phone Number</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Membership ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Plan Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Expiry Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">QR Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <QrCode className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No members found</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                          {getInitials(member.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                          <p className="text-xs text-gray-500">{member.email || 'No email added'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{member.phoneNumber}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{member.membershipId}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{member.planType}</td>
                    <td className="whitespace-nowrap px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{formatDate(member.startDate)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{formatDate(member.expiryDate)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button onClick={() => openQrModal(member)} title="View QR Code" className="rounded-md p-1 hover:bg-gray-100">
                        <QrPlaceholder membershipId={member.membershipId} />
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openQrModal(member)}
                          className="rounded p-1.5 transition-colors hover:bg-gray-100"
                          title="View QR Code"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => openEditDrawer(member)}
                          className="rounded p-1.5 transition-colors hover:bg-gray-100"
                          title="Edit Member"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => toggleMemberStatus(member)}
                          className="rounded p-1.5 transition-colors hover:bg-gray-100"
                          title={member.status === 'Active' ? 'Disable Member' : 'Activate Member'}
                        >
                          {member.status === 'Active' ? (
                            <PowerOff className="h-4 w-4 text-red-600" />
                          ) : (
                            <Power className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="right"
        width="min(100vw, 34rem)"
        title={editingMember ? 'Edit Member' : 'Register Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
            Members belong to an exclusive restaurant membership club. Their orders can later be treated as covered by subscription through QR code or membership ID lookup.
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-[#05431E]">Full Name</label>
              <input
                name="fullName"
                value={formValues.fullName}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#05431E]">Phone Number</label>
              <input
                name="phoneNumber"
                type="tel"
                value={formValues.phoneNumber}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#05431E]">Email <span className="font-normal text-gray-400">(Optional)</span></label>
              <input
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#05431E]">Membership Plan</label>
              <select
                name="planType"
                value={formValues.planType}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                required
              >
                {membershipPlans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan} - {formatCurrency(planValues[plan])}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#05431E]">Status</label>
              <select
                name="status"
                value={formValues.status}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                required
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#05431E]">Start Date</label>
              <input
                name="startDate"
                type="date"
                value={formValues.startDate}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#05431E]">Expiry Date</label>
              <input
                name="expiryDate"
                type="date"
                value={formValues.expiryDate}
                onChange={handleChange}
                className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#05431E]">Notes</label>
            <textarea
              name="notes"
              value={formValues.notes}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg bg-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]"
              placeholder="Add demo notes for POS/order coverage rules..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <Button type="button" variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#05431E] text-white hover:bg-[#043020]">
              {editingMember ? 'Save Changes' : 'Register Member'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} position="center" width="min(90vw, 28rem)" title="Membership QR Code">
        {selectedMember && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex justify-center">
              <QrPlaceholder membershipId={selectedMember.membershipId} size={180} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedMember.fullName}</h2>
              <p className="mt-1 text-sm font-medium text-[#05431E]">{selectedMember.membershipId}</p>
              <p className="mt-2 text-sm text-gray-500">
                Placeholder QR for demo. POS can later scan this code or search the membership ID to mark orders as subscription covered.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-left text-sm text-gray-600">
              <div className="flex items-center justify-between gap-4">
                <span>Plan</span>
                <span className="font-medium text-gray-900">{selectedMember.planType}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <span>Status</span>
                {getStatusBadge(selectedMember.status)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantMembership;
