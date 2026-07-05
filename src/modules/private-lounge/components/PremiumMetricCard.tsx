import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { useCurrency } from '@/contexts/CurrencyContext';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  isCurrency?: boolean;
  backgroundColor: string;
  textColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const CardContainer = styled.div<{ bg: string }>`
  background: ${(props) => props.bg};
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  backdrop-filter: blur(8px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const Title = styled.h3<{ color: string }>`
  font-size: 15px;
  font-weight: 500;
  color: ${(props) => props.color};
  margin: 0;
  line-height: 1.4;
`;

const IconWrapper = styled.div<{ color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color};
  backdrop-filter: blur(4px);
`;

const Value = styled.div<{ color: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.color};
  margin-bottom: 8px;
  letter-spacing: -0.5px;
`;

const TrendBadge = styled.div<{ isPositive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props) => (props.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)')};
  color: ${(props) => (props.isPositive ? '#10B981' : '#EF4444')};
`;

const PremiumMetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  isCurrency = false,
  backgroundColor,
  textColor = '#111827',
  trend
}) => {
  const { formatCurrency } = useCurrency();
  
  const displayValue = typeof value === 'number' && isCurrency
    ? formatCurrency(value)
    : typeof value === 'number'
    ? value.toLocaleString()
    : value;

  return (
    <CardContainer bg={backgroundColor}>
      <Header>
        <Title color={textColor}>{title}</Title>
        <IconWrapper color={textColor}>
          {icon}
        </IconWrapper>
      </Header>
      <div>
        <Value color={textColor}>{displayValue}</Value>
        {trend && (
          <TrendBadge isPositive={trend.isPositive}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
            <span style={{ color: '#6B7280', fontWeight: 400, marginLeft: '4px' }}>vs last month</span>
          </TrendBadge>
        )}
      </div>
    </CardContainer>
  );
};

export default PremiumMetricCard;
