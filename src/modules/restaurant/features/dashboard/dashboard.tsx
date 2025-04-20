// src/pages/Dashboard.tsx
import React from 'react';
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
import { useGetReservationByStatsQuery } from "@/redux/api/reservations/reservations.api";
import { useSelector } from 'react-redux';
import { ColorRing } from 'react-loader-spinner';
import useWindowSize from '@/hooks/use-window-size';

const DashboardContainer = styled.div`
  padding: 16px;
  background: #f5f5f5;
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

// Example table data
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

const salesTableData = [
  { orderId: 'ORD001', date: '2025-04-18', amount: 150.75 },
  { orderId: 'ORD002', date: '2025-04-17', amount: 89.50 },
  { orderId: 'ORD003', date: '2025-04-16', amount: 200.00 },
];

const Dashboard = () => {
  const { subdomain } = useSelector(selectAuth);
  const { width } = useWindowSize();

  // API Queries
  const { data: salesStats, isLoading: isSalesLoading } = useGetSalesStatsQuery(subdomain);
  const { data: revenueData, isLoading: isRevenueLoading } = useGetMonthlyRevenueBreakdownQuery(subdomain);
  const { data: inventoryStats, isLoading: isInventoryLoading } = useGetInventoryStatsQuery(subdomain);
  const { data: reservationStats, isLoading: isReservationsLoading } = useGetReservationByStatsQuery(subdomain);

  // Static data
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

  // Loader
  const isAnyLoading = isSalesLoading || isRevenueLoading || isInventoryLoading || isReservationsLoading;

  if (isAnyLoading) {
    return (
      <div className="min-hmakerspace-screen bg-gray-100 flex items-center justify-center">
        <ColorRing height="80" width="80" radius="9" color="#05431E" ariaLabel="three-dots-loading" visible={true} />
      </div>
    );
  }

  // Mobile View (for screens < 640px)
  if (width < 640) {
    return (
      <DashboardContainer>
        <MobileViewContainer>
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
            {/* <PieChartCard
              title="# Monthly Expenses"
              data={monthlyExpensesData}
              legendStyle={{
                fontSize: '0.7rem',
                color: '#666666',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            /> */}
          </PieChartContainer>
        </MobileViewContainer>
      </DashboardContainer>
    );
  }

  // Default Desktop/Tablet View
  return (
    <DashboardContainer>
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
        {/* <PieChartCard
          title="# Monthly Expenses"
          data={monthlyExpensesData}
          legendStyle={{
            fontSize: '0.75rem',
            color: '#666666',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        /> */}
      </PieChartContainer>
    </DashboardContainer>
  );
};

export default Dashboard;