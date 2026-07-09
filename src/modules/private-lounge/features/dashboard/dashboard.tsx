import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { Crown, Profile2User, CalendarTick, CardCoin } from 'iconsax-react';
import { useGetDashboardStatsQuery } from '@/redux/api/private-lounge/dashboard.api';
import PremiumMetricCard from '../../components/PremiumMetricCard';
import PremiumChart from '../../components/PremiumChart';
import QuickActions from '../../components/QuickActions';
import ActivityTable from '../../components/ActivityTable';

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
  const { user } = useSelector(selectAuth);
  
  const { data: statsData, isLoading } = useGetDashboardStatsQuery(
    user?.privateLoungeId || '',
    { skip: !user?.privateLoungeId }
  );

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <DashboardContainer>
      <GreetingContainer>
        <GreetingText>Welcome back, {user?.firstName}!</GreetingText>
        <DateText>{today}</DateText>
      </GreetingContainer>

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
      <ActivityTable activities={statsData?.recentActivity || []} />

    </DashboardContainer>
  );
};

export default LoungeDashboard;
