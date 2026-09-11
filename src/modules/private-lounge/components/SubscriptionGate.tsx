import React from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { Lock1 } from 'iconsax-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useGetLoungeBillingStatusQuery, useSubscribeLoungeBillingMutation } from '@/redux/api/private-lounge/billing.api';

const BRAND_GREEN = '#05431E';

const Overlay = styled.div`
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 48px 40px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
`;

const IconBadge = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #FEF2F2;
  color: #DC2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0 0 24px;
`;

const AmountRow = styled.div`
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubscribeButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: ${BRAND_GREEN};
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface SubscriptionGateProps {
  loungeId: string;
  children: React.ReactNode;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ loungeId, children }) => {
  const { user } = useSelector(selectAuth);
  const { formatCurrency } = useCurrency();
  const { data: status, isLoading } = useGetLoungeBillingStatusQuery(loungeId, {
    skip: !loungeId,
    pollingInterval: 5 * 60 * 1000,
  });
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeLoungeBillingMutation();

  // Fail-open while we don't yet know the status, so a slow network never flash-blocks the app.
  if (!loungeId || isLoading || !status) return <>{children}</>;
  if (!status.isBlocked) return <>{children}</>;

  const handleSubscribe = async () => {
    try {
      const result = await subscribe({ loungeId, email: user?.email || '' }).unwrap();
      if (result?.authorizationUrl) {
        window.location.href = result.authorizationUrl;
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to start subscription. Contact support.');
    }
  };

  return (
    <Overlay>
      <Card>
        <IconBadge>
          <Lock1 size={28} variant="Bold" />
        </IconBadge>
        <Title>Subscription Required</Title>
        <Subtitle>
          Your free trial has ended. Subscribe to continue using membership, walk-ins, and the dashboard for this lounge.
        </Subtitle>
        <AmountRow>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Monthly Plan</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
            {formatCurrency(status.amount || 0)}
          </span>
        </AmountRow>
        <SubscribeButton onClick={handleSubscribe} disabled={isSubscribing}>
          {isSubscribing ? 'Redirecting…' : 'Subscribe with Paystack'}
        </SubscribeButton>
      </Card>
    </Overlay>
  );
};

export default SubscriptionGate;
