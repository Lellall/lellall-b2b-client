import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { ShoppingCart, Printer } from 'iconsax-react';
import { useGetPerfumeDashboardStatsQuery } from '@/redux/api/perfume-store/dashboard.api';
import { useCurrency } from '@/contexts/CurrencyContext';
import SalesCard from '@/components/ui/sales-card';

// ─── BRAND CONSTANT ───────────────────────────────────────────────────────────
const BRAND_GREEN = '#05431E';

// ─── STYLED COMPONENTS ────────────────────────────────────────────────────────

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #F3F4F6;
`;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
`;

const PageSubtitle = styled.p`
  font-size: 13px;
  color: #9CA3AF;
`;

const POSButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${BRAND_GREEN};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.88;
  }
`;

const SalesCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const MetricLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const MetricIconBox = styled.div<{ alert?: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.alert ? 'rgba(239,68,68,0.08)' : `${BRAND_GREEN}10`};
  color: ${props => props.alert ? '#EF4444' : BRAND_GREEN};
  flex-shrink: 0;
`;

const MetricValue = styled.div<{ alert?: boolean }>`
  font-size: 30px;
  font-weight: 700;
  color: ${props => props.alert ? '#EF4444' : '#111827'};
  letter-spacing: -0.5px;
  line-height: 1.1;
`;

const MetricTrend = styled.span<{ positive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.positive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'};
  color: ${props => props.positive ? '#10B981' : '#EF4444'};
`;

const Section = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F3F4F6;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 14px 24px;
  font-size: 11px;
  font-weight: 700;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: #FAFAFA;
  border-bottom: 1px solid #F3F4F6;
`;

const Td = styled.td`
  padding: 14px 24px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #F9FAFB;
`;

const StatusPill = styled.span<{ completed: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: ${props => props.completed ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)'};
  color: ${props => props.completed ? '#059669' : '#D97706'};
  border: 1px solid ${props => props.completed ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #9CA3AF;
`;

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

const StoreDashboard: React.FC = () => {
  const { user, restaurant } = useSelector(selectAuth);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const userRole = (user?.role || '').toUpperCase();

  // perfumeStoreId may be on user (after new login), or fallback to restaurant id
  // Make sure we prefer perfumeStoreId if it exists to fetch the correct stats
  const storeId = user?.perfumeStoreId || restaurant?.id || '';

  useEffect(() => {
    if (userRole === 'HOSTESS' || userRole === 'HOST') {
      navigate('/perfume/menu', { replace: true });
    }
  }, [userRole, navigate]);

  const { data: stats, isLoading } = useGetPerfumeDashboardStatsQuery(
    storeId,
    { skip: !storeId }
  );

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const weeklySales = stats?.sales?.weekly?.total ?? 0;
  const monthlySales = stats?.sales?.monthly?.total ?? 0;
  const allTimeSales = stats?.sales?.allTime?.total ?? 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: BRAND_GREEN }}></div>
      </div>
    );
  }

  return (
    <PageContainer>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <PageHeader>
        <div>
          <PageTitle>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName} 👋
          </PageTitle>
          <PageSubtitle>{today}</PageSubtitle>
        </div>
        <div className="flex gap-3">
          <POSButton 
            onClick={() => window.print()}
            style={{ background: 'transparent', border: `2px solid ${BRAND_GREEN}`, color: BRAND_GREEN }}
          >
            <Printer size={16} />
            Print Report
          </POSButton>
          <POSButton onClick={() => navigate('/perfume/menu')}>
            <ShoppingCart size={16} />
            Open POS
          </POSButton>
        </div>
      </PageHeader>

      {/* ── EOD PRINT AREA (Hidden on screen, visible on print) ── */}
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
          <h2 className="text-xl font-bold uppercase">{restaurant?.name || user?.firstName + "'s Store"}</h2>
          <p className="text-xs uppercase font-semibold mt-1">End of Day Report</p>
          <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleString()}</p>
        </div>
        <div className="py-4 space-y-3 border-b border-dashed border-gray-400">
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">Weekly Sales</span>
            <span className="font-bold">{formatCurrency(weeklySales)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">Monthly Sales</span>
            <span className="font-bold">{formatCurrency(monthlySales)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-600">All-Time Sales</span>
            <span className="font-bold">{formatCurrency(allTimeSales)}</span>
          </div>
        </div>
        <div className="py-4 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of Report</p>
        </div>
      </div>

      {/* ── Sales Cards: Weekly / Monthly / All-Time ─────────────────── */}
      <SalesCardGrid>
        <SalesCard
          title="Weekly Sales"
          amount={weeklySales}
          backgroundColor="rgba(25, 118, 63, 0.23)"
        />
        <SalesCard
          title="Monthly Sales"
          amount={monthlySales}
          backgroundColor="rgba(113, 22, 235, 0.23)"
        />
        <SalesCard
          title="All Time Sales"
          amount={allTimeSales}
          backgroundColor="rgba(255, 159, 41, 0.23)"
        />
      </SalesCardGrid>

      {/* ── Recent Transactions ───────────────────────────────────────── */}
      <Section>
        <SectionHeader>
          <SectionTitle>Recent Transactions</SectionTitle>
        </SectionHeader>
        <Table>
          <thead>
            <tr>
              <Th>Order Ref</Th>
              <Th>Client</Th>
              <Th>Payment</Th>
              <Th>Time</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentTransactions || []).map((tx: any) => (
              <tr key={tx.id}>
                <Td>
                  <span style={{ fontFamily: 'monospace', color: '#9CA3AF', fontSize: '13px' }}>
                    #{tx.id.substring(0, 8).toUpperCase()}
                  </span>
                </Td>
                <Td style={{ fontWeight: 500 }}>
                  {tx.client
                    ? (tx.client.name || `${tx.client.firstName || ''} ${tx.client.lastName || ''}`.trim() || 'Client')
                    : <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Walk-in</span>}
                </Td>
                <Td>
                  {tx.paymentMethod ? (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#F3F4F6',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#374151',
                      letterSpacing: '0.04em',
                    }}>
                      {tx.paymentMethod}
                    </span>
                  ) : '—'}
                </Td>
                <Td style={{ color: '#6B7280' }}>
                  {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Td>
                <Td style={{ fontWeight: 700, color: '#111827' }}>
                  {formatCurrency(tx.totalAmount)}
                </Td>
                <Td>
                  <StatusPill completed={tx.status === 'COMPLETED'}>
                    {tx.status === 'COMPLETED' ? '● ' : '○ '}
                    {tx.status}
                  </StatusPill>
                </Td>
              </tr>
            ))}
            {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && !isLoading && (
              <tr>
                <td colSpan={6}>
                  <EmptyState>
                    <ShoppingCart size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p style={{ fontWeight: 600, color: '#6B7280' }}>No transactions yet</p>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>Process your first sale from the POS menu</p>
                  </EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Section>
    </PageContainer>
  );
};

export default StoreDashboard;
