import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

export interface RevenueTrend {
  day: string;
  amount: number;
}

interface PremiumChartProps {
  trends?: RevenueTrend[];
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

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
  margin-bottom: 24px;
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

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleFont: { size: 13 },
      bodyFont: { size: 14, weight: 'bold' as const },
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    y: {
      border: { display: false },
      grid: {
        color: 'rgba(0, 0, 0, 0.04)',
        drawTicks: false,
      },
      ticks: {
        color: '#6B7280',
        font: { size: 12 },
        padding: 8,
      },
    },
    x: {
      border: { display: false },
      grid: {
        display: false,
        drawTicks: false,
      },
      ticks: {
        color: '#6B7280',
        font: { size: 12 },
        padding: 8,
      },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
};

// Static data removed

const PremiumChart: React.FC<PremiumChartProps> = ({ trends = [] }) => {
  const labels = trends.map(t => t.day);
  const dataPoints = trends.map(t => t.amount);

  const chartData = {
    labels: labels.length ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Revenue (₦)',
        data: dataPoints.length ? dataPoints : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#05431E',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(5, 67, 30, 0.2)');
          gradient.addColorStop(1, 'rgba(5, 67, 30, 0)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#05431E',
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  return (
    <ChartContainer>
      <Header>
        <TitleText>Revenue Trends</TitleText>
        <SubText>Weekly performance overview</SubText>
      </Header>
      <div style={{ flex: 1, position: 'relative', minHeight: '250px' }}>
        <Line options={options} data={chartData} />
      </div>
    </ChartContainer>
  );
};

export default PremiumChart;
