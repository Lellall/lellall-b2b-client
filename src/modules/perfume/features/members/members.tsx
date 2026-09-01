import React, { useState } from 'react';
import { Search, Plus, X, ChevronRight, Mail, Phone } from 'lucide-react';
import { Crown, TickCircle, Clock, CloseCircle } from 'iconsax-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { useGetPerfumeClientsQuery, useRegisterPerfumeClientMutation, useSendPerfumeRecommendationMutation } from '../../../../redux/api/perfume-store/clients.api';
import { useGetPerfumeInventoryItemsQuery } from '../../../../redux/api/perfume-store/inventory.api';
import { toast } from 'react-toastify';

const BRAND_GREEN = '#05431E';

const formatCurrency = (n: number) => '₦' + n.toLocaleString('en-NG');
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ─── REGISTER MODAL ────────────────────────────────────────────────────────────

const RegisterClientModal: React.FC<{
  storeId: string;
  onClose: () => void;
}> = ({ storeId, onClose }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [registerClient, { isLoading }] = useRegisterPerfumeClientMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) { toast.error('First and last name are required'); return; }
    try {
      await registerClient({ storeId, data: form }).unwrap();
      toast.success(`${form.firstName} ${form.lastName} registered as a client!`);
      onClose();
    } catch {
      toast.error('Failed to register client. Please try again.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Register Client</h2>
              <p className="text-sm text-gray-400 mt-0.5">Add a new client to your store</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">First Name *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  placeholder="e.g. Amina"
                  value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Last Name *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  placeholder="e.g. Hassan"
                  value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                placeholder="client@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
              <input
                type="tel"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                placeholder="+234 800 000 0000"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <p className="text-xs text-gray-400">
              Once registered, this client will appear in the POS for order assignment and can receive recommendations.
            </p>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: BRAND_GREEN }}
              >
                {isLoading ? 'Registering...' : 'Register Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── CLIENT DRAWER ─────────────────────────────────────────────────────────────

// ─── RECOMMENDATION MODAL ──────────────────────────────────────────────────────

const RecommendationModal: React.FC<{
  client: any;
  storeId: string;
  onClose: () => void;
}> = ({ client, storeId, onClose }) => {
  const [message, setMessage] = useState('');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  const { data: inventoryRaw } = useGetPerfumeInventoryItemsQuery(storeId, { skip: !storeId });
  const inventoryItems: any[] = Array.isArray(inventoryRaw) ? inventoryRaw : (inventoryRaw as any)?.items || [];
  const [sendRecommendation, { isLoading }] = useSendPerfumeRecommendationMutation();

  const toggleItem = (item: any) => {
    setSelectedItems(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  };

  const handleSend = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to recommend.');
      return;
    }
    try {
      await sendRecommendation({
        id: client.id,
        data: { items: selectedItems, message }
      }).unwrap();
      toast.success('Recommendation sent to ' + client.firstName);
      onClose();
    } catch {
      toast.error('Failed to send recommendation.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[70] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Send Recommendation</h2>
              <p className="text-sm text-gray-400 mt-0.5">To: {client.firstName || client.name.split(' ')[0]} {client.lastName || (client.name.split(' ').length > 1 ? client.name.split(' ').slice(1).join(' ') : '')}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Personalized Message</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" 
                rows={3} 
                placeholder="Write a lovely note for your client..."
                value={message} onChange={e => setMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Select Fragrances ({selectedItems.length})</label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {inventoryItems.map(item => {
                  const isSelected = selectedItems.find(i => i.id === item.id);
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => toggleItem(item)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-[#05431E] bg-[#05431E]/5' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                      {isSelected && <TickCircle size={18} variant="Bold" className="text-[#05431E]" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={isLoading || selectedItems.length === 0}
              className="w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(to right, #05431E, #0E5D37)' }}
            >
              {isLoading ? 'Sending...' : 'Send Recommendation via Email'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── CLIENT DRAWER ─────────────────────────────────────────────────────────────

const ClientDrawer: React.FC<{ client: any; onClose: () => void }> = ({ client, onClose }) => {
  const [showRecModal, setShowRecModal] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const storeId = user?.perfumeStoreId || '';
  const totalSpend = (client.orders || []).reduce((s: number, o: any) => s + o.totalAmount, 0);
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Client Profile</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ background: BRAND_GREEN }}>
              {(client.firstName?.[0] || client.name?.[0] || '')}{(client.lastName?.[0] || (client.name?.split(' ').length > 1 ? client.name.split(' ')[1]?.[0] : ''))}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{client.firstName || client.name.split(' ')[0]} {client.lastName || (client.name.split(' ').length > 1 ? client.name.split(' ').slice(1).join(' ') : '')}</p>
              <p className="text-sm text-gray-400">Client since {formatDate(client.createdAt)}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            {client.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">{client.phone}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{(client.orders || []).length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Spend</p>
              <p className="text-xl font-bold" style={{ color: BRAND_GREEN }}>{formatCurrency(totalSpend)}</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Recent Purchases</h3>
            <div className="space-y-3">
              {(client.orders || []).slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex justify-between items-center border border-gray-100 rounded-xl p-3.5">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{order.id.substring(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length || 0} items</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                </div>
              ))}
              {(!client.orders || client.orders.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">No purchases yet</p>
              )}
            </div>
          </div>
          {/* Recommendations Button */}
          {client.email && (
            <button
              onClick={() => setShowRecModal(true)}
              className="w-full mt-4 py-3 rounded-xl text-white font-bold text-sm transition-all shadow hover:shadow-lg active:scale-[0.98] uppercase tracking-widest"
              style={{ background: 'linear-gradient(to right, #05431E, #0E5D37)' }}
            >
              Send Recommendation
            </button>
          )}
        </div>
      </div>
      {showRecModal && <RecommendationModal client={client} storeId={storeId} onClose={() => setShowRecModal(false)} />}
    </>
  );
};

// ─── MAIN CLIENTS PAGE ─────────────────────────────────────────────────────────

export const Members: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const storeId = user?.perfumeStoreId || '';

  const { data: clientsRaw, isLoading } = useGetPerfumeClientsQuery(storeId, { skip: !storeId });
  const clients: any[] = Array.isArray(clientsRaw) ? clientsRaw : (clientsRaw as any)?.clients || [];

  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.firstName} ${c.lastName} ${c.email} ${c.phone}`.toLowerCase().includes(q);
  });

  const totalSpend = (c: any) => (c.orders || []).reduce((s: number, o: any) => s + o.totalAmount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Clients</h1>
          <p className="text-xs text-gray-500 mt-1">{clients.length} registered client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowRegister(true)}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-sm"
          style={{ background: BRAND_GREEN }}
        >
          <Plus size={16} />
          Register Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none text-sm"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Clients', value: clients.length, icon: <Crown size={18} /> },
          { label: 'With Email', value: clients.filter(c => c.email).length, icon: <Mail size={18} /> },
          { label: 'Made a Purchase', value: clients.filter(c => c.orders?.length > 0).length, icon: <TickCircle size={18} /> },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BRAND_GREEN}10`, color: BRAND_GREEN }}>
              {icon}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Client table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Client</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Contact</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Orders</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Spend</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Since</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Loading clients…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className="text-center py-16 text-gray-400">
                    <Crown size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-gray-500">No clients yet</p>
                    <p className="text-sm mt-1">Register your first client to track their purchases</p>
                    <button onClick={() => setShowRegister(true)} className="mt-4 text-sm font-bold px-4 py-2 rounded-xl" style={{ color: BRAND_GREEN }}>
                      + Register Client
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && filtered.map(client => (
              <tr
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: BRAND_GREEN }}>
                      {(client.firstName?.[0] || client.name?.[0] || '')}{(client.lastName?.[0] || (client.name?.split(' ').length > 1 ? client.name.split(' ')[1]?.[0] : ''))}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{client.firstName || client.name?.split(' ')[0]} {client.lastName || (client.name?.split(' ').length > 1 ? client.name.split(' ').slice(1).join(' ') : '')}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600">{client.email || <span className="text-gray-300 italic">no email</span>}</p>
                  {client.phone && <p className="text-xs text-gray-400 mt-0.5">{client.phone}</p>}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">{(client.orders || []).length}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold" style={{ color: BRAND_GREEN }}>{formatCurrency(totalSpend(client))}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-gray-400">{formatDate(client.createdAt)}</span>
                </td>
                <td className="px-6 py-4">
                  <ChevronRight size={16} className="text-gray-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRegister && <RegisterClientModal storeId={storeId} onClose={() => setShowRegister(false)} />}
      {selectedClient && <ClientDrawer client={selectedClient} onClose={() => setSelectedClient(null)} />}
    </div>
  );
};

export default Members;
