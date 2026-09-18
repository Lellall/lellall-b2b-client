import React from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CHART_PALETTE } from './chartPalette';

ChartJS.register(ArcElement, Tooltip);

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

const Body = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 0;
`;

const DonutWrap = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  flex-shrink: 0;
`;

const CenterLabel = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  pointer-events: none;
`;

const CenterValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
`;

const CenterCaption = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
`;

const Swatch = styled.span<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: ${(p) => p.color};
  flex-shrink: 0;
`;

const LegendLabel = styled.span`
  color: #374151;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LegendValue = styled.span`
  color: #111827;
  font-weight: 600;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  font-size: 13px;
`;

interface CategoryDonutChartProps {
  title: string;
  subtitle?: string;
  segments: { label: string; value: number }[];
  centerCaption?: string;
  formatValue?: (n: number) => string;
}

const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  title,
  subtitle,
  segments,
  centerCaption = 'Total',
  formatValue = (n) => n.toLocaleString(),
}) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  const chartData = {
    labels: segments.map((s) => s.label),
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: CHART_PALETTE,
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        bodyFont: { size: 13, weight: 'bold' as const },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: { label: (ctx: any) => formatValue(ctx.parsed) },
      },
    },
  };

  return (
    <ChartContainer>
      <Header>
        <TitleText>{title}</TitleText>
        {subtitle && <SubText>{subtitle}</SubText>}
      </Header>
      {segments.length === 0 ? (
        <EmptyState>No data for this period</EmptyState>
      ) : (
        <Body>
          <DonutWrap>
            <Doughnut data={chartData} options={options} />
            <CenterLabel>
              <CenterValue>{formatValue(total)}</CenterValue>
              <CenterCaption>{centerCaption}</CenterCaption>
            </CenterLabel>
          </DonutWrap>
          <Legend>
            {segments.map((seg, i) => (
              <LegendRow key={seg.label}>
                <Swatch color={CHART_PALETTE[i % CHART_PALETTE.length]} />
                <LegendLabel>{seg.label}</LegendLabel>
                <LegendValue>{formatValue(seg.value)}</LegendValue>
              </LegendRow>
            ))}
          </Legend>
        </Body>
      )}
    </ChartContainer>
  );
};

export default CategoryDonutChart;
