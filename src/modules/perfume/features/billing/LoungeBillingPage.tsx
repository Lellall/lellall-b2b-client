import React from 'react';
import styled from 'styled-components';
import { CardCoin, Clock } from 'iconsax-react';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 40px;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }
`;

const ComingSoonCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 64px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  svg {
    color: #05431E;
    background: #ECFDF5;
    padding: 16px;
    border-radius: 50%;
    width: 64px;
    height: 64px;
    border: 1px solid #A7F3D0;
  }

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }

  p {
    font-size: 14px;
    color: #6B7280;
    max-width: 480px;
    margin: 0;
    line-height: 1.5;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #F3F4F6;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid #E5E7EB;
`;

const StoreBillingPage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <h1>Billing & Subscriptions</h1>
        <p>Manage store subscription, payment methods, and invoices</p>
      </PageHeader>

      <ComingSoonCard>
        <CardCoin size="32" variant="Bold" />
        <Badge>
          <Clock size="14" />
          Coming Soon
        </Badge>
        <h2>Subscription & Paystack Billing</h2>
        <p>
          We are currently configuring automated subscription billing via Paystack for Sanctum Airport Stores. 
          Your subscription status and invoices will be available here soon.
        </p>
      </ComingSoonCard>
    </PageContainer>
  );
};

export default StoreBillingPage;
