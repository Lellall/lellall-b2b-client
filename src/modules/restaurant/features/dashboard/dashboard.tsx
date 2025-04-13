import PieChartCard from "@/components/ui/pie-chart-card";
import SalesBreakdownCard from "@/components/ui/sales-breakdown";
import SalesCard from "@/components/ui/sales-card";
import { selectAuth } from '@/redux/api/auth/auth.slice';
import {
    useGetSalesStatsQuery,
    useGetMonthlyRevenueBreakdownQuery,
    useGetMonthlyExpensesQuery,
    useGetMonthlyRevenueByCategoryQuery,
    useGetInventoryStatsQuery,
    useGetStockStatsQuery
} from '@/redux/api/order/order.api';
import { useGetReservationByStatsQuery } from "@/redux/api/reservations/reservations.api";
import { useGetRestaurantBySubdomainQuery, useGetUsersByRestaurantQuery, useGetUsersStatsQuery } from "@/redux/api/restaurant/restaurant.api";
import { useSelector } from "react-redux";
import { ColorRing } from 'react-loader-spinner';

const Dashboard = () => {
    const { subdomain } = useSelector(selectAuth);

    // API Queries
    const {
        data: restaurant,
        isLoading: isRestaurantLoading,
        error: restaurantError,
    } = useGetRestaurantBySubdomainQuery(subdomain, { skip: !subdomain });

    const {
        data: stats,
        isLoading: isStatsLoading,
        error: statsError,
    } = useGetUsersStatsQuery(restaurant?.id, { skip: !restaurant?.id });

    const {
        data: salesStats,
        isLoading: isSalesLoading,
        error: salesError,
    } = useGetSalesStatsQuery(subdomain);

    const {
        data: revenueData,
        isLoading: isRevenueLoading,
        error: revenueError,
    } = useGetMonthlyRevenueBreakdownQuery(subdomain);

    const {
        data: inventoryStats,
        isLoading: isInventoryLoading,
        error: inventoryError,
    } = useGetInventoryStatsQuery(subdomain);

    const {
        data: reservationStats,
        isLoading: isReservationsLoading,
        error: reservationsError,
    } = useGetReservationByStatsQuery(subdomain);

    // Check if any query is still loading
    const isAnyLoading = 
        isRestaurantLoading || 
        isStatsLoading || 
        isSalesLoading || 
        isRevenueLoading || 
        isInventoryLoading || 
        isReservationsLoading;

    // Static data
    const monthlyExpensesData = [
        { label: "Food Items", percentage: 60, color: "#99FF99" },
        { label: "Maintenance", percentage: 15, color: "#FF9999" },
        { label: "Salary", percentage: 20, color: "#FFCC99" },
        { label: "Utilities bills", percentage: 5, color: "#CC99FF" },
    ];

    const roleCounts = stats?.roleCounts || {};

    const staffs = [
        ...Object.entries(roleCounts).map(([role, count]) => {
            let hash = 0;
            for (let i = 0; i < role.length; i++) {
                hash = role.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = hash % 360;
            const color = `hsl(${hue}, 70%, 50%)`;
            return {
                label: role.replace(/([A-Z])/g, " $1").toLowerCase(), // Capitalize first letter of each word
                percentage: count || 0,
                color: color,
                isPercentage: false,
            };
        })
    ].slice(0, 5);

    const reservationBookingData = [
        { label: "Real Time", percentage: reservationStats?.realTime, color: "#99FF99", isPercentage: false },
        { label: "Dine-In", percentage: reservationStats?.dineIn, color: "#FFCC99", isPercentage: false },
        { label: "No Show", percentage: reservationStats?.noShow, color: "#CC99FF", isPercentage: false },
    ];

    const inventoryManagementData = [
        { label: "Current Stock", percentage: inventoryStats?.currentStock?.toFixed(2), color: "#FFCC99" },
        { label: "Unused", percentage: inventoryStats?.unused?.toFixed(2), color: "#FF9999" },
        { label: "Turnover", percentage: inventoryStats?.turnover?.toFixed(2), color: "#99FF99" },
        { label: "Waste", percentage: inventoryStats?.waste?.toFixed(2), color: "#CC99FF" },
    ];

    const salesData = revenueData ?? [];

    // Loader component
    if (isAnyLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <ColorRing
                    height="80"
                    width="80"
                    radius="9"
                    color="#05431E"
                    ariaLabel="three-dots-loading"
                    visible={true}
                />
            </div>
        );
    }

    // Main content
    return (
        <div>
            <div className="flex ">
                <div className="mr-4 w-full">
                    <SalesCard
                        title="Weekly Sales"
                        amount={salesStats?.weeklySales}
                        // date="9 February 2024"
                        backgroundColor="rgba(25, 118, 63, 0.23)"
                    />
                </div>
                <div className="mr-4 w-full">
                    <SalesCard
                        title="Monthly Sales"
                        amount={salesStats?.monthlySales}
                        // date="9 February 2024"
                        backgroundColor="rgba(113, 22, 235, 0.23)"
                    />
                </div>
                <div className="w-full">
                    <SalesCard
                        title="All Time Sales"
                        amount={salesStats?.allTimeSales}
                        // date="9 February 2024"
                        backgroundColor="rgba(255, 159, 41, 0.23)"
                    />
                </div>
            </div>

            <div className="mt-5">
                <SalesBreakdownCard
                    title="Monthly Sales Revenue"
                    subtitle="Breakdown by Monthly Sales"
                    salesData={salesData}
                />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", padding: "5px", marginTop: '20px', background: "#fff" }}>
                <PieChartCard
                    title="# Reservation and Booking"
                    data={reservationBookingData}
                    legendStyle={{ fontSize: "0.75rem", color: "#666666", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                />
                {/* <PieChartCard
                    title="# Total Staffs"
                    data={staffs}
                    legendStyle={{ fontSize: "0.75rem", color: "#666666", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                /> */}
                <PieChartCard
                    title="# Inventory Management"
                    data={inventoryManagementData}
                    legendStyle={{ fontSize: "0.75rem", color: "#666666", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                />
                {/* <PieChartCard
                    title="# Monthly Expenses"
                    data={monthlyExpensesData}
                    legendStyle={{ fontSize: "0.75rem", color: "#666666", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
                /> */}
            </div>
        </div>
    );
};

export default Dashboard;