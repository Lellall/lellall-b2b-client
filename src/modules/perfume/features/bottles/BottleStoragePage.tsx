import React, { useState } from 'react';
import { Search, Plus, X, AlertTriangle, Edit2 } from 'lucide-react';
import { Warning2, TickCircle } from 'iconsax-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import {
  useGetPerfumeInventoryItemsQuery,
  useAddPerfumeInventoryItemMutation,
  useRestockPerfumeInventoryItemMutation,
} from '../../../../redux/api/perfume-store/inventory.api';
import { toast } from 'react-toastify';

const BRAND_GREEN = '#05431E';

const formatCurrency = (n: number) => '₦' + n.toLocaleString('en-NG');

// ─── STOCK INDICATOR ──────────────────────────────────────────────────────────

const StockIndicator: React.FC<{ stock: number }> = ({ stock }) => {
  if (stock === 0) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Out of Stock
    </span>
  );
  if (stock <= 5) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
      <Warning2 size={11} /> Low — {stock} left
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-200">
      <TickCircle size={11} /> {stock} in stock
    </span>
  );
};

// ─── ADD ITEM MODAL ───────────────────────────────────────────────────────────

const AddItemModal: React.FC<{ storeId: string; onClose: () => void }> = ({ storeId, onClose }) => {
  const [form, setForm] = useState({ name: '', brand: '', category: '', cost: '', currentStock: '20', description: '', volume: '' });
  const [addItem, { isLoading }] = useAddPerfumeInventoryItemMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.cost) { toast.error('Name, category and price are required'); return; }
    
    // Append volume to name if provided
    const finalName = form.volume ? `${form.name} (${form.volume}ml)` : form.name;

    try {
      await addItem({
        storeId,
        data: {
          name: finalName,
          brand: form.brand,
          category: form.category,
          cost: Number(form.cost),
          currentStock: Number(form.currentStock) || 20,
          description: form.description,
        },
      }).unwrap();
      toast.success(`${form.name} added to inventory!`);
      onClose();
    } catch {
      toast.error('Failed to add item.');
    }
  };

  const CATEGORIES = [
    'TURAREN WUTA', 'BODY MIST', 'PERFUME OIL', 'OIL TESTERS',
    'WARDROBE/LINEN SPRAYS', 'KHUMRAHS', 'DIFFUSERS', 'CAR DIFFUSERS', 'CHARCOAL', 'Other',
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white">
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Add Inventory Item</h2>
              <p className="text-sm text-gray-400 mt-0.5">New product for the store</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Product Name *</label>
              <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                placeholder="e.g. RISKU INCENSE 100ML"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Brand</label>
                <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  placeholder="e.g. RISKU"
                  value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Category *</label>
                <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none bg-white"
                  value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            {(form.category === 'PERFUME OIL' || form.category === 'OIL TESTERS' || form.category === 'BODY MIST') && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Volume (ml)</label>
                <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  type="number"
                  placeholder="e.g. 50"
                  value={form.volume} onChange={e => setForm(p => ({ ...p, volume: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Price (₦) *</label>
                <input type="number" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  placeholder="e.g. 35000"
                  value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Opening Stock</label>
                <input type="number" className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                  placeholder="20"
                  value={form.currentStock} onChange={e => setForm(p => ({ ...p, currentStock: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Notes / Description</label>
              <input className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
                placeholder="Optional description"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 disabled:opacity-50" style={{ background: BRAND_GREEN }}>
                {isLoading ? 'Adding…' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── RESTOCK MODAL ─────────────────────────────────────────────────────────────

const RestockModal: React.FC<{ item: any; onClose: () => void }> = ({ item, onClose }) => {
  const [amount, setAmount] = useState('');
  const [restock, { isLoading }] = useRestockPerfumeInventoryItemMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid quantity'); return; }
    try {
      await restock({ id: item.id, amount: Number(amount), cost: item.cost }).unwrap();
      toast.success(`${item.name} restocked by ${amount} units!`);
      onClose();
    } catch {
      toast.error('Failed to restock item.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Restock Item</h2>
              <p className="text-sm text-gray-400 mt-0.5 truncate max-w-[200px]">{item.name}</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">Current stock: <strong>{item.currentStock} units</strong></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Units to Add *</label>
              <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold focus:outline-none text-center"
                placeholder="e.g. 20"
                value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
            </div>
            {amount && Number(amount) > 0 && (
              <p className="text-sm text-center text-gray-500">
                New stock will be <strong style={{ color: BRAND_GREEN }}>{item.currentStock + Number(amount)} units</strong>
              </p>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold hover:opacity-90 disabled:opacity-50" style={{ background: BRAND_GREEN }}>
                {isLoading ? 'Restocking…' : 'Confirm Restock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const BottleStoragePage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const storeId = user?.perfumeStoreId || '';

  const { data: rawItems = [], isLoading } = useGetPerfumeInventoryItemsQuery(storeId, { skip: !storeId });
  const items: any[] = Array.isArray(rawItems) ? rawItems : [];

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [restockItem, setRestockItem] = useState<any>(null);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const lowStockCount = items.filter(i => i.currentStock <= 5).length;

  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || (item.brand || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-xs text-gray-500 mt-1">{items.length} products · {lowStockCount} low stock</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90 shadow-sm" style={{ background: BRAND_GREEN }}>
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Low stock banner */}
      {lowStockCount > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Warning2 size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            <strong>{lowStockCount} item{lowStockCount > 1 ? 's are' : ' is'} running low</strong> — tap a product to restock it.
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none text-sm" />
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${activeCategory === cat ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-[#05431E]/40 hover:text-[#05431E]'}`}
            style={activeCategory === cat ? { background: BRAND_GREEN } : {}}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Product</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Category</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Price</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Stock</th>
              <th className="px-6 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">Loading inventory…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="text-center py-16 text-gray-400">
                    <p className="font-semibold text-gray-500">{search ? `No results for "${search}"` : 'No items yet'}</p>
                    <button onClick={() => setShowAdd(true)} className="mt-3 text-sm font-bold" style={{ color: BRAND_GREEN }}>+ Add first product</button>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && filtered.map(item => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  {item.brand && <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>}
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{item.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(item.cost)}</span>
                </td>
                <td className="px-6 py-4">
                  <StockIndicator stock={item.currentStock} />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setRestockItem(item)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                    style={{ color: BRAND_GREEN, borderColor: `${BRAND_GREEN}30`, background: `${BRAND_GREEN}08` }}
                  >
                    <Edit2 size={12} />
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddItemModal storeId={storeId} onClose={() => setShowAdd(false)} />}
      {restockItem && <RestockModal item={restockItem} onClose={() => setRestockItem(null)} />}
    </div>
  );
};

export default BottleStoragePage;
