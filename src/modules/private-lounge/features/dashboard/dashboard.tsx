import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { Crown, Profile2User, CalendarTick, CardCoin } from 'iconsax-react';
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
          value={142} // Mock data
          icon={<Crown size="20" variant="Bold" />}
          backgroundColor="#F8FAFC" // Slight blue-gray for elegance
          trend={{ value: 12, isPositive: true }}
        />
        <PremiumMetricCard
          title="Pending Applications"
          value={3} // Mock data
          icon={<Profile2User size="20" variant="Bold" />}
          backgroundColor="#FEFCE8" // Soft gold/yellow
          trend={{ value: 5, isPositive: false }}
        />
        <PremiumMetricCard
          title="Today's Reservations"
          value={15} // Mock data
          icon={<CalendarTick size="20" variant="Bold" />}
          backgroundColor="#F0FDF4" // Soft green
          trend={{ value: 8, isPositive: true }}
        />
        <PremiumMetricCard
          title="Monthly Revenue"
          value={1250000} // Mock data
          isCurrency={true}
          icon={<CardCoin size="20" variant="Bold" />}
          backgroundColor="#F9FAFB" // Clean white/gray
          trend={{ value: 18, isPositive: true }}
        />
      </MetricGrid>

      {/* MIDDLE ROW: Charts & Actions */}
      <MiddleSection>
        <PremiumChart />
        <QuickActions />
      </MiddleSection>

      {/* BOTTOM ROW: Recent Activity */}
      <ActivityTable />

    </DashboardContainer>
  );
};

export default LoungeDashboard;
