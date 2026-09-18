import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { format, startOfMonth } from 'date-fns';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { MoneyChange, Crown, ArchiveBox, CardCoin } from 'iconsax-react';
import {
  useGetRevenueSummaryQuery,
  useGetDashboardStatsQuery,
  useGetMenuSalesReportQuery,
} from '@/redux/api/private-lounge/dashboard.api';
import { useCurrency } from '@/contexts/CurrencyContext';
import PremiumMetricCard from '../../components/PremiumMetricCard';
import LineTrendChart from '@/components/charts/LineTrendChart';
import TopItemsBarChart from '@/components/charts/TopItemsBarChart';
import CategoryDonutChart from '@/components/charts/CategoryDonutChart';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const PageSubtitle = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 0;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const PanelTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const PanelSubtext = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 4px 0 0 0;
`;

const DateRangeBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DateInput = styled.input`
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  color: #374151;
  background: white;
`;

const TierPillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TierPill = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #F3F4F6;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #9CA3AF;
  padding: 8px 12px;
  border-bottom: 1px solid #F3F4F6;

  &:last-child {
    text-align: right;
  }
`;

const Td = styled.td`
  padding: 12px;
  font-size: 13px;
  color: #374151;
  border-bottom: 1px solid #F9FAFB;

  &:last-child {
    text-align: right;
    font-weight: 600;
    color: #111827;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #9CA3AF;
  font-size: 13px;
`;

const SplitRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 16px;
`;

const AnalyticsPage: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const { formatCurrency } = useCurrency();
  const loungeId = user?.privateLoungeId || '';

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(todayStr);

  const { data: revenue } = useGetRevenueSummaryQuery(loungeId, { skip: !loungeId });
  const { data: statsData } = useGetDashboardStatsQuery(loungeId, { skip: !loungeId });
  const { data: menuSales } = useGetMenuSalesReportQuery(
    { loungeId, startDate, endDate },
    { skip: !loungeId }
  );

  const summary = revenue?.summary;
  const membersByTier = revenue?.membersByTier || {};
  const menuItems = menuSales?.items || [];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Analytics</PageTitle>
        <PageSubtitle>Revenue breakdown, membership mix, and menu performance</PageSubtitle>
      </PageHeader>

      <CardGrid>
        <PremiumMetricCard
          title="Total Revenue (all-time)"
          value={summary?.totalRevenue ?? 0}
          isCurrency
          icon={<MoneyChange size={20} />}
          backgroundColor="#F8FAFC"
        />
        <PremiumMetricCard
          title="Membership Revenue"
          value={summary?.totalMembershipRevenue ?? 0}
          isCurrency
          icon={<Crown size={20} />}
          backgroundColor="#FEFCE8"
        />
        <PremiumMetricCard
          title="Walk-in Revenue"
          value={summary?.totalWalkInRevenue ?? 0}
          isCurrency
          icon={<ArchiveBox size={20} />}
          backgroundColor="#F0FDF4"
        />
        <PremiumMetricCard
          title="Platform Fees Paid"
          value={summary?.platformFeesPaid ?? 0}
          isCurrency
          icon={<CardCoin size={20} />}
          backgroundColor="#F9FAFB"
        />
      </CardGrid>

      <ContentGrid>
        <LineTrendChart
          title="Revenue Trends"
          subtitle="Weekly performance overview"
          labels={(statsData?.revenueTrends || []).map((t: any) => t.day)}
          values={(statsData?.revenueTrends || []).map((t: any) => t.amount)}
          formatValue={formatCurrency}
        />
        <CategoryDonutChart
          title="Revenue Split"
          subtitle="All-time, by source"
          segments={[
            { label: 'Membership', value: summary?.totalMembershipRevenue ?? 0 },
            { label: 'Walk-in', value: summary?.totalWalkInRevenue ?? 0 },
          ]}
          centerCaption="Total"
          formatValue={formatCurrency}
        />
      </ContentGrid>

      <ContentGrid>
        <TopItemsBarChart
          title="Top Menu Items"
          subtitle="By revenue, over the selected period below"
          labels={menuItems.slice(0, 8).map((i: any) => i.name)}
          values={menuItems.slice(0, 8).map((i: any) => i.revenue)}
          formatValue={formatCurrency}
        />
        <Panel>
          <PanelHeader>
            <div>
              <PanelTitle>Members by Tier</PanelTitle>
              <PanelSubtext>Active memberships right now</PanelSubtext>
            </div>
          </PanelHeader>
          {Object.keys(membersByTier).length === 0 ? (
            <EmptyState>No active members yet</EmptyState>
          ) : (
            <TierPillRow>
              {Object.entries(membersByTier).map(([tier, info]: [string, any]) => (
                <TierPill key={tier}>
                  {tier} · {info.count}
                </TierPill>
              ))}
            </TierPillRow>
          )}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <SplitRow>
              <span>Pending applications</span>
              <strong style={{ color: '#111827' }}>{summary?.pendingApplications ?? 0}</strong>
            </SplitRow>
            <SplitRow>
              <span>Walk-ins today</span>
              <strong style={{ color: '#111827' }}>{summary?.walkInsToday ?? 0}</strong>
            </SplitRow>
            <SplitRow>
              <span>Total walk-ins (all-time)</span>
              <strong style={{ color: '#111827' }}>{summary?.totalWalkIns ?? 0}</strong>
            </SplitRow>
          </div>
        </Panel>
      </ContentGrid>

      <Panel>
        <PanelHeader>
          <div>
            <PanelTitle>Menu Sales</PanelTitle>
            <PanelSubtext>What sold, by item, over the selected period</PanelSubtext>
          </div>
          <DateRangeBar>
            <DateInput
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span style={{ color: '#9CA3AF', fontSize: 12 }}>to</span>
            <DateInput
              type="date"
              value={endDate}
              max={todayStr}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </DateRangeBar>
        </PanelHeader>

        {menuItems.length > 0 && (
          <SplitRow>
            <span>Walk-in orders: {menuSales?.walkInOrders ?? 0} ({formatCurrency(menuSales?.walkInRevenue ?? 0)})</span>
            <span>Member orders: {menuSales?.memberOrders ?? 0} ({formatCurrency(menuSales?.memberRevenue ?? 0)})</span>
          </SplitRow>
        )}

        {menuItems.length === 0 ? (
          <EmptyState>No menu sales in this date range</EmptyState>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Category</Th>
                  <Th>Qty Sold</Th>
                  <Th>Revenue</Th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item: any) => (
                  <tr key={item.itemId}>
                    <Td>{item.name}</Td>
                    <Td>{item.category}</Td>
                    <Td>{item.quantity}</Td>
                    <Td>{formatCurrency(item.revenue)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Panel>
    </PageContainer>
  );
};

export default AnalyticsPage;
