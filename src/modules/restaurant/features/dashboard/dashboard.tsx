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
import { useGetLowStockInventoryQuery } from '@/redux/api/inventory/inventory.api';
import { useSelector } from 'react-redux';
import { ColorRing } from 'react-loader-spinner';
import useWindowSize from '@/hooks/use-window-size';
import DailySalesDashboard from './daily-sales';
import LowInventoryWarning from '../layout/low-inventory';
import { useNavigate } from 'react-router-dom';
import { Home2, Menu, Setting2, ArchiveBox } from 'iconsax-react';

const DashboardContainer = styled.div`
  padding: 16px;
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

const GreetingContainer = styled.div`
  margin-bottom: 20px;
`;

const GreetingText = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
`;

const DateText = styled.p`
  font-size: 1rem;
  color: #666;
  margin-top: 8px;
`;

const QuickLinksContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 24px;
`;

const QuickLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  padding: 16px;
  border-radius: 12px;
  text-decoration: none;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  & svg {
    margin-bottom: 8px;
  }
`;

// Define colors for each quick link
const quickLinkColors = [
  { bg: '#19763f', hover: '#145c30' }, // Dashboard (Green)
  { bg: '#7116eb', hover: '#5a11b8' }, // Menu (Purple)
  { bg: '#ff9f29', hover: '#cc7f20' }, // Settings (Orange)
  { bg: '#cc99ff', hover: '#a67cd9' }, // Inventory (Light Purple)
];

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
  const { subdomain, user } = useSelector(selectAuth);
  const { width } = useWindowSize();
  const navigate = useNavigate();

  const { data: salesStats, isLoading: isSalesLoading } = useGetSalesStatsQuery(subdomain);
  const { data: revenueData, isLoading: isRevenueLoading } = useGetMonthlyRevenueBreakdownQuery(subdomain);
  const { data: inventoryStats, isLoading: isInventoryLoading } = useGetInventoryStatsQuery(subdomain);
  const { data: reservationStats, isLoading: isReservationsLoading } = useGetReservationByStatsQuery(subdomain);
  const { data: lowStockData, isLoading: isLowStockLoading } = useGetLowStockInventoryQuery({
    subdomain,
    page: 1,
    limit: 10,
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

  // Quick Links for Waiter with react-iconsax
  const quickLinks = [
    { to: '/', icon: Home2, text: 'Dashboard', end: true },
    { to: '/menu', icon: Menu, text: 'Menu' },
    { to: '/settings', icon: Setting2, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
  ];

  // Format today's date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        {user?.role === 'WAITER' && (
          <GreetingContainer>
            <GreetingText>Hi, {user.firstName}</GreetingText>
            <DateText>{today}</DateText>
            <QuickLinksContainer>
              {quickLinks.map((link, index) => (
                <QuickLink
                  key={link.to}
                  href={link.to}
                  onClick={() => navigate(link.to)}
                  style={{
                    background: quickLinkColors[index].bg,
                    '&:hover': { background: quickLinkColors[index].hover },
                  }}
                >
                  <link.icon size={32} />
                  {link.text}
                </QuickLink>
              ))}
            </QuickLinksContainer>
          </GreetingContainer>
        )}
        <MobileViewContainer>
          {user?.role !== 'WAITER' && (
            <>
              {hasLowStockItems && <LowInventoryWarning />}
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
            </>
          )}
          <DailySalesDashboard subdomain={subdomain} />
        </MobileViewContainer>
      </DashboardContainer>
    );
  }

  // Default Desktop/Tablet View
  return (
    <DashboardContainer>
      {user?.role === 'WAITER' && (
        <GreetingContainer>
          <GreetingText>Hi, {user.firstName}</GreetingText>
          <DateText>{today}</DateText>
          <QuickLinksContainer>
            {quickLinks.map((link, index) => (
              <QuickLink
                key={link.to}
                href={link.to}
                onClick={() => navigate(link.to)}
                style={{
                  background: quickLinkColors[index].bg,
                  '&:hover': { background: quickLinkColors[index].hover },
                }}
              >
                <link.icon size={32} />
                {link.text}
              </QuickLink>
            ))}
          </QuickLinksContainer>
        </GreetingContainer>
      )}
      {user?.role !== 'WAITER' && (
        <>
          {hasLowStockItems && <LowInventoryWarning navigation={navigate} />}
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
        </>
      )}
      <DailySalesDashboard subdomain={subdomain} />
    </DashboardContainer>
  );
};

export default Dashboard;