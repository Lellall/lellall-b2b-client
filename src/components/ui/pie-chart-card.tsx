import React from "react";
import styled from "styled-components";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartCardProps {
    title: string;
    data: { label: string; percentage: number; color: string; isPercentage?: boolean }[];
    legendStyle?: React.CSSProperties; // Prop for legend styling
}

const CardContainer = styled.div`
    background: #FFFFFF;
    border-radius: 16px;
    padding: 16px;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const Title = styled.h3`
    font-size: 0.875rem;
    font-weight: 600;
    color: #666666;
    margin-bottom: 12px;
    text-align: center;
`;

const Legend1 = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 12px;
    width: 100%;
`;

const LegendItem = styled.div<{ color: string }>`
    display: flex;
    align-items: center;
    margin-bottom: 4px;

    &:before {
        content: "";
        width: 10px;
        height: 10px;
        background: ${(props) => props.color};
        margin-right: 6px;
        border-radius: 50%;
    }
`;

const PieChartCard: React.FC<PieChartCardProps> = ({ title, data, legendStyle }) => {
    // Prepare data for ChartJS
    const chartData = {
        labels: data.map((item) =>
            item.isPercentage === false
                ? `${item.label} (${item.percentage})`
                : `${item.label} (${item.percentage}%)`
        ),
        datasets: [
            {
                data: data.map((item) => item.percentage),
                backgroundColor: data.map((item) => item.color),
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) =>
                        data[tooltipItem.dataIndex].isPercentage === false
                            ? `${data[tooltipItem.dataIndex].label}: ${data[tooltipItem.dataIndex].percentage}`
                            : `${data[tooltipItem.dataIndex].label}: ${data[tooltipItem.dataIndex].percentage}%`,
                },
            },
        },
    };

    // Helper function to format the display value
    const getDisplayValue = (item: { percentage: number; isPercentage?: boolean }) =>
        item.isPercentage === false ? `${item.percentage}` : `${item.percentage}%`;

    // Default legend style (removed as we're now passing it explicitly)
    return (
        <CardContainer>
            <Title>{title}</Title>
            <div style={{ width: "180px", height: "180px" }}>
                <Pie data={chartData} options={options} />
            </div>
            <Legend1>
                {data.map((item, index) => (
                    <LegendItem key={index} color={item.color}>
                        <span style={{ ...legendStyle }}>
                            {item.label} ({getDisplayValue(item)})
                        </span>
                    </LegendItem>
                ))}
            </Legend1>
        </CardContainer>
    );
};

export default PieChartCard;