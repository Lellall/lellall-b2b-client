import React, { useState, useEffect } from 'react';
import {
  Wine, Utensils, ShoppingCart, X, Plus, Minus, Search,
  Droplets, Star, Flame, ChevronRight,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store';
import { toast } from 'react-toastify';
import { useGetInventoryItemsQuery } from '../../../../redux/api/private-lounge/inventory.api';
import { useCreateOrderMutation } from '../../../../redux/api/private-lounge/orders.api';
import { useGetTodaysWalkInsQuery } from '../../../../redux/api/private-lounge/walk-ins.api';
import { useGetAllMembersQuery } from '../../../../redux/api/private-lounge/members.api';

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tag?: 'chef-special' | 'popular' | 'new' | 'signature';
  emoji: string;
  pairedWith?: string;
  color: string; // card accent strip color
}

interface BottlePourItem {
  id: string;
  bottleName: string;
  brandName: string;
  remainingPercent: number;
  totalVolumeMl: number;
  remainingVolumeMl: number;
  spirit: string;
  liquidColor: string;
}

interface OrderItem {
  item: MenuItem;
  qty: number;
}

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────

const foodItems: MenuItem[] = [
  { id: 'f1', name: 'Wagyu Beef Tataki', description: 'Seared wagyu with ponzu, micro herbs & truffle oil.', price: 38500, category: 'Small Plates', tag: 'chef-special', emoji: '🥩', color: '#7c2d12', pairedWith: 'Barolo or a bold Cabernet' },
  { id: 'f2', name: 'Lobster Bisque', description: 'Velvety bisque, Cognac cream, chive oil.', price: 28000, category: 'Small Plates', tag: 'popular', emoji: '🦞', color: '#9a3412', pairedWith: 'Chardonnay or Champagne' },
  { id: 'f3', name: 'Foie Gras Torchon', description: 'Brioche, Sauternes gelée, Granny Smith apple.', price: 42000, category: 'Small Plates', tag: 'signature', emoji: '🍞', color: '#854d0e' },
  { id: 'f4', name: 'Black Truffle Risotto', description: 'Arborio, 24-month aged parmesan, summer truffle.', price: 45000, category: 'Mains', tag: 'chef-special', emoji: '🍄', color: '#3f3f46', pairedWith: 'Burgundy Pinot Noir' },
  { id: 'f5', name: 'Pan-Seared Sea Bass', description: 'Crispy skin, saffron velouté, braised fennel, capers.', price: 52000, category: 'Mains', tag: 'popular', emoji: '🐟', color: '#075985', pairedWith: 'Chablis or Sauvignon Blanc' },
  { id: 'f6', name: 'Wagyu Tomahawk 400g', description: '45-day dry-aged, chimichurri, bone-marrow butter.', price: 185000, category: 'Signature Cuts', tag: 'chef-special', emoji: '🍖', color: '#991b1b', pairedWith: 'Opus One or Screaming Eagle' },
  { id: 'f7', name: 'Jollof Lobster', description: 'Whole lobster, smoked tomato jollof, coconut foam.', price: 95000, category: 'Signature Cuts', tag: 'new', emoji: '🦞', color: '#c2410c', pairedWith: 'Dry Rosé or Viognier' },
  { id: 'f8', name: 'Chocolate Sphere', description: 'Dark chocolate shell, passion fruit curd, gold leaf.', price: 18500, category: 'Desserts', emoji: '🍫', color: '#3b0764' },
  { id: 'f9', name: 'Crème Brûlée', description: 'Madagascan vanilla, caramelised sugar crust.', price: 14500, category: 'Desserts', tag: 'popular', emoji: '🍮', color: '#78350f' },
];

const drinkItems: MenuItem[] = [
  { id: 'd1', name: 'Dom Pérignon 2015', description: 'Blanc. Stone fruit, toasted brioche, mineral finish.', price: 485000, category: 'Champagne & Sparkling', tag: 'chef-special', emoji: '🥂', color: '#854d0e' },
  { id: 'd2', name: 'Billecart-Salmon Rosé NV', description: 'Elegant rosé, strawberry, cream, delicate bubbles.', price: 185000, category: 'Champagne & Sparkling', tag: 'popular', emoji: '🍾', color: '#9f1239' },
  { id: 'd3', name: 'Moët & Chandon Impérial', description: 'Green apple, citrus zest, white peach.', price: 125000, category: 'Champagne & Sparkling', emoji: '🥂', color: '#713f12' },
  { id: 'd4', name: 'Opus One 2019', description: 'Napa Valley. Blackcurrant, tobacco, cassis & cedar.', price: 650000, category: 'Red Wine', tag: 'chef-special', emoji: '🍷', color: '#7f1d1d' },
  { id: 'd5', name: 'Screaming Eagle 2018', description: 'Cult Napa. Dense dark fruit, seamless tannins.', price: 4200000, category: 'Red Wine', emoji: '🦅', color: '#450a0a' },
  { id: 'd6', name: 'Macallan 18 Year', description: 'Double Oak. Dried fruit, vanilla, ginger & oak.', price: 285000, category: 'Whisky & Spirits', tag: 'popular', emoji: '🥃', color: '#92400e' },
  { id: 'd7', name: 'Hennessy Paradis', description: 'Fine Champagne cognac. Jasmine, rose, honey.', price: 1800000, category: 'Whisky & Spirits', emoji: '🥃', color: '#78350f' },
  { id: 'd8', name: 'Louis XIII', description: 'Rémy Martin. 1200 eaux-de-vie. Exceptional rarity.', price: 6500000, category: 'Whisky & Spirits', tag: 'chef-special', emoji: '👑', color: '#7c2d12' },
  { id: 'd9', name: 'Patrón El Alto', description: 'Extra Añejo. Agave, caramel, white chocolate.', price: 380000, category: 'Whisky & Spirits', tag: 'new', emoji: '🌵', color: '#365314' },
  { id: 'd10', name: 'Signature Negroni', description: 'Batch-clarified, Campari, sweet vermouth, smoked orange.', price: 35000, category: 'Cocktails', tag: 'popular', emoji: '🍊', color: '#7c2d12' },
  { id: 'd11', name: 'Lounge Old Fashioned', description: 'Woodford Reserve, demerara, Angostura, cherry smoke.', price: 38000, category: 'Cocktails', tag: 'popular', emoji: '🍒', color: '#881337' },
  { id: 'd12', name: 'Gold Rush', description: 'Buffalo Trace, honey lavender syrup, fresh lemon.', price: 32000, category: 'Cocktails', emoji: '🏆', color: '#713f12' },
];

const sampleBottles: BottlePourItem[] = [
  { id: 'b1', bottleName: 'Macallan 18', brandName: 'The Macallan', remainingPercent: 65, totalVolumeMl: 700, remainingVolumeMl: 455, spirit: 'Whisky', liquidColor: '#C9A84C' },
  { id: 'b2', bottleName: 'Hennessy VS', brandName: 'Hennessy', remainingPercent: 22, totalVolumeMl: 700, remainingVolumeMl: 154, spirit: 'Cognac', liquidColor: '#A0522D' },
  { id: 'b3', bottleName: 'Dom Pérignon', brandName: 'Moët & Chandon', remainingPercent: 88, totalVolumeMl: 750, remainingVolumeMl: 660, spirit: 'Champagne', liquidColor: '#D4B843' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

const TAG_CONFIG: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
  'chef-special': { label: "Chef's Special", className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Star size={10} className="fill-amber-500 text-amber-500" /> },
  'popular': { label: 'Popular', className: 'bg-green-50 text-green-700 border-green-200', icon: <Flame size={10} className="text-green-600" /> },
  'new': { label: 'New', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'signature': { label: 'Signature', className: 'bg-purple-50 text-purple-700 border-purple-200' },
};

// ─── MINI BOTTLE SVG ─────────────────────────────────────────────────────────

const MiniBottle: React.FC<{ pct: number; color: string; size?: number }> = ({ pct, color, size = 56 }) => {
  const h = size * 1.7;
  return (
    <div style={{ width: size, height: h, flexShrink: 0 }}>
      <svg viewBox="0 0 56 96" width="100%" height="100%">
        <defs>
          <clipPath id={`mc-${color.replace('#', '')}-${pct}`}>
            <rect x="0" y={`${100 - pct}%`} width="56" height={`${pct}%`} />
          </clipPath>
          <linearGradient id={`mg-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="60%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="mgg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="35%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
        </defs>
        {/* Bottle neck cap */}
        <rect x="22" y="2" width="12" height="8" rx="2" fill="#374151" />
        {/* Bottle body */}
        <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
          fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
        {/* Liquid fill */}
        <g clipPath={`url(#mc-${color.replace('#', '')}-${pct})`}>
          <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
            fill={`url(#mg-${color.replace('#', '')})`} />
        </g>
        {/* Glass highlights */}
        <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
          fill="url(#mgg)" pointerEvents="none" />
        {/* Label */}
        <rect x="12" y="60" width="32" height="20" rx="2" fill="white" opacity="0.7" />
      </svg>
    </div>
  );
};

// ─── POUR VISUAL ──────────────────────────────────────────────────────────────

const PourVisual: React.FC<{
  bottle: BottlePourItem;
  pourMl: number;
  onPourChange: (ml: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ bottle, pourMl, onPourChange, onConfirm, onCancel }) => {
  const clampedMl = Math.min(pourMl, bottle.remainingVolumeMl);
  const afterPct = ((bottle.remainingVolumeMl - clampedMl) / bottle.totalVolumeMl) * 100;
  const glassFillPct = Math.min(clampedMl / 200, 1);

  return (
    <div className="space-y-6">
      {/* Bottle + Glass visualisation */}
      <div className="flex items-end justify-center gap-10">
        {/* Bottle */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Bottle</p>
          <div style={{ width: 56, height: 96, position: 'relative' }}>
            <svg viewBox="0 0 56 96" width="100%" height="100%">
              <defs>
                <clipPath id="pourBottleClip">
                  <rect x="0" y={`${100 - afterPct}%`} width="56" height={`${afterPct}%`} />
                </clipPath>
                {clampedMl > 0 && (
                  <clipPath id="pourRedClip">
                    <rect x="0" y={`${100 - bottle.remainingPercent}%`} width="56" height={`${bottle.remainingPercent - afterPct}%`} />
                  </clipPath>
                )}
              </defs>
              <rect x="22" y="2" width="12" height="8" rx="2" fill="#374151" />
              <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
                fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
              {/* Remaining liquid */}
              <g clipPath="url(#pourBottleClip)">
                <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
                  fill={bottle.liquidColor} />
              </g>
              {/* Pour amount shown in red */}
              {clampedMl > 0 && (
                <g clipPath="url(#pourRedClip)">
                  <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
                    fill="#ef4444" opacity="0.3" />
                </g>
              )}
              <path d="M 20 10 L 18 10 L 18 28 C 18 36, 6 44, 6 52 L 6 86 C 6 92, 10 94, 28 94 C 46 94, 50 92, 50 86 L 50 52 C 50 44, 38 36, 38 28 L 38 10 Z"
                fill="url(#mgg)" pointerEvents="none" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 font-mono">{Math.round(afterPct)}% • {Math.round(bottle.remainingVolumeMl - clampedMl)}ml left</p>
        </div>

        {/* Arrow */}
        <ChevronRight size={20} className="text-gray-300 mb-6" />

        {/* Glass */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Glass</p>
          <div style={{ width: 48, height: 80 }}>
            <svg viewBox="0 0 48 80" width="100%" height="100%">
              <path d="M 6 4 L 2 68 L 46 68 L 42 4 Z" fill="white" stroke="#e5e7eb" strokeWidth="1.5" />
              <rect x="0" y="68" width="48" height="8" rx="2" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" />
              {glassFillPct > 0 && (() => {
                const liquidH = glassFillPct * 55;
                const yStart = 68 - liquidH;
                const scaleL = (yStart / 4);
                const xL = 2 + (scaleL / 64) * 4;
                const xR = 46 - (scaleL / 64) * 4;
                return (
                  <path d={`M ${xL} ${yStart} L 2 68 L 46 68 L ${xR} ${yStart} Z`}
                    fill={bottle.liquidColor} opacity="0.6" />
                );
              })()}
              {/* Level lines */}
              {[25, 50, 75].map(lvl => {
                const y = 68 - (lvl / 100) * 55;
                const xL = 2 + ((68 - y) / 64) * 4;
                const xR = 46 - ((68 - y) / 64) * 4;
                return <line key={lvl} x1={xL} y1={y} x2={xR} y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="3,2" />;
              })}
            </svg>
          </div>
          <p className="text-xs text-gray-500 font-mono">{clampedMl}ml</p>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>0ml</span>
          <span className="text-[#05431E] font-bold">{clampedMl}ml selected</span>
          <span>{bottle.remainingVolumeMl}ml max</span>
        </div>
        <input
          type="range"
          min={0}
          max={bottle.remainingVolumeMl}
          step={5}
          value={clampedMl}
          onChange={(e) => onPourChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#05431E]"
        />
        {/* Quick amounts */}
        <div className="flex gap-2 justify-center">
          {[30, 60, 90, 120].map((ml) => (
            <button
              key={ml}
              onClick={() => onPourChange(Math.min(ml, bottle.remainingVolumeMl))}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${clampedMl === ml
                ? 'bg-[#05431E] border-[#05431E] text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[#05431E]/40 hover:text-[#05431E]'}`}
            >
              {ml}ml
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={clampedMl === 0}
          className="flex-1 py-2.5 rounded-xl bg-[#05431E] hover:bg-[#042f15] text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
        >
          <Droplets size={15} />
          Log {clampedMl}ml Pour
        </button>
      </div>
    </div>
  );
};

// ─── MENU ITEM CARD ───────────────────────────────────────────────────────────

const MenuItemCard: React.FC<{
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  tab: 'food' | 'drinks';
}> = ({ item, qty, onAdd, onRemove, tab }) => {
  const tagCfg = item.tag ? TAG_CONFIG[item.tag] : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all duration-200 overflow-hidden flex flex-col">
      {/* Coloured accent top bar */}
      <div className="h-1.5 w-full" style={{ background: item.color }} />

      {/* Emoji hero — taller for tablet */}
      <div className="relative flex items-center justify-center h-24 bg-gray-50 border-b border-gray-100">
        <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.emoji}</span>
        {tagCfg && (
          <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wide ${tagCfg.className}`}>
            {tagCfg.icon}
            {tagCfg.label}
          </div>
        )}
        {qty > 0 && (
          <div className="absolute top-3 right-3 w-6 h-6 bg-[#05431E] rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm">
            {qty}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.name}</h3>
          <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
        </div>

        {tab === 'food' && item.pairedWith && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Wine size={12} />
            <span>Pairs well: {item.pairedWith}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <p className="font-bold text-gray-900 text-sm">{formatCurrency(item.price)}</p>
          <div className="flex items-center gap-2">
            {qty > 0 ? (
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-2 py-1.5">
                {/* min-w/h 44px for touch */}
                <button onClick={onRemove} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all active:scale-90">
                  <Minus size={14} />
                </button>
                <span className="text-sm font-bold text-gray-900 min-w-[20px] text-center">{qty}</span>
                <button onClick={onAdd} className="w-7 h-7 rounded-lg hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all active:scale-90">
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#05431E]/10 hover:bg-[#05431E]/20 text-[#05431E] text-xs font-bold border border-[#05431E]/20 hover:border-[#05431E]/40 transition-all active:scale-95"
              >
                <Plus size={14} />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CATEGORY PILL ────────────────────────────────────────────────────────────

const CategoryPill: React.FC<{ label: string; active: boolean; count: number; onClick: () => void }> = ({ label, active, count, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 min-h-[32px] ${active
      ? 'bg-[#05431E] text-white border-[#05431E] shadow-sm'
      : 'bg-white text-gray-600 border-gray-200 hover:border-[#05431E]/40 hover:text-[#05431E] active:scale-95'}`}
  >
    {label}
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
  </button>
);

// ─── ORDER PANEL ──────────────────────────────────────────────────────────────

const OrderPanel: React.FC<{
  order: OrderItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  total: number;
  isOpen: boolean;
  onClose: () => void;
  activeLoungeId: string;
}> = ({ order, onRemove, onClear, total, isOpen, onClose, activeLoungeId }) => {
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { data: walkInsData } = useGetTodaysWalkInsQuery(activeLoungeId, { skip: !activeLoungeId });
  const walkIns = walkInsData?.walkIns || [];
  const { data: members = [] } = useGetAllMembersQuery(activeLoungeId, { skip: !activeLoungeId });
  const [selectedCustomer, setSelectedCustomer] = useState<string>(''); // format "walkIn:id" or "member:id" or "anonymous"

  const activeWalkIns = walkIns.filter((w: any) => w.status === 'CHECKED_IN');
  const checkedInMembers = members.filter((m: any) => m.visits && m.visits.length > 0);

  const handleConfirmOrder = async () => {
    if (!activeLoungeId) return;
    try {
      const orderData: any = {
        items: order.map(o => ({ 
          inventoryItemId: o.item.id, 
          quantity: o.qty,
          unitPrice: o.item.price,
          totalPrice: o.item.price * o.qty
        }))
      };
      if (selectedCustomer.startsWith('walkIn:')) {
        orderData.walkInId = selectedCustomer.split(':')[1];
      } else if (selectedCustomer.startsWith('member:')) {
        orderData.membershipId = selectedCustomer.split(':')[1];
      }

      await createOrder({ loungeId: activeLoungeId, ...orderData }).unwrap();
      toast.success('Order placed successfully!');
      onClear();
      onClose();
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  return (
  <>
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
    <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div>
          <h2 className="text-gray-900 font-bold text-xl">Order Summary</h2>
          <p className="text-gray-400 text-sm mt-0.5">{order.reduce((s, o) => s + o.qty, 0)} items selected</p>
        </div>
        {/* Large close button for touch */}
        <button onClick={onClose} className="w-11 h-11 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {order.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-300">
            <ShoppingCart size={40} className="mb-3" />
            <p className="text-base">No items selected yet</p>
          </div>
        ) : (
          order.map(({ item, qty }) => (
            <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-base font-semibold truncate">{item.name}</p>
                <p className="text-gray-400 text-sm">{qty} × {formatCurrency(item.price)}</p>
              </div>
              <div className="text-right">
                <p className="text-[#05431E] text-base font-bold">{formatCurrency(item.price * qty)}</p>
                {/* Large touch remove */}
                <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 text-sm mt-1 transition-colors px-1 py-1">remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {order.length > 0 && (
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Order To</label>
            <select 
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20"
              value={selectedCustomer}
              onChange={e => setSelectedCustomer(e.target.value)}
            >
              <option value="" disabled>-- Select Customer --</option>
              {activeWalkIns.length > 0 && <optgroup label="Walk-Ins">
                {activeWalkIns.map(w => <option key={w.id} value={`walkIn:${w.id}`}>Walk-In: {w.guestName}</option>)}
              </optgroup>}
              {checkedInMembers.length > 0 && <optgroup label="Checked-In Members">
                {checkedInMembers.map((m: any) => <option key={m.id} value={`member:${m.id}`}>Member: {m.fullName}</option>)}
              </optgroup>}
            </select>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-base">Total</span>
            <span className="text-gray-900 font-bold text-2xl">{formatCurrency(total)}</span>
          </div>
          {/* Large CTA for tablet */}
          <button 
            disabled={isLoading || !selectedCustomer}
            onClick={handleConfirmOrder}
            className="w-full py-4 rounded-2xl bg-[#05431E] hover:bg-[#042f15] active:scale-[0.98] text-white font-bold text-base transition-all shadow-sm"
          >
            {isLoading ? 'Processing...' : 'Confirm Order'}
          </button>
          <button onClick={onClear} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2">
            Clear all items
          </button>
        </div>
      )}
    </div>
  </>
  );
};

// ─── BOTTLE POUR MODAL ────────────────────────────────────────────────────────

const BottlePourModal: React.FC<{
  bottle: BottlePourItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bottleId: string, ml: number) => void;
}> = ({ bottle, isOpen, onClose, onConfirm }) => {
  const [pourMl, setPourMl] = useState(60);
  useEffect(() => { setPourMl(60); }, [bottle]);
  if (!bottle) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60] transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'} px-4`}>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-gray-900 font-bold text-lg">{bottle.bottleName}</h3>
              <p className="text-gray-400 text-sm">{bottle.brandName} · {bottle.spirit}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all">
              <X size={16} />
            </button>
          </div>
          <PourVisual
            bottle={bottle}
            pourMl={pourMl}
            onPourChange={setPourMl}
            onConfirm={() => { onConfirm(bottle.id, pourMl); onClose(); }}
            onCancel={onClose}
          />
        </div>
      </div>
    </>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const LoungeMenuPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [activeTab, setActiveTab] = useState<'food' | 'drinks' | 'bottle-pour'>('food');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<BottlePourItem | null>(null);
  const [isPourModalOpen, setIsPourModalOpen] = useState(false);

  const { data: inventory = [] } = useGetInventoryItemsQuery(user?.privateLoungeId || '', { skip: !user?.privateLoungeId });
  
  const mappedFoodItems = inventory.filter(i => i.category === 'Food').map(i => ({
    id: i.id, name: i.name, description: i.brand, price: i.cost, category: i.subCategory, emoji: i.emoji, color: i.accentColor
  }));
  const mappedDrinkItems = inventory.filter(i => i.category === 'Spirits & Wine').map(i => ({
    id: i.id, name: i.name, description: i.brand, price: i.cost, category: i.subCategory, emoji: i.emoji, color: i.accentColor
  }));

  const items = activeTab === 'food' ? mappedFoodItems : activeTab === 'drinks' ? mappedDrinkItems : [];
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const grouped = filteredItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const getQty = (id: string) => orderItems.find(o => o.item.id === id)?.qty || 0;

  const handleAdd = (item: MenuItem) => {
    setOrderItems(prev => {
      const ex = prev.find(o => o.item.id === item.id);
      return ex ? prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o) : [...prev, { item, qty: 1 }];
    });
  };

  const handleRemoveOne = (item: MenuItem) => {
    setOrderItems(prev => {
      const ex = prev.find(o => o.item.id === item.id);
      if (!ex || ex.qty <= 1) return prev.filter(o => o.item.id !== item.id);
      return prev.map(o => o.item.id === item.id ? { ...o, qty: o.qty - 1 } : o);
    });
  };

  const totalCount = orderItems.reduce((s, o) => s + o.qty, 0);
  const totalAmount = orderItems.reduce((s, { item, qty }) => s + item.price * qty, 0);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setActiveCategory('All');
    setSearch('');
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menu Concierge</h1>
          <p className="text-xs text-gray-500 mt-1">Browse food & drinks, log pours from member bottle lockers</p>
        </div>
        {/* Large touch button for hostess */}
        <button
          onClick={() => setIsOrderOpen(true)}
          className="relative flex items-center gap-2 bg-[#05431E] hover:bg-[#042f15] active:scale-[0.98] text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm min-h-[36px]"
        >
          <ShoppingCart size={16} />
          View Order
          {totalCount > 0 && (
            <span className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow">
              {totalCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Main Tabs — full width, large touch targets for tablet ──────── */}
      <div className="flex gap-2 bg-gray-100 rounded-3xl p-2 mb-10 w-full">
        {[
          { key: 'food', label: 'Food', icon: <Utensils size={20} /> },
          { key: 'drinks', label: 'Drinks & Spirits', icon: <Wine size={20} /> },
          { key: 'bottle-pour', label: 'Bottle Pour', icon: <Droplets size={20} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all duration-150 min-h-[40px] ${activeTab === key
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-500 hover:text-gray-700 active:scale-95'}`}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Bottle Pour Tab ─────────────────────────────────────────────── */}
      {activeTab === 'bottle-pour' && (
        <div className="space-y-6">
          <p className="text-base text-gray-500">Select a bottle from the member's locker to log a pour. Tap to open the pour logger.</p>
          {/* 1-col on small tablets, 2-col on larger */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sampleBottles.map((bottle) => (
              <button
                key={bottle.id}
                onClick={() => { setSelectedBottle(bottle); setIsPourModalOpen(true); }}
                className="group flex items-center gap-5 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 active:scale-[0.99] transition-all duration-200 text-left w-full min-h-[88px]"
              >
                <MiniBottle pct={bottle.remainingPercent} color={bottle.liquidColor} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-bold text-base truncate">{bottle.bottleName}</p>
                  <p className="text-gray-500 text-sm">{bottle.brandName} · {bottle.spirit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${bottle.remainingPercent}%`, backgroundColor: bottle.liquidColor }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 font-mono">{bottle.remainingPercent}%</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{bottle.remainingVolumeMl}ml remaining</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {bottle.remainingPercent < 25 && (
                    <span className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-600 text-[9px] font-bold uppercase tracking-wide">Low</span>
                  )}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#05431E] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Food / Drinks Tab ────────────────────────────────────────────── */}
      {(activeTab === 'food' || activeTab === 'drinks') && (
        <>
          {/* Search — full width, large touch input */}
          <div className="mb-5">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'food' ? 'dishes' : 'drinks'}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#05431E]/20 focus:border-[#05431E] transition-all text-sm min-h-[40px]"
              />
            </div>
          </div>

          {/* Category pills — larger, easy to tap */}
          <div className="flex gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {categories.map(cat => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                count={cat === 'All' ? items.length : items.filter(i => i.category === cat).length}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          {/* Grouped grid */}
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-[0.1em]">{category}</h2>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-300">{catItems.length} items</span>
              </div>
              {/* 2-col on tablet (accounting for sidebar), 3-col on larger desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {catItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    qty={getQty(item.id)}
                    onAdd={() => handleAdd(item)}
                    onRemove={() => handleRemoveOne(item)}
                    tab={activeTab}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-gray-300">
              <Search size={44} className="mb-4" />
              <p className="text-lg font-semibold text-gray-400">No results for "{search}"</p>
              <p className="text-base mt-1 text-gray-300">Try a different search or category</p>
            </div>
          )}
        </>
      )}

      {/* ── Order Panel ──────────────────────────────────────────────────── */}
      <OrderPanel
        order={orderItems}
        onRemove={(id) => setOrderItems(prev => prev.filter(o => o.item.id !== id))}
        onClear={() => setOrderItems([])}
        total={totalAmount}
        isOpen={isOrderOpen}
        onClose={() => setIsOrderOpen(false)}
        activeLoungeId={user?.privateLoungeId}
      />

      {/* ── Bottle Pour Modal ────────────────────────────────────────────── */}
      <BottlePourModal
        bottle={selectedBottle}
        isOpen={isPourModalOpen}
        onClose={() => setIsPourModalOpen(false)}
        onConfirm={(bottleId, ml) => console.log(`Pour logged: ${ml}ml from bottle ${bottleId}`)}
      />
    </div>
  );
};

export default LoungeMenuPage;
