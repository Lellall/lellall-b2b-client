import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { format, subDays } from 'date-fns';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { MoneyChange, ReceiptText, Bag2, Chart2 } from 'iconsax-react';
import { useGetPerfumeAnalyticsQuery } from '@/redux/api/perfume-store/orders.api';
import { useCurrency } from '@/contexts/CurrencyContext';
import PremiumMetricCard from '../../../private-lounge/components/PremiumMetricCard';
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
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
`;

const HeaderText = styled.div`
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

const ChartGrid = styled.div`
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
  margin-bottom: 16px;
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

const LowStockRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F3F4F6;
  font-size: 13px;

  &:last-child {
    border-bottom: none;
  }
`;

const StockBadge = styled.span<{ critical: boolean }>`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: ${(p) => (p.critical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(217, 119, 6, 0.1)')};
  color: ${(p) => (p.critical ? '#DC2626' : '#B45309')};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 32px 0;
  color: #9CA3AF;
  font-size: 13px;
`;

const PerfumeAnalyticsPage: React.FC = () => {
  const { user, restaurant } = useSelector(selectAuth);
  const { formatCurrency } = useCurrency();
  const storeId = user?.perfumeStoreId || restaurant?.id || '';

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(todayStr);

  const { data: analytics } = useGetPerfumeAnalyticsQuery(
    { storeId, startDate, endDate },
    { skip: !storeId }
  );

  const dailyTrend = analytics?.dailyTrend || [];
  const topItems = analytics?.topItems || [];
  const categorySegments = (analytics?.revenueByCategory || []).map((c: any) => ({
    label: c.category,
    value: c.revenue,
  }));
  const lowStockItems = analytics?.lowStockItems || [];

  return (
    <PageContainer>
      <PageHeader>
        <HeaderText>
          <PageTitle>Analytics</PageTitle>
          <PageSubtitle>Sales performance, top fragrances, and stock signals</PageSubtitle>
        </HeaderText>
        <DateRangeBar>
          <DateInput type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} />
          <span style={{ color: '#9CA3AF', fontSize: 12 }}>to</span>
          <DateInput type="date" value={endDate} max={todayStr} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
        </DateRangeBar>
      </PageHeader>

      <CardGrid>
        <PremiumMetricCard
          title="Revenue (period)"
          value={analytics?.totalRevenue ?? 0}
          isCurrency
          icon={<MoneyChange size={20} />}
          backgroundColor="#F8FAFC"
        />
        <PremiumMetricCard
          title="Orders"
          value={analytics?.totalOrders ?? 0}
          icon={<Bag2 size={20} />}
          backgroundColor="#FEFCE8"
        />
        <PremiumMetricCard
          title="VAT Collected"
          value={analytics?.totalVatCollected ?? 0}
          isCurrency
          icon={<ReceiptText size={20} />}
          backgroundColor="#F0FDF4"
        />
        <PremiumMetricCard
          title="Avg. Order Value"
          value={analytics?.avgOrderValue ?? 0}
          isCurrency
          icon={<Chart2 size={20} />}
          backgroundColor="#F9FAFB"
        />
      </CardGrid>

      <LineTrendChart
        title="Revenue Trend"
        subtitle={`${format(new Date(startDate), 'd MMM')} – ${format(new Date(endDate), 'd MMM yyyy')}`}
        labels={dailyTrend.map((d: any) => format(new Date(d.date), 'd MMM'))}
        values={dailyTrend.map((d: any) => d.revenue)}
        formatValue={formatCurrency}
      />

      <ChartGrid>
        <TopItemsBarChart
          title="Top Fragrances"
          subtitle="By revenue, this period"
          labels={topItems.map((i: any) => i.name)}
          values={topItems.map((i: any) => i.revenue)}
          formatValue={formatCurrency}
        />
        <CategoryDonutChart
          title="Revenue by Category"
          subtitle="Where sales are coming from"
          segments={categorySegments}
          centerCaption="Total"
          formatValue={formatCurrency}
        />
      </ChartGrid>

      <Panel>
        <PanelHeader>
          <PanelTitle>Low Stock</PanelTitle>
          <PanelSubtext>Fragrances at 5 units or fewer, right now</PanelSubtext>
        </PanelHeader>
        {lowStockItems.length === 0 ? (
          <EmptyState>Nothing running low</EmptyState>
        ) : (
          <div>
            {lowStockItems.map((item: any) => (
              <LowStockRow key={item.id}>
                <span style={{ color: '#374151', fontWeight: 500 }}>
                  {item.name} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>· {item.brand}</span>
                </span>
                <StockBadge critical={item.currentStock <= 2}>{item.currentStock} left</StockBadge>
              </LowStockRow>
            ))}
          </div>
        )}
      </Panel>
    </PageContainer>
  );
};

export default PerfumeAnalyticsPage;
