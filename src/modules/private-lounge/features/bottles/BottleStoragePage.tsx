import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Minus, Package, Wine, Utensils,
  AlertTriangle, CheckCircle, ChevronDown, X,
  Archive, RefreshCcw, Droplets, ImagePlus, Trash, Trash2, Edit2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';
import { 
  useGetInventoryItemsQuery, 
  useAddInventoryItemMutation, 
  useRestockInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteLoungeInventoryItemMutation
} from '../../../../redux/api/private-lounge/inventory.api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Category = string;
type StockStatus = 'ok' | 'low' | 'critical' | 'out';

interface StorageItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  emoji: string;
  unit: string;          // 'ml' | 'portions' | 'kg' | 'units'
  totalCapacity: number; // max capacity (ml for spirits, portions for food)
  currentStock: number;  // current level
  reorderAt: number;     // stock level that triggers low warning
  accentColor: string;
  cost: number;          // default unit cost
  photoUrl?: string;     // optional image
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getStatus = (item: StorageItem): StockStatus => {
  if (item.currentStock === 0) return 'out';
  const pct = (item.currentStock / item.totalCapacity) * 100;
  if (pct <= 10) return 'critical';
  if (item.currentStock <= item.reorderAt) return 'low';
  return 'ok';
};

const STATUS_CONFIG: Record<StockStatus, { label: string; className: string; icon: React.ReactNode }> = {
  ok:       { label: 'In Stock',  className: 'bg-green-50 text-green-700 border-green-200',  icon: <CheckCircle size={11} /> },
  low:      { label: 'Low',       className: 'bg-amber-50 text-amber-700 border-amber-200',  icon: <AlertTriangle size={11} /> },
  critical: { label: 'Critical',  className: 'bg-red-50 text-red-700 border-red-200',        icon: <AlertTriangle size={11} /> },
  out:      { label: 'Out',       className: 'bg-gray-100 text-gray-600 border-gray-300',    icon: <X size={11} /> },
};

const formatStock = (item: StorageItem) => {
  if (item.unit === 'ml') {
    return item.currentStock >= 1000
      ? `${(item.currentStock / 1000).toFixed(1)}L`
      : `${item.currentStock}ml`;
  }
  return `${item.currentStock} ${item.unit}`;
};

const formatCurrency = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

// ─── STOCK LEVEL BAR ─────────────────────────────────────────────────────────

const StockBar: React.FC<{ item: StorageItem }> = ({ item }) => {
  const pct = Math.min((item.currentStock / item.totalCapacity) * 100, 100);
  const status = getStatus(item);
  const barColor = status === 'ok' ? '#05431E' : status === 'low' ? '#d97706' : status === 'critical' ? '#ef4444' : '#d1d5db';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold text-gray-700">{formatStock(item)}</span>
        <span className="text-gray-400 font-mono">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

// ─── RESTOCK MODAL ────────────────────────────────────────────────────────────

const RestockModal: React.FC<{
  item: StorageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string, amount: number, customCost: number) => void;
}> = ({ item, isOpen, onClose, onConfirm }) => {
  const [amount, setAmount] = useState(0);
  const [customCost, setCustomCost] = useState<string>('');

  React.useEffect(() => {
    if (item) {
      const defaultAmount = item.totalCapacity - item.currentStock;
      setAmount(defaultAmount);
      setCustomCost(''); 
    }
  }, [item, isOpen]);

  if (!item || !isOpen) return null;

  const afterRestock = Math.min(item.currentStock + amount, item.totalCapacity);
  const afterPct = Math.round((afterRestock / item.totalCapacity) * 100);
  const calculatedCost = amount * (item.cost / (item.unit === 'ml' ? 750 : 1));
  const finalCost = customCost !== '' ? Number(customCost) : Math.round(calculatedCost);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{item.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                <p className="text-gray-400 text-sm">{item.brand} · {item.subCategory}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Current</p>
                <p className="font-bold text-gray-900 text-lg">{formatStock(item)}</p>
                <p className="text-xs text-gray-400">{Math.round((item.currentStock / item.totalCapacity) * 100)}% capacity</p>
              </div>
              <div className="bg-[#05431E]/5 border border-[#05431E]/10 rounded-xl p-4 text-center">
                <p className="text-xs text-[#05431E]/70 mb-1">After Restock</p>
                <p className="font-bold text-[#05431E] text-lg">
                  {item.unit === 'ml'
                    ? afterRestock >= 1000 ? `${(afterRestock / 1000).toFixed(1)}L` : `${afterRestock}ml`
                    : `${afterRestock} ${item.unit}`}
                </p>
                <p className="text-xs text-[#05431E]/60">{afterPct}% capacity</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount to restock ({item.unit})
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAmount(a => Math.max(0, a - (item.unit === 'ml' ? 100 : 1)))}
                  className="w-11 h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all active:scale-95"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={0}
                  max={item.totalCapacity - item.currentStock}
                  value={amount === 0 ? '' : amount}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                    setAmount(Math.max(0, Math.min(val, item.totalCapacity - item.currentStock)));
                  }}
                  className="flex-1 text-center text-xl font-bold border border-gray-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all"
                />
                <button
                  onClick={() => setAmount(a => Math.min(a + (item.unit === 'ml' ? 100 : 1), item.totalCapacity - item.currentStock))}
                  className="w-11 h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {amount > 0 && (
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3">
                <label className="block text-xs text-amber-800 font-medium mb-1.5">Actual Restock Cost (₦)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-700 font-bold">₦</span>
                  <input
                    type="number"
                    min={0}
                    placeholder={Math.round(calculatedCost).toString()}
                    value={customCost}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === '+') {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-lg py-2 pl-7 pr-3 text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button
                disabled={amount === 0}
                onClick={() => { onConfirm(item.id, amount, finalCost); onClose(); }}
                className="flex-1 py-2.5 rounded-xl bg-[#05431E] hover:bg-[#042f15] text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <RefreshCcw size={14} />
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── ADD ITEM MODAL ───────────────────────────────────────────────────────────

const AddItemModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<StorageItem, 'id'>) => void;
}> = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '', brand: '', category: '',
    subCategory: '', emoji: '', unit: 'ml',
    totalCapacity: '', currentStock: '', reorderAt: '', cost: '',
    accentColor: '#92400e',
    photo: null as File | null,
  });

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        name: '', brand: '', category: '',
        subCategory: '', emoji: '', unit: 'ml',
        totalCapacity: '', currentStock: '', reorderAt: '', cost: '',
        accentColor: '#92400e',
        photo: null as File | null,
      });
    }
  }, [isOpen]);

  const [addInventory] = useAddInventoryItemMutation();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.privateLoungeId) return;
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('brand', form.brand);
    formData.append('category', form.category);
    formData.append('subCategory', form.subCategory);
    formData.append('emoji', form.emoji);
    formData.append('unit', form.unit);
    formData.append('totalCapacity', form.totalCapacity);
    formData.append('currentStock', form.currentStock);
    formData.append('reorderAt', form.reorderAt);
    formData.append('cost', form.cost);
    formData.append('accentColor', form.accentColor);
    if (form.photo) {
      formData.append('photo', form.photo);
    }

    try {
      await addInventory({ loungeId: user.privateLoungeId, data: formData }).unwrap();
      onAdd({} as any);
      onClose();
    } catch (err) {
      toast.error('Failed to add item');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[60] px-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Package size={20} className="text-[#05431E]" />
              Add Storage Item
            </h3>
            <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-all">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Macallan 25 Year" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand / Source *</label>
                <input required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                  placeholder="e.g. The Macallan" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji (Optional)</label>
                <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                  placeholder="e.g. 🍷" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Item Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-colors w-full text-sm text-gray-600 font-medium">
                    <ImagePlus size={16} />
                    {form.photo ? form.photo.name : 'Click to upload photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setForm(p => ({ ...p, photo: e.target.files?.[0] || null }))} />
                  </label>
                  {form.photo && (
                    <button type="button" onClick={() => setForm(p => ({ ...p, photo: null }))} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <input required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Spirits & Wine" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category *</label>
                <input required value={form.subCategory} onChange={e => setForm(p => ({ ...p, subCategory: e.target.value }))}
                  placeholder="e.g. Whisky" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all">
                  <option value="ml">ml (liquid)</option>
                  <option value="portions">portions</option>
                  <option value="kg">kg</option>
                  <option value="units">units</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Capacity *</label>
                <input required type="number" min={1} value={form.totalCapacity} onChange={e => setForm(p => ({ ...p, totalCapacity: e.target.value }))}
                  placeholder="750" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Stock *</label>
                <input required type="number" min={0} value={form.currentStock} onChange={e => setForm(p => ({ ...p, currentStock: e.target.value }))}
                  placeholder="750" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Reorder Alert At *</label>
                <input required type="number" min={0} value={form.reorderAt} onChange={e => setForm(p => ({ ...p, reorderAt: e.target.value }))}
                  placeholder="200" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Cost (₦)</label>
                <input type="number" min={0} value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  placeholder="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#05431E] hover:bg-[#042f15] text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]">
                <Plus size={14} />
                Add to Storage
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── EDIT ITEM MODAL ─────────────────────────────────────────────────────────

const EditItemModal: React.FC<{
  item: StorageItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, item: Omit<StorageItem, 'id'>) => void;
}> = ({ item, isOpen, onClose, onEdit }) => {
  const [form, setForm] = useState({
    name: item.name, brand: item.brand, category: item.category,
    subCategory: item.subCategory, emoji: item.emoji, unit: item.unit,
    totalCapacity: item.totalCapacity.toString(), currentStock: item.currentStock.toString(), reorderAt: item.reorderAt.toString(), cost: item.cost.toString(),
    accentColor: item.accentColor,
    photo: null as File | null,
  });

  React.useEffect(() => {
    if (isOpen) {
      setForm({
        name: item.name, brand: item.brand, category: item.category,
        subCategory: item.subCategory, emoji: item.emoji, unit: item.unit,
        totalCapacity: item.totalCapacity.toString(), currentStock: item.currentStock.toString(), reorderAt: item.reorderAt.toString(), cost: item.cost.toString(),
        accentColor: item.accentColor,
        photo: null as File | null,
      });
    }
  }, [item, isOpen]);

  const [updateInventory, { isLoading }] = useUpdateInventoryItemMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value as string | Blob);
      }
    });

    try {
      const res = await updateInventory({ id: item.id, data: formData }).unwrap();
      onEdit(item.id, res);
      onClose();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto z-[60] bg-white rounded-2xl shadow-2xl no-scrollbar">
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-900">Edit Inventory Item</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"><X size={18} /></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Macallan 18" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand *</label>
                <input required value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                  placeholder="e.g. Macallan" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                <input required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="e.g. Spirits & Wine" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category *</label>
                <input required value={form.subCategory} onChange={e => setForm(p => ({ ...p, subCategory: e.target.value }))}
                  placeholder="e.g. Whisky" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
                <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value as 'ml' | 'portion' }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all">
                  <option value="ml">Milliliters (ml)</option>
                  <option value="portion">Portions</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji (Optional)</label>
                <input value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))}
                  placeholder="🥃" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Capacity *</label>
                <input required type="number" min={0} value={form.totalCapacity} onChange={e => setForm(p => ({ ...p, totalCapacity: e.target.value }))}
                  placeholder="e.g. 750" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Stock *</label>
                <input required type="number" min={0} value={form.currentStock} onChange={e => setForm(p => ({ ...p, currentStock: e.target.value }))}
                  placeholder="e.g. 750" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Alert Threshold</label>
                <input required type="number" min={0} value={form.reorderAt} onChange={e => setForm(p => ({ ...p, reorderAt: e.target.value }))}
                  placeholder="e.g. 150" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cost / Unit (₦)</label>
                <input required type="number" min={0} value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))}
                  placeholder="e.g. 50" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={e => setForm(p => ({ ...p, photo: e.target.files?.[0] || null }))}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#05431E]/5 file:text-[#05431E] hover:file:bg-[#05431E]/10 transition-all cursor-pointer" />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-[#05431E] hover:bg-[#042f15] text-white text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ─── STORAGE ITEM CARD ────────────────────────────────────────────────────────

const StorageCard: React.FC<{
  item: StorageItem;
  onRestock: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ item, onRestock, onEdit, onDelete }) => {
  const status = getStatus(item);
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all duration-200 overflow-hidden flex flex-col">
      <div className="h-1.5 w-full" style={{ background: item.accentColor }} />
      <div className="relative flex items-center justify-center h-24 bg-gray-50 border-b border-gray-100 overflow-hidden">
        {item.photoUrl ? (
          <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" />
        ) : item.emoji ? (
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
        ) : (
          <span className="text-4xl font-black text-gray-200 group-hover:scale-110 transition-transform duration-300 uppercase">{item.name.charAt(0)}</span>
        )}
        <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide bg-white/90 backdrop-blur-sm ${statusCfg.className}`}>
          {statusCfg.icon}
          {statusCfg.label}
        </div>
        <div className="absolute top-2 right-9 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-[9px] font-bold text-gray-500 shadow-sm">
          {item.unit === 'ml' ? '🍶' : '🍽️'} {item.subCategory}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="absolute top-2 right-8 p-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-400 hover:text-blue-500 shadow-sm transition-colors hover:bg-blue-50"
          title="Edit item"
        >
          <Edit2 size={12} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 p-1 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-400 hover:text-red-500 shadow-sm transition-colors hover:bg-red-50"
          title="Delete item"
        >
          <Trash size={12} />
        </button>
      </div>
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{item.brand}</p>
        </div>
        <StockBar item={item} />
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
          <span>Max: {item.unit === 'ml' ? `${(item.totalCapacity / 1000).toFixed(1)}L` : `${item.totalCapacity} ${item.unit}`}</span>
          <span>Alert: {item.unit === 'ml' ? `${item.reorderAt}ml` : `${item.reorderAt} ${item.unit}`}</span>
        </div>
        <button
          onClick={onRestock}
          disabled={item.currentStock >= item.totalCapacity}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            status === 'ok' && item.currentStock >= item.totalCapacity
              ? 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
              : status === 'out' || status === 'critical'
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
              : status === 'low'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              : 'bg-[#05431E]/10 text-[#05431E] border border-[#05431E]/20 hover:bg-[#05431E]/20'
          }`}
        >
          <RefreshCcw size={13} />
          {item.currentStock >= item.totalCapacity ? 'Fully Stocked' : 'Restock'}
        </button>
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const StoragePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockItem, setRestockItem] = useState<StorageItem | null>(null);
  const [editItem, setEditItem] = useState<StorageItem | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const { data: fetchedItems = [] } = useGetInventoryItemsQuery(
    user?.privateLoungeId || '',
    { skip: !user?.privateLoungeId }
  );
  
  const items = fetchedItems;
  const [restockItemMutation] = useRestockInventoryItemMutation();
  const [deleteItemMutation] = useDeleteLoungeInventoryItemMutation();

  const subCategories = useMemo(() => {
    const source = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);
    return ['All', ...Array.from(new Set(source.map(i => i.subCategory)))];
  }, [items, activeTab]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(items.map(i => i.category)))];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchTab = activeTab === 'All' || item.category === activeTab;
      const matchSub = subFilter === 'All' || item.subCategory === subFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
      return matchTab && matchSub && matchSearch;
    });
  }, [items, activeTab, subFilter, search]);

  const stats = useMemo(() => ({
    total: items.length,
    low: items.filter(i => getStatus(i) === 'low').length,
    critical: items.filter(i => getStatus(i) === 'critical').length,
    out: items.filter(i => getStatus(i) === 'out').length,
  }), [items]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, StorageItem[]>>((acc, item) => {
      const key = item.subCategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const handleRestock = async (itemId: string, amount: number, customCost: number) => {
    try {
      await restockItemMutation({ id: itemId, amount, cost: customCost }).unwrap();
      toast.success(`Stock updated successfully`);
    } catch (err) {
      toast.error('Failed to restock item');
    }
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;
    setIsDeleting(true);
    try {
      await deleteItemMutation(deleteItemId).unwrap();
      toast.success("Item deleted successfully");
      setDeleteItemId(null);
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Storage</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage spirits, wine & food inventory — restock from here</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-[#05431E] hover:bg-[#042f15] active:scale-[0.98] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5 mb-6 w-full overflow-x-auto no-scrollbar">
        {categories.map((key) => {
          const isAll = key === 'All';
          const count = isAll ? items.length : items.filter(i => i.category === key).length;
          const icon = isAll ? <Archive size={18} /> : <Package size={18} />;
          return (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSubFilter('All'); }}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                activeTab === key
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 active:scale-95'
              }`}
            >
              {icon}
              <span className="whitespace-nowrap">{key}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/60 text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or brand…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm shrink-0">
          <Droplets size={14} className="text-gray-400" />
          <select
            value={subFilter}
            onChange={e => setSubFilter(e.target.value)}
            className="border-none bg-transparent focus:ring-0 text-sm font-semibold text-gray-700 cursor-pointer outline-none pr-1"
          >
            {subCategories.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {Object.entries(grouped).map(([subCat, catItems]) => (
        <div key={subCat} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.1em]">{subCat}</h2>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">{catItems.length} items</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {catItems.map(item => (
              <StorageCard 
                key={item.id} 
                item={item} 
                onRestock={() => {
                  setRestockItem(item);
                  setIsRestockOpen(true);
                }}
                onEdit={() => {
                  setEditItem(item);
                  setIsEditOpen(true);
                }}
                onDelete={() => setDeleteItemId(item.id)}
              />
            ))}
          </div>
        </div>
      ))}

      {deleteItemId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-600">
                <Trash2 size="24" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Storage Item</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this item? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteItemId(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={() => { setShowAddModal(false); toast.success('Added item'); }}
      />
      <RestockModal
        item={restockItem}
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        onConfirm={handleRestock}
      />
      {editItem && (
        <EditItemModal
          item={editItem}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onEdit={() => {
            toast.success('Item updated successfully!');
          }}
        />
      )}
    </div>
  );
};

export default StoragePage;
