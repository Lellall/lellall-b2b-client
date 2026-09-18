import React from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BRAND_GREEN, brandGradient } from './chartPalette';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ChartTitle, Tooltip, Filler, Legend);

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

interface LineTrendChartProps {
  title: string;
  subtitle?: string;
  labels: string[];
  values: number[];
  valueLabel?: string;
  formatValue?: (n: number) => string;
}

const LineTrendChart: React.FC<LineTrendChartProps> = ({
  title,
  subtitle,
  labels,
  values,
  valueLabel = 'Revenue',
  formatValue,
}) => {
  const chartData = {
    labels: labels.length ? labels : ['—'],
    datasets: [
      {
        fill: true,
        label: valueLabel,
        data: values.length ? values : [0],
        borderColor: BRAND_GREEN,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          return brandGradient(ctx, 300);
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: BRAND_GREEN,
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: { size: 13 },
        bodyFont: { size: 14, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: formatValue
          ? { label: (ctx: any) => formatValue(ctx.parsed.y) }
          : undefined,
      },
    },
    scales: {
      y: {
        border: { display: false },
        grid: { color: 'rgba(0, 0, 0, 0.04)', drawTicks: false },
        ticks: { color: '#6B7280', font: { size: 12 }, padding: 8 },
      },
      x: {
        border: { display: false },
        grid: { display: false, drawTicks: false },
        ticks: { color: '#6B7280', font: { size: 12 }, padding: 8 },
      },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
  };

  return (
    <ChartContainer>
      <Header>
        <TitleText>{title}</TitleText>
        {subtitle && <SubText>{subtitle}</SubText>}
      </Header>
      <div style={{ flex: 1, position: 'relative', minHeight: '250px' }}>
        <Line options={options} data={chartData} />
      </div>
    </ChartContainer>
  );
};

export default LineTrendChart;
