import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Minus, Package, Wine, Utensils,
  AlertTriangle, CheckCircle, ChevronDown, X,
  Archive, RefreshCcw, Droplets, ImagePlus,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Category = 'All' | 'Spirits & Wine' | 'Food';
type StockStatus = 'ok' | 'low' | 'critical' | 'out';

interface StorageItem {
  id: string;
  name: string;
  brand: string;
  category: 'Spirits & Wine' | 'Food';
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

// ─── SEED DATA (mirrors menu items) ──────────────────────────────────────────

const INITIAL_ITEMS: StorageItem[] = [
  // ── Champagne & Sparkling ──
  { id: 's1',  name: 'Dom Pérignon 2015',         brand: 'Moët & Chandon',  category: 'Spirits & Wine', subCategory: 'Champagne',  emoji: '🥂', unit: 'ml',      totalCapacity: 9000,  currentStock: 5250, reorderAt: 1500, accentColor: '#854d0e', cost: 485000 },
  { id: 's2',  name: 'Billecart-Salmon Rosé NV',  brand: 'Billecart-Salmon', category: 'Spirits & Wine', subCategory: 'Champagne',  emoji: '🍾', unit: 'ml',      totalCapacity: 6000,  currentStock: 750,  reorderAt: 1500, accentColor: '#9f1239', cost: 185000 },
  { id: 's3',  name: 'Moët & Chandon Impérial',   brand: 'Moët & Chandon',  category: 'Spirits & Wine', subCategory: 'Champagne',  emoji: '🍾', unit: 'ml',      totalCapacity: 9000,  currentStock: 6750, reorderAt: 1500, accentColor: '#713f12', cost: 125000 },
  // ── Red Wine ──
  { id: 's4',  name: 'Opus One 2019',             brand: 'Opus One',         category: 'Spirits & Wine', subCategory: 'Red Wine',   emoji: '🍷', unit: 'ml',      totalCapacity: 4500,  currentStock: 3000, reorderAt: 750,  accentColor: '#7f1d1d', cost: 650000 },
  { id: 's5',  name: 'Screaming Eagle 2018',      brand: 'Screaming Eagle',  category: 'Spirits & Wine', subCategory: 'Red Wine',   emoji: '🦅', unit: 'ml',      totalCapacity: 2250,  currentStock: 0,    reorderAt: 750,  accentColor: '#450a0a', cost: 4200000 },
  // ── Whisky & Spirits ──
  { id: 's6',  name: 'Macallan 18 Year',          brand: 'The Macallan',     category: 'Spirits & Wine', subCategory: 'Whisky',     emoji: '🥃', unit: 'ml',      totalCapacity: 5600,  currentStock: 2100, reorderAt: 700,  accentColor: '#92400e', cost: 285000 },
  { id: 's7',  name: 'Hennessy Paradis',          brand: 'Hennessy',         category: 'Spirits & Wine', subCategory: 'Cognac',     emoji: '🥃', unit: 'ml',      totalCapacity: 3500,  currentStock: 350,  reorderAt: 700,  accentColor: '#78350f', cost: 1800000 },
  { id: 's8',  name: 'Louis XIII',                brand: 'Rémy Martin',      category: 'Spirits & Wine', subCategory: 'Cognac',     emoji: '👑', unit: 'ml',      totalCapacity: 1750,  currentStock: 1750, reorderAt: 500,  accentColor: '#7c2d12', cost: 6500000 },
  { id: 's9',  name: 'Patrón El Alto',            brand: 'Patrón',           category: 'Spirits & Wine', subCategory: 'Tequila',    emoji: '🌵', unit: 'ml',      totalCapacity: 4200,  currentStock: 4200, reorderAt: 700,  accentColor: '#365314', cost: 380000 },
  // ── Cocktail Base ──
  { id: 's10', name: 'Campari',                   brand: 'Campari',          category: 'Spirits & Wine', subCategory: 'Cocktail Base', emoji: '🍊', unit: 'ml', totalCapacity: 5000,  currentStock: 1200, reorderAt: 1000, accentColor: '#b91c1c', cost: 45000 },
  { id: 's11', name: 'Sweet Vermouth',            brand: 'Carpano Antica',   category: 'Spirits & Wine', subCategory: 'Cocktail Base', emoji: '🍷', unit: 'ml', totalCapacity: 3000,  currentStock: 2400, reorderAt: 600,  accentColor: '#78350f', cost: 28000 },

  // ── Food — Small Plates ──
  { id: 'f1',  name: 'Wagyu Beef Tataki',         brand: 'Kitchen',          category: 'Food', subCategory: 'Small Plates', emoji: '🥩', unit: 'portions', totalCapacity: 20, currentStock: 12,  reorderAt: 5,  accentColor: '#7c2d12', cost: 38500 },
  { id: 'f2',  name: 'Lobster Bisque',            brand: 'Kitchen',          category: 'Food', subCategory: 'Small Plates', emoji: '🦞', unit: 'portions', totalCapacity: 20, currentStock: 3,   reorderAt: 5,  accentColor: '#9a3412', cost: 28000 },
  { id: 'f3',  name: 'Foie Gras Torchon',         brand: 'Kitchen',          category: 'Food', subCategory: 'Small Plates', emoji: '🍞', unit: 'portions', totalCapacity: 15, currentStock: 8,   reorderAt: 4,  accentColor: '#854d0e', cost: 42000 },
  // ── Food — Mains ──
  { id: 'f4',  name: 'Black Truffle Risotto',     brand: 'Kitchen',          category: 'Food', subCategory: 'Mains',        emoji: '🍄', unit: 'portions', totalCapacity: 15, currentStock: 10,  reorderAt: 4,  accentColor: '#3f3f46', cost: 45000 },
  { id: 'f5',  name: 'Pan-Seared Sea Bass',       brand: 'Kitchen',          category: 'Food', subCategory: 'Mains',        emoji: '🐟', unit: 'portions', totalCapacity: 12, currentStock: 0,   reorderAt: 3,  accentColor: '#075985', cost: 52000 },
  // ── Food — Signature Cuts ──
  { id: 'f6',  name: 'Wagyu Tomahawk 400g',       brand: 'Kitchen',          category: 'Food', subCategory: 'Signature Cuts', emoji: '🍖', unit: 'portions', totalCapacity: 8, currentStock: 2, reorderAt: 2,  accentColor: '#991b1b', cost: 185000 },
  { id: 'f7',  name: 'Jollof Lobster',            brand: 'Kitchen',          category: 'Food', subCategory: 'Signature Cuts', emoji: '🦞', unit: 'portions', totalCapacity: 10, currentStock: 6, reorderAt: 3,  accentColor: '#c2410c', cost: 95000 },
  // ── Food — Desserts ──
  { id: 'f8',  name: 'Chocolate Sphere',          brand: 'Pastry',           category: 'Food', subCategory: 'Desserts',     emoji: '🍫', unit: 'portions', totalCapacity: 15, currentStock: 9,   reorderAt: 4,  accentColor: '#3b0764', cost: 18500 },
  { id: 'f9',  name: 'Crème Brûlée',             brand: 'Pastry',           category: 'Food', subCategory: 'Desserts',     emoji: '🍮', unit: 'portions', totalCapacity: 15, currentStock: 12,  reorderAt: 4,  accentColor: '#78350f', cost: 14500 },
];

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
      // reset custom cost on open
      setCustomCost(''); 
    }
  }, [item, isOpen]);

  if (!item || !isOpen) return null;

  const afterRestock = Math.min(item.currentStock + amount, item.totalCapacity);
  const afterPct = Math.round((afterRestock / item.totalCapacity) * 100);
  // Default calculated cost based on unit
  const calculatedCost = amount * (item.cost / (item.unit === 'ml' ? 750 : 1));
  const finalCost = customCost !== '' ? Number(customCost) : Math.round(calculatedCost);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[60] px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
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
            {/* Current vs after */}
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

            {/* Amount input */}
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
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Math.min(Number(e.target.value), item.totalCapacity - item.currentStock)))}
                  className="flex-1 text-center text-xl font-bold border border-gray-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all"
                />
                <button
                  onClick={() => setAmount(a => Math.min(a + (item.unit === 'ml' ? 100 : 1), item.totalCapacity - item.currentStock))}
                  className="w-11 h-11 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all active:scale-95"
                >
                  <Plus size={16} />
                </button>
              </div>
              {/* Quick fill */}
              <div className="flex gap-2 mt-3">
                {item.unit === 'ml'
                  ? [375, 750, 1500].map(ml => (
                    <button key={ml} onClick={() => setAmount(Math.min(ml, item.totalCapacity - item.currentStock))}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-[#05431E]/40 hover:text-[#05431E] transition-all active:scale-95">
                      +{ml}ml
                    </button>
                  ))
                  : [5, 10, 'Max'].map(v => (
                    <button key={v} onClick={() => setAmount(v === 'Max' ? item.totalCapacity - item.currentStock : Math.min(Number(v), item.totalCapacity - item.currentStock))}
                      className="flex-1 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:border-[#05431E]/40 hover:text-[#05431E] transition-all active:scale-95">
                      {v === 'Max' ? 'Max' : `+${v}`}
                    </button>
                  ))
                }
                <button
                  onClick={() => setAmount(item.totalCapacity - item.currentStock)}
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg border border-[#05431E]/20 bg-[#05431E]/5 text-[#05431E] hover:bg-[#05431E]/10 transition-all active:scale-95"
                >
                  Full
                </button>
              </div>
            </div>

            {/* Cost estimate (Editable) */}
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
                    onChange={(e) => setCustomCost(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-lg py-2 pl-7 pr-3 text-sm font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* CTA */}
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
    name: '', brand: '', category: 'Spirits & Wine' as 'Spirits & Wine' | 'Food',
    subCategory: 'Whisky', emoji: '🥃', unit: 'ml',
    totalCapacity: '', currentStock: '', reorderAt: '', cost: '',
    accentColor: '#92400e',
    photo: null as File | null,
  });

  const subCatOptions = form.category === 'Spirits & Wine'
    ? ['Champagne', 'Red Wine', 'White Wine', 'Rosé', 'Whisky', 'Cognac', 'Tequila', 'Vodka', 'Gin', 'Rum', 'Cocktail Base', 'Other']
    : ['Small Plates', 'Mains', 'Signature Cuts', 'Desserts', 'Sides', 'Other'];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: form.name, brand: form.brand,
      category: form.category, subCategory: form.subCategory,
      emoji: form.emoji, unit: form.unit,
      totalCapacity: Number(form.totalCapacity),
      currentStock: Number(form.currentStock),
      reorderAt: Number(form.reorderAt),
      cost: Number(form.cost),
      accentColor: form.accentColor,
      photoUrl: form.photo ? URL.createObjectURL(form.photo) : undefined,
    });
    onClose();
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
              
              {/* Photo Upload */}
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
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any, subCategory: '' }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all">
                  <option>Spirits & Wine</option>
                  <option>Food</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Sub-Category *</label>
                <select value={form.subCategory} onChange={e => setForm(p => ({ ...p, subCategory: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all">
                  {subCatOptions.map(s => <option key={s}>{s}</option>)}
                </select>
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

// ─── STORAGE ITEM CARD ────────────────────────────────────────────────────────

const StorageCard: React.FC<{
  item: StorageItem;
  onRestock: () => void;
}> = ({ item, onRestock }) => {
  const status = getStatus(item);
  const statusCfg = STATUS_CONFIG[status];
  const pct = Math.min((item.currentStock / item.totalCapacity) * 100, 100);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all duration-200 overflow-hidden flex flex-col">
      {/* Accent strip */}
      <div className="h-1.5 w-full" style={{ background: item.accentColor }} />

      {/* Emoji / Photo + status */}
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
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 text-[9px] font-bold text-gray-500 shadow-sm">
          {item.unit === 'ml' ? '🍶' : '🍽️'} {item.subCategory}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
          <p className="text-gray-400 text-xs mt-0.5">{item.brand}</p>
        </div>

        {/* Stock bar */}
        <StockBar item={item} />

        {/* Capacity footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
          <span>Max: {item.unit === 'ml' ? `${(item.totalCapacity / 1000).toFixed(1)}L` : `${item.totalCapacity} ${item.unit}`}</span>
          <span>Alert: {item.unit === 'ml' ? `${item.reorderAt}ml` : `${item.reorderAt} ${item.unit}`}</span>
        </div>

        {/* Restock CTA */}
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
  const [items, setItems] = useState<StorageItem[]>(INITIAL_ITEMS);
  const [activeTab, setActiveTab] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [subFilter, setSubFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockItem, setRestockItem] = useState<StorageItem | null>(null);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  // Compute subcategories for current tab
  const subCategories = useMemo(() => {
    const source = activeTab === 'All' ? items : items.filter(i => i.category === activeTab);
    return ['All', ...Array.from(new Set(source.map(i => i.subCategory)))];
  }, [items, activeTab]);

  // Filter
  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchTab = activeTab === 'All' || item.category === activeTab;
      const matchSub = subFilter === 'All' || item.subCategory === subFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q);
      return matchTab && matchSub && matchSearch;
    });
  }, [items, activeTab, subFilter, search]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    low: items.filter(i => getStatus(i) === 'low').length,
    critical: items.filter(i => getStatus(i) === 'critical').length,
    out: items.filter(i => getStatus(i) === 'out').length,
  }), [items]);

  // Grouped view
  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, StorageItem[]>>((acc, item) => {
      const key = item.subCategory;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const handleRestock = (itemId: string, amount: number, customCost: number) => {
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, currentStock: Math.min(i.currentStock + amount, i.totalCapacity) } : i
    ));
    toast.success(`Stock updated successfully (Cost: ${formatCurrency(customCost)})`);
  };

  const handleAddItem = (newItem: Omit<StorageItem, 'id'>) => {
    setItems(prev => [...prev, { ...newItem, id: `custom-${Date.now()}` }]);
    toast.success(`${newItem.name} added to storage`);
  };

  const openRestock = (item: StorageItem) => {
    setRestockItem(item);
    setIsRestockOpen(true);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
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

      {/* ── Alert Summary Cards ─────────────────────────────────────────────── */}
      {(stats.out > 0 || stats.critical > 0 || stats.low > 0) && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.out > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <X size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-800">{stats.out}</p>
                <p className="text-xs text-gray-500">Out of stock</p>
              </div>
            </div>
          )}
          {stats.critical > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-xl font-black text-red-700">{stats.critical}</p>
                <p className="text-xs text-red-500">Critical level</p>
              </div>
            </div>
          )}
          {stats.low > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-black text-amber-700">{stats.low}</p>
                <p className="text-xs text-amber-500">Running low</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 bg-gray-100 rounded-2xl p-1.5 mb-6 w-full">
        {([
          { key: 'All',           label: 'All Items',       icon: <Archive size={18} />,  count: items.length },
          { key: 'Spirits & Wine', label: 'Spirits & Wine', icon: <Wine size={18} />,     count: items.filter(i => i.category === 'Spirits & Wine').length },
          { key: 'Food',          label: 'Food',            icon: <Utensils size={18} />, count: items.filter(i => i.category === 'Food').length },
        ] as { key: Category; label: string; icon: React.ReactNode; count: number }[]).map(({ key, label, icon, count }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSubFilter('All'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
              activeTab === key
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700 active:scale-95'
            }`}
          >
            {icon}
            <span>{label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === key ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/60 text-gray-400'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + Sub-filter ─────────────────────────────────────────────── */}
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

      {/* ── Grouped Grid ─────────────────────────────────────────────────────── */}
      {Object.entries(grouped).map(([subCat, catItems]) => (
        <div key={subCat} className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.1em]">{subCat}</h2>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300">{catItems.length} items</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {catItems.map(item => (
              <StorageCard key={item.id} item={item} onRestock={() => openRestock(item)} />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <Package size={48} className="mb-4" />
          <p className="text-lg font-semibold text-gray-400">Nothing found</p>
          <p className="text-sm text-gray-300 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
      <RestockModal
        item={restockItem}
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        onConfirm={handleRestock}
      />
    </div>
  );
};

export default StoragePage;
