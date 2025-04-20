// src/components/ui/sales-card.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';

interface SalesCardProps {
  title: string;
  amount: string;
  backgroundColor?: string;
  currencySymbol?: string;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const CardContainer = styled.div<{ backgroundColor?: string }>`
  position: relative;
  background: ${(props) => props.backgroundColor || '#E0F7F2'};
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  background-clip: padding-box;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  @media (max-width: 768px) {
    padding: 10px;
  }
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
  color: #333;
  font-size: 22px;
  font-weight: 200;
  animation: ${pulseAnimation} 2s infinite ease-in-out;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 18px;
  }
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 200;
  color: #1A3C34;
  margin-bottom: 4px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Amount = styled.p`
  font-size: 1.8rem;
  font-weight: 400;
  color: #1A3C34;
  margin: 8px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BarChart = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 40px;
  gap: 6px;

  & > div {
    width: 4px;
    background: black;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    height: 30px;
    gap: 4px;

    & > div {
      width: 3px;
    }
  }
`;

const SalesCard: React.FC<SalesCardProps> = ({ title, amount, backgroundColor, currencySymbol = '₦' }) => {
  const barHeights = ['20px', '32px', '24px', '36px', '28px', '16px', '30px'];

  return (
    <CardContainer backgroundColor={backgroundColor}>
      <CurrencyBadge>{currencySymbol}</CurrencyBadge>
      <Title>{title}</Title>
      <Amount>{amount}</Amount>
      <BarChart>
        {barHeights.map((height, index) => (
          <div key={index} style={{ height }} />
        ))}
      </BarChart>
    </CardContainer>
  );
};

export default SalesCard;
