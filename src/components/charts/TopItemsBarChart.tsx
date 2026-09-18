import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BRAND_GREEN, BRAND_GOLD } from './chartPalette';

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip);

const ChartContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
  min-height: 350px;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const TitleText = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SubText = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 4px 0 0 0;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 13px;
`;

interface TopItemsBarChartProps {
  title: string;
  subtitle?: string;
  labels: string[];
  values: number[];
  formatValue?: (n: number) => string;
}

const TopItemsBarChart: React.FC<TopItemsBarChartProps> = ({ title, subtitle, labels, values, formatValue }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: values,
        backgroundColor: BRAND_GREEN,
        hoverBackgroundColor: BRAND_GOLD,
        borderRadius: 6,
        maxBarThickness: 28,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 13, weight: 'bold' as const },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: formatValue ? { label: (ctx: any) => formatValue(ctx.parsed.x) } : undefined,
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(0, 0, 0, 0.04)', drawTicks: false },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: '#374151', font: { size: 12, weight: 600 as any } },
      },
    },
  };

  return (
    <ChartContainer>
      <Header>
        <TitleText>{title}</TitleText>
        {subtitle && <SubText>{subtitle}</SubText>}
      </Header>
      {labels.length === 0 ? (
        <EmptyState>No data for this period</EmptyState>
      ) : (
        <div style={{ flex: 1, position: 'relative', minHeight: '250px' }}>
          <Bar options={options} data={chartData} />
        </div>
      )}
    </ChartContainer>
  );
};

export default TopItemsBarChart;
