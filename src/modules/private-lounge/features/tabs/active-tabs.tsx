import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Clock, ShoppingCart, CheckCircle2, Users } from 'lucide-react';
import { RootState } from '../../../../redux/store';
import { ActiveTab, ActiveTabKind, tabKey, useGetActiveTabsQuery } from '../../../../redux/api/private-lounge/tabs.api';
import { CloseTabModal } from './close-tab-modal';
import { useLoungeRole } from '../../hooks/use-lounge-role';
import { MemberCloseTabModal } from './member-close-tab-modal';

const formatCurrency = (n: number) => '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 });

// A guest who has been checked in this long without ordering needs attention
const WAITING_ALERT_MINUTES = 10;

const minutesSince = (iso: string, now: number) => Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));

const formatDuration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const kindLabel = (tab: ActiveTab): string => {
  const labels: Record<ActiveTabKind, string> = {
    MEMBER: `${tab.tier ?? ''} member`.trim(),
    DESIGNATED_MEMBER: 'Designated member',
    GUEST_PASS: 'Pass guest',
    WALK_IN: 'Walk-in',
  };
  return labels[tab.kind];
};

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';

type Filter = 'ALL' | 'WAITING' | 'ATTENDED';

export const ActiveTabs: React.FC = () => {
  const navigate = useNavigate();
  const { canOperate } = useLoungeRole();
  const user = useSelector((state: RootState) => state.auth.user);
  const loungeId = user?.privateLoungeId || '';
  const [filter, setFilter] = useState<Filter>('ALL');
  const [now, setNow] = useState(Date.now());
  const [closingTab, setClosingTab] = useState<ActiveTab | null>(null);

  // Keep the waiting times ticking, and the list fresh while the page is open
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const { data, isLoading } = useGetActiveTabsQuery(loungeId, { skip: !loungeId, pollingInterval: 15000 });

  const tabs = data?.tabs ?? [];
  const summary = data?.summary ?? { total: 0, waiting: 0, attended: 0 };
  const visible = tabs.filter((tab) => filter === 'ALL' || tab.status === filter);

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'ALL', label: 'All open', count: summary.total },
    { key: 'WAITING', label: 'Waiting', count: summary.waiting },
    { key: 'ATTENDED', label: 'Attended', count: summary.attended },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Tabs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Everyone who is checked in right now. A guest shows as waiting until their first order is taken.
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
              filter === key
                ? 'bg-[#05431E] text-white border-[#05431E]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {label} <span className={filter === key ? 'text-white/80' : 'text-gray-400'}>{count}</span>
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-gray-400">Loading open tabs…</p>}

      {!isLoading && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-300">
          <Users size={44} className="mb-4" />
          <p className="text-lg font-semibold text-gray-400">
            {summary.total === 0 ? 'Nobody is checked in' : `Nobody is ${filter.toLowerCase()}`}
          </p>
          {summary.total === 0 && <p className="text-sm mt-1">People appear here as soon as they are checked in.</p>}
        </div>
      )}

      <div className="space-y-3">
        {visible.map((tab) => {
          const inMinutes = minutesSince(tab.checkedInAt, now);
          const urgent = tab.status === 'WAITING' && inMinutes >= WAITING_ALERT_MINUTES;
          return (
            <div
              key={tabKey(tab)}
              className={`flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border ${
                urgent ? 'border-red-200' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-11 h-11 rounded-full bg-[#05431E]/10 text-[#05431E] font-bold flex items-center justify-center shrink-0">
                  {initials(tab.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">{tab.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {kindLabel(tab)}
                    {tab.sponsorName ? ` of ${tab.sponsorName}` : ''}
                    {tab.reference ? ` · ${tab.reference}` : ''}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock size={12} /> In for {formatDuration(inMinutes)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(tab.orderTotal)}</p>
                  <p className="text-xs text-gray-400">
                    {tab.orderCount} {tab.orderCount === 1 ? 'order' : 'orders'}
                  </p>
                </div>

                {tab.status === 'WAITING' ? (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border ${
                      urgent
                        ? 'text-red-700 bg-red-50 border-red-200'
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}
                  >
                    <Clock size={12} /> Waiting {formatDuration(inMinutes)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border text-green-700 bg-green-50 border-green-200">
                    <CheckCircle2 size={12} /> Attended
                    {tab.lastOrderAt ? ` · ${formatDuration(minutesSince(tab.lastOrderAt, now))} ago` : ''}
                  </span>
                )}

                {/* The accountant only watches the tabs; taking orders and closing them is for the floor staff */}
                {canOperate && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/lounge/menu?tab=${encodeURIComponent(tabKey(tab))}`)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#05431E] hover:bg-[#042f15] transition-colors"
                  >
                    <ShoppingCart size={14} /> Take order
                  </button>
                  {/* Pass guests and walk-ins settle their own tab here; a member's tab closes in one step */}
                  <button
                    onClick={() => setClosingTab(tab)}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold text-[#05431E] bg-white border border-[#05431E]/30 hover:bg-green-50 transition-colors"
                  >
                    Close tab
                  </button>
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {closingTab && (closingTab.kind === 'MEMBER' || closingTab.kind === 'DESIGNATED_MEMBER') ? (
        <MemberCloseTabModal
          key={tabKey(closingTab)}
          visitId={closingTab.id}
          name={closingTab.name}
          orderTotal={closingTab.orderTotal}
          orderCount={closingTab.orderCount}
          onClose={() => setClosingTab(null)}
        />
      ) : (
        <CloseTabModal key={closingTab ? tabKey(closingTab) : 'none'} tab={closingTab} onClose={() => setClosingTab(null)} />
      )}
    </div>
  );
};
