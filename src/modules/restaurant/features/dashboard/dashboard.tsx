import styled from 'styled-components';
import PieChartCard from '@/components/ui/pie-chart-card';
import SalesBreakdownCard from '@/components/ui/sales-breakdown';
import SalesCard from '@/components/ui/sales-card';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import {
  useGetSalesStatsQuery,
  useGetMonthlyRevenueBreakdownQuery,
  useGetInventoryStatsQuery,
} from '@/redux/api/order/order.api';
import { useGetReservationByStatsQuery } from '@/redux/api/reservations/reservations.api';
import { useGetLowStockInventoryQuery } from '@/redux/api/inventory/inventory.api'; // Import the new hook
import { useSelector } from 'react-redux';
import { ColorRing } from 'react-loader-spinner';
import useWindowSize from '@/hooks/use-window-size';
import DailySalesDashboard from './daily-sales';
import LowInventoryWarning from '../layout/low-inventory';
import { useNavigate } from 'react-router-dom';

const DashboardContainer = styled.div`
  padding: 16px;
  // background: #f5f5f5;
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

const PieChartContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MobileViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TableWrapper = styled.div`
  margin: 20px 0;
`;

const salesTableColumns = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'date', label: 'Date' },
  { key: 'amount', label: 'Amount' },
  {
    key: 'actions',
    label: 'Actions',
    render: (_: any, row: any) => (
      <button className="text-blue-600 hover:underline" onClick={() => alert(`View details for ${row.orderId}`)}>
        View
      </button>
    ),
  },
];


const Dashboard = () => {
  const { subdomain } = useSelector(selectAuth);
  const { width } = useWindowSize();
  const navigation = useNavigate()
  const { data: salesStats, isLoading: isSalesLoading } = useGetSalesStatsQuery(subdomain);
  const { data: revenueData, isLoading: isRevenueLoading } = useGetMonthlyRevenueBreakdownQuery(subdomain);
  const { data: inventoryStats, isLoading: isInventoryLoading } = useGetInventoryStatsQuery(subdomain);
  const { data: reservationStats, isLoading: isReservationsLoading } = useGetReservationByStatsQuery(subdomain);
  // Fetch low stock inventory
  const { data: lowStockData, isLoading: isLowStockLoading } = useGetLowStockInventoryQuery({
    subdomain,
    page: 1,
    limit: 10, // Fetch a reasonable number of items to check if there are any low stock items
  });

  const monthlyExpensesData = [
    { label: 'Food Items', percentage: 60, color: '#99FF99' },
    { label: 'Maintenance', percentage: 15, color: '#FF9999' },
    { label: 'Salary', percentage: 20, color: '#FFCC99' },
    { label: 'Utilities bills', percentage: 5, color: '#CC99FF' },
  ];

  const reservationBookingData = [
    { label: 'Real Time', percentage: reservationStats?.realTime || 0, color: '#99FF99', isPercentage: false },
    { label: 'Dine-In', percentage: reservationStats?.dineIn || 0, color: '#FFCC99', isPercentage: false },
    { label: 'No Show', percentage: reservationStats?.noShow || 0, color: '#CC99FF', isPercentage: false },
  ];

  const inventoryManagementData = [
    { label: 'Current Stock', percentage: inventoryStats?.currentStock?.toFixed(2) || 0, color: '#FFCC99' },
    { label: 'Unused', percentage: inventoryStats?.unused?.toFixed(2) || 0, color: '#FF9999' },
    { label: 'Turnover', percentage: inventoryStats?.turnover?.toFixed(2) || 0, color: '#99FF99' },
    { label: 'Waste', percentage: inventoryStats?.waste?.toFixed(2) || 0, color: '#CC99FF' },
  ];

  const salesData = revenueData ?? [];

  const isAnyLoading = isSalesLoading || isRevenueLoading || isInventoryLoading || isReservationsLoading || isLowStockLoading;

  if (isAnyLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <ColorRing height="80" width="80" radius="9" color="#05431E" ariaLabel="three-dots-loading" visible={true} />
      </div>
    );
  }

  // Check if there are any low stock items
  const hasLowStockItems = lowStockData?.data?.length > 0;

  // Mobile View (for screens < 640px)
  if (width < 640) {
    return (
      <DashboardContainer>
        <MobileViewContainer>
          {/* Conditionally render LowInventoryWarning */}
          {hasLowStockItems && <LowInventoryWarning />}
          {/* Sales Cards */}
          <SalesCard
            title="Weekly Sales"
            amount={salesStats?.weeklySales}
            backgroundColor="rgba(25, 118, 63, 0.23)"
          />
          <SalesCard
            title="Monthly Sales"
            amount={salesStats?.monthlySales}
            backgroundColor="rgba(113, 22, 235, 0.23)"
          />
          <SalesCard
            title="All Time Sales"
            amount={salesStats?.allTimeSales}
            backgroundColor="rgba(255, 159, 41, 0.23)"
          />
          {/* Sales Breakdown */}
          <SalesBreakdownCard
            title="Monthly Sales Revenue"
            subtitle="Breakdown by Monthly Sales"
            salesData={salesData}
          />
          <PieChartContainer>
            <PieChartCard
              title="# Reservation and Booking"
              data={reservationBookingData}
              legendStyle={{
                fontSize: '0.7rem',
                color: '#666666',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
            <PieChartCard
              title="# Inventory Management"
              data={inventoryManagementData}
              legendStyle={{
                fontSize: '0.7rem',
                color: '#666666',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            />
          </PieChartContainer>
          {/* Daily Sales Dashboard */}
          <DailySalesDashboard subdomain={subdomain} />
        </MobileViewContainer>
      </DashboardContainer>
    );
  }

  // Default Desktop/Tablet View
  return (
    <DashboardContainer>
      {/* Conditionally render LowInventoryWarning */}
      {hasLowStockItems && <LowInventoryWarning navigation={navigation} />}
      <SalesCardGrid>
        <SalesCard
          title="Weekly Sales"
          amount={salesStats?.weeklySales}
          backgroundColor="rgba(25, 118, 63, 0.23)"
        />
        <SalesCard
          title="Monthly Sales"
          amount={salesStats?.monthlySales}
          backgroundColor="rgba(113, 22, 235, 0.23)"
        />
        <SalesCard
          title="All Time Sales"
          amount={salesStats?.allTimeSales}
          backgroundColor="rgba(255, 159, 41, 0.23)"
        />
      </SalesCardGrid>
      <SalesBreakdownCard
        title="Monthly Sales Revenue"
        subtitle="Breakdown by Monthly Sales"
        salesData={salesData}
      />

      <PieChartContainer>
        <PieChartCard
          title="# Reservation and Booking"
          data={reservationBookingData}
          legendStyle={{
            fontSize: '0.75rem',
            color: '#666666',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        />
        <PieChartCard
          title="# Inventory Management"
          data={inventoryManagementData}
          legendStyle={{
            fontSize: '0.75rem',
            color: '#666666',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        />
      </PieChartContainer>
      <DailySalesDashboard subdomain={subdomain} />
    </DashboardContainer>
  );
};

export default Dashboard;