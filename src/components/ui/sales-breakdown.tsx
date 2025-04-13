import React from "react";
import styled from "styled-components";
import { theme } from "@/theme/theme"; // Adjust import based on your theme setup

interface SalesBreakdownCardProps {
  title: string;
  subtitle: string;
  salesData: { month: string; revenue: number }[]; // Array from backend
}

const CardContainer = styled.div`
  background: #FFFFFF;
  border-radius: 5px;
  padding: 16px;
  width: 100%;
//   max-width: 600px; // Matches the image width approximately
//   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; // Clean font style
`;

const Title = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #666666; // Gray title
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  color: #999999; // Lighter gray subtitle
  margin-bottom: 12px;
`;

const BarChartContainer = styled.div`
  width: 100%;
  height: 20px;
  background: #F5F5F5; // Light gray background for the bar container
  border-radius: 10px;
  overflow: hidden;
  position: relative;
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
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #666666;

  &:before {
    content: "";
    width: 10px;
    height: 10px;
    background: ${(props) => props.color};
    margin-right: 4px;
    border-radius: 50%;
  }
`;

const SalesBreakdownCard: React.FC<SalesBreakdownCardProps> = ({
  title,
  subtitle,
  salesData,
}) => {
  // Calculate total revenue
  const totalRevenue = salesData?.reduce((sum, item) => sum + item.revenue, 0);

  // Assign colors to months (cycling through a predefined palette)
  const colorPalette = [
    "#FF9999", // Pink
    "#99CCFF", // Blue
    "#FFCC99", // Yellow
    "#CC99FF", // Purple
    "#99FF99", // Green
    "#CCCCCC", // Gray
  ];
  const breakdownData = salesData.map((item, index) => ({
    month: item.month,
    percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
    color: colorPalette[index % colorPalette.length],
  }));

  // Accumulate widths and positions for bars
  let leftOffset = 0;
  const bars = breakdownData.map((item, index) => {
    const width = `${(item.percentage / 100) * 100}%`; // Convert percentage to width
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
      <BarChartContainer>
        {bars}
      </BarChartContainer>
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