import React from "react";
import styled, { css, keyframes } from "styled-components";
import { theme } from "@/theme/theme"; // Adjust import based on your theme setup

interface SalesCardProps {
  title: string;
  amount: string; // e.g., "1.1M"
  date: string; // e.g., "9 February 2024"
  backgroundColor?: string; // Optional custom background color
  currencySymbol?: string; // Optional custom currency symbol (defaults to ₦)
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const CardContainer = styled.div<{ backgroundColor?: string }>`
  position: relative;
  background: ${(props) => props.backgroundColor || "#E0F7F2"};
  border-radius: 8px;
  padding: 12px;
  width: 100%;
//   max-width: 320px;
  background-clip: padding-box;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const CurrencyBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333; // Green currency symbol
  font-size: 22px;
  font-weight: 200;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: ${pulseAnimation} 2s infinite ease-in-out;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 200;
  color: #1A3C34; // Dark green title
  margin-bottom: 4px;
`;

const Amount = styled.p`
  font-size: 1.8rem;
  font-weight: 400;
  color: #1A3C34; // Dark green amount
  margin: 8px 0;
  line-height: 1.2;
`;

const DateText = styled.p`
  font-size: 0.875rem;
  font-weight: 400;
  color: #666666; // Light gray date
  margin-bottom: 12px;
`;

const BarChart = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 40px;
  gap: 6px;

  & > div {
    width: 4px; // Thinner bars to match the image
    background: black;
    border-radius: 4px;
  }
`;

const SalesCard: React.FC<SalesCardProps> = ({
  title,
  amount,
  date,
  backgroundColor,
  currencySymbol = "₦",
}) => {
  // Fixed bar heights to match the image's visual pattern (you can adjust or make dynamic)
  const barHeights = ["20px", "32px", "24px", "36px", "28px", "16px", "30px"];

  return (
    <CardContainer backgroundColor={backgroundColor}>
      <CurrencyBadge>{currencySymbol}</CurrencyBadge>
      <Title>{title}</Title>
      <Amount>{amount}</Amount>
      <DateText>{date}</DateText>
      <BarChart>
        {barHeights.map((height, index) => (
          <div key={index} style={{ height }} />
        ))}
      </BarChart>
    </CardContainer>
  );
};

export default SalesCard;