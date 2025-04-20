// src/components/ui/sales-breakdown.tsx
import React from 'react';
import styled from 'styled-components';

interface SalesBreakdownCardProps {
  title: string;
  subtitle: string;
  salesData: { month: string; revenue: number }[];
}

const CardContainer = styled.div`
  background: #FFFFFF;
  border-radius: 5px;
  padding: 16px;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #666666;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  color: #999999;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const BarChartContainer = styled.div`
  width: 100%;
  height: 20px;
  background: #F5F5F5;
  border-radius: 10px;
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    height: 16px;
  }
`;

const Bar = styled.div<{ width: string; color: string; left: string }>`
  height: 100%;
  background: ${(props) => props.color};
  width: ${(props) => props.width};
  position: absolute;
  left: ${(props) => props.left};
  top: 0;
  transition: width 0.3s ease;
`;

const Legend = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #666666;

  &:before {
    content: '';
    width: 10px;
    height: 10px;
    background: ${(props) => props.color};
    margin-right: 4px;
    border-radius: 50%;
  }

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const SalesBreakdownCard: React.FC<SalesBreakdownCardProps> = ({ title, subtitle, salesData }) => {
  const totalRevenue = salesData?.reduce((sum, item) => sum + item.revenue, 0) || 1;

  const colorPalette = ['#FF9999', '#99CCFF', '#FFCC99', '#CC99FF', '#99FF99', '#CCCCCC'];
  const breakdownData = salesData.map((item, index) => ({
    month: item.month,
    percentage: (item.revenue / totalRevenue) * 100,
    color: colorPalette[index % colorPalette.length],
  }));

  let leftOffset = 0;
  const bars = breakdownData.map((item, index) => {
    const width = `${(item.percentage / 100) * 100}%`;
    const barStyle = {
      left: `${leftOffset}%`,
      width,
      color: item.color,
    };
    leftOffset += (item.percentage / 100) * 100;
    return <Bar key={index} {...barStyle} color={item.color} width={width} left={barStyle.left} />;
  });

  return (
    <CardContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      <BarChartContainer>{bars}</BarChartContainer>
      <Legend>
        {breakdownData.map((item, index) => (
          <LegendItem key={index} color={item.color}>
            {item.month} ({item.percentage.toFixed(1)}%)
          </LegendItem>
        ))}
      </Legend>
    </CardContainer>
  );
};

export default SalesBreakdownCard;
