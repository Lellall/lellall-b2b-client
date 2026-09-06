import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { Crown, Profile2User, CalendarTick, CardCoin, Printer } from 'iconsax-react';
import { useGetDashboardStatsQuery, useGetRecentActivityQuery } from '@/redux/api/private-lounge/dashboard.api';
import { useCurrency } from '@/contexts/CurrencyContext';
import PremiumMetricCard from '../../components/PremiumMetricCard';
import PremiumChart from '../../components/PremiumChart';
import QuickActions from '../../components/QuickActions';
import ActivityTable from '../../components/ActivityTable';

const BRAND_GREEN = '#05431E';

const PrintButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid ${BRAND_GREEN};
  color: ${BRAND_GREEN};
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    opacity: 0.88;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #374151;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: ${BRAND_GREEN};
    color: ${BRAND_GREEN};
  }
`;

const DateInput = styled.input`
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const TodayLink = styled.button`
  border: none;
  background: none;
  color: ${BRAND_GREEN};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const PageInfo = styled.div`
  padding: 12px 4px 0;
  font-size: 12px;
  color: #9CA3AF;
  text-align: center;
`;

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const GreetingContainer = styled.div`
  margin-bottom: 8px;
`;

const GreetingText = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #05431E;
  margin-bottom: 8px;
`;

const DateText = styled.p`
  font-size: 14px;
  color: #6B7280;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MiddleSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 8px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LoungeDashboard: React.FC = () => {
  const { user, restaurant } = useSelector(selectAuth);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const userRole = (user?.role || '').toUpperCase();

  useEffect(() => {
    if (userRole === 'HOSTESS' || userRole === 'HOST') {
      navigate('/lounge/members', { replace: true });
    }
  }, [userRole, navigate]);
  
  const { data: statsData, isLoading } = useGetDashboardStatsQuery(
    user?.privateLoungeId || '',
    { skip: !user?.privateLoungeId }
  );

  const [activityDate, setActivityDate] = useState<Date>(() => new Date());
  const [activityPage, setActivityPage] = useState(1);
  const dateParam = format(activityDate, 'yyyy-MM-dd');
  const todayParam = format(new Date(), 'yyyy-MM-dd');
  const isToday = dateParam === todayParam;

  const { data: activityData } = useGetRecentActivityQuery(
    { loungeId: user?.privateLoungeId || '', date: dateParam, page: activityPage, limit: 10 },
    { skip: !user?.privateLoungeId }
  );

  // Unpaginated pull of the same day, used only to print the full list (not just the current page)
  const { data: printActivityData } = useGetRecentActivityQuery(
    { loungeId: user?.privateLoungeId || '', date: dateParam, page: 1, limit: 500 },
    { skip: !user?.privateLoungeId }
  );
  const printActivities = printActivityData?.data ?? [];
  const printTotal = printActivities.reduce((sum: number, a: any) => sum + (a.amount || 0), 0);

  const handlePrevDay = () => {
    setActivityDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
    setActivityPage(1);
  };
  const handleNextDay = () => {
    setActivityDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
    setActivityPage(1);
  };
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [y, m, d] = e.target.value.split('-').map(Number);
    if (!y || !m || !d) return;
    setActivityDate(new Date(y, m - 1, d));
    setActivityPage(1);
  };
  const handleResetToToday = () => {
    setActivityDate(new Date());
    setActivityPage(1);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardContainer>
      <HeaderRow>
        <GreetingContainer>
          <GreetingText>Welcome back, {user?.firstName}!</GreetingText>
          <DateText>{today}</DateText>
        </GreetingContainer>
        <PrintButton onClick={() => window.print()}>
          <Printer size={16} />
          Print Report
        </PrintButton>
      </HeaderRow>

      {/* ── PRINT AREA (hidden on screen, visible on print) ── */}
      <style>{`
        @media print {
          body {
            visibility: hidden;
            background: white;
            margin: 0;
            padding: 0;
          }
          #root {
            height: 0px;
            overflow: hidden;
          }
          .print-area {
            display: block !important;
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            background: white !important;
            height: auto;
          }
          .print-area * {
            visibility: visible;
          }
          @page { margin: 0; size: auto; }
        }
      `}</style>
      <div className="hidden print-area fixed left-0 top-0 w-[80mm] bg-white z-[9999] text-gray-900 font-sans">
        <div className="text-center pb-4 border-b border-dashed border-gray-400">
          <h2 className="text-xl font-bold uppercase">{restaurant?.name || "Sanctum Airport Lounge"}</h2>
          <p className="text-xs uppercase font-semibold mt-1">
            {isToday ? 'End of Day Report' : 'Activity Report'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{format(activityDate, 'dd/MM/yyyy')}</p>
          <p className="text-[10px] text-gray-400 mt-1">Printed {new Date().toLocaleString()}</p>
        </div>
        <div className="py-4 space-y-3 border-b border-dashed border-gray-400">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">Total Active Members</span>
            <span className="font-bold">{statsData?.activeMembers?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">Pending Applications</span>
            <span className="font-bold">{statsData?.pendingApplications?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">Today's Reservations</span>
            <span className="font-bold">{statsData?.todaysReservations?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">Monthly Revenue</span>
            <span className="font-bold">{formatCurrency(statsData?.monthlyRevenue?.total || 0)}</span>
          </div>
        </div>
        <div className="py-3 border-b border-dashed border-gray-400">
          <p className="text-xs font-bold uppercase mb-2">Activity ({printActivities.length})</p>
          {printActivities.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No activity on this date</p>
          )}
          {printActivities.map((a: any, i: number) => (
            <div key={i} className="flex justify-between items-start text-xs py-1">
              <div>
                <div className="text-gray-500">
                  {a.time ? new Date(a.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  {' · '}{a.member} ({a.tier})
                </div>
                <div className="text-gray-400">{a.action}</div>
              </div>
              <span className="font-semibold whitespace-nowrap">
                {a.amount ? formatCurrency(a.amount) : '—'}
              </span>
            </div>
          ))}
        </div>
        <div className="py-3 border-b border-dashed border-gray-400">
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold uppercase">Total Payments</span>
            <span className="font-black">{formatCurrency(printTotal)}</span>
          </div>
        </div>
        <div className="py-4 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of Report</p>
        </div>
      </div>

      {/* TOP ROW: KPIs */}
      <MetricGrid>
        <PremiumMetricCard
          title="Total Active Members"
          value={statsData?.activeMembers?.total || 0}
          icon={<Crown size="20" variant="Bold" />}
          backgroundColor="#F8FAFC" // Slight blue-gray for elegance
          trend={{ value: statsData?.activeMembers?.trend || 0, isPositive: (statsData?.activeMembers?.trend || 0) >= 0 }}
        />
        <PremiumMetricCard
          title="Pending Applications"
          value={statsData?.pendingApplications?.total || 0}
          icon={<Profile2User size="20" variant="Bold" />}
          backgroundColor="#FEFCE8" // Soft gold/yellow
          trend={{ value: statsData?.pendingApplications?.trend || 0, isPositive: (statsData?.pendingApplications?.trend || 0) >= 0 }}
        />
        <PremiumMetricCard
          title="Today's Reservations"
          value={statsData?.todaysReservations?.total || 0}
          icon={<CalendarTick size="20" variant="Bold" />}
          backgroundColor="#F0FDF4" // Soft green
          trend={{ value: statsData?.todaysReservations?.trend || 0, isPositive: (statsData?.todaysReservations?.trend || 0) >= 0 }}
        />
        <PremiumMetricCard
          title="Monthly Revenue"
          value={statsData?.monthlyRevenue?.total || 0}
          isCurrency={true}
          icon={<CardCoin size="20" variant="Bold" />}
          backgroundColor="#F9FAFB" // Clean white/gray
          trend={{ value: statsData?.monthlyRevenue?.trend || 0, isPositive: (statsData?.monthlyRevenue?.trend || 0) >= 0 }}
        />
      </MetricGrid>

      {/* MIDDLE ROW: Charts & Actions */}
      <MiddleSection>
        <PremiumChart trends={statsData?.revenueTrends || []} />
        <QuickActions pendingCount={statsData?.pendingApplications?.total || 0} />
      </MiddleSection>

      {/* BOTTOM ROW: Recent Activity */}
      <ActivityTable
        activities={activityData?.data ?? statsData?.recentActivity ?? []}
        headerRight={
          <FilterBar>
            {!isToday && <TodayLink onClick={handleResetToToday}>Today</TodayLink>}
            <NavButton onClick={handlePrevDay}>← Prev</NavButton>
            <DateInput type="date" value={dateParam} max={todayParam} onChange={handleDateInputChange} />
            <NavButton disabled={isToday} onClick={handleNextDay}>Next →</NavButton>
          </FilterBar>
        }
        footer={
          activityData && activityData.total > 0 ? (
            <PageInfo>
              <NavButton disabled={activityPage <= 1} onClick={() => setActivityPage((p) => Math.max(1, p - 1))}>
                ← Previous
              </NavButton>
              {' '}Page {activityPage} of {activityData.totalPages} · {activityData.total} items{' '}
              <NavButton
                disabled={activityPage >= activityData.totalPages}
                onClick={() => setActivityPage((p) => Math.min(activityData.totalPages, p + 1))}
              >
                Next →
              </NavButton>
            </PageInfo>
          ) : null
        }
      />

    </DashboardContainer>
  );
};

export default LoungeDashboard;
