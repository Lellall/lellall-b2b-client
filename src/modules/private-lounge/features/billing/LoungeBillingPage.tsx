import React from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { theme } from '@/theme/theme';
import { ColorRing } from 'react-loader-spinner';
import { Cover } from '@/modules/restaurant/features/subscriptions/subscriptions';
import PricingCard from '@/modules/restaurant/features/subscriptions/components/pricing-card';
import { useGetLoungeBillingStatusQuery, useSubscribeLoungeBillingMutation } from '@/redux/api/private-lounge/billing.api';

const ExpiredMessage = styled.div`
  background-color: #FF3333;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    font-size: 16px;
    padding: 10px;
    margin-bottom: 12px;
  }
`;

const PLAN_FEATURES = ['Membership Management', 'Walk-In Guest Passes', 'Bottle Storage & Retrieval', 'Revenue Dashboard & Reports'];

const LoungeBillingPage: React.FC = () => {
  const { user } = useSelector(selectAuth);
  const loungeId = user?.privateLoungeId || '';
  const { data: status, isLoading } = useGetLoungeBillingStatusQuery(loungeId, { skip: !loungeId });
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeLoungeBillingMutation();

  const handleSubscribe = async () => {
    try {
      const result = await subscribe({ loungeId, email: user?.email || '' }).unwrap();
      if (result?.authorizationUrl) window.location.href = result.authorizationUrl;
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to start subscription. Contact support.');
    }
  };

  if (isLoading || !status) {
    return (
      <Cover>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <ColorRing height="80" width="80" radius="9" color={theme.colors.active} ariaLabel="loading" visible={true} />
        </div>
      </Cover>
    );
  }

  const isActive = !!status.paystackSubscriptionCode && status.status === 'ACTIVE';

  return (
    <Cover>
      {status.isBlocked && (
        <ExpiredMessage>Your subscription has expired. Please renew to continue using the platform.</ExpiredMessage>
      )}
      <div className="mt-12 sm:mt-20 text-lg sm:text-2xl text-center font-semibold">
        Elevate Your Lounge Experience
      </div>
      <div className="mt-2 text-sm sm:text-base text-center font-light">
        Your lounge's subscription with Lellall, billed monthly via Paystack
      </div>

      <div className="mt-8 flex justify-center">
        <PricingCard
          title="Bespoke"
          features={PLAN_FEATURES}
          price={(status.amount || 0).toLocaleString()}
          billingCycle="Monthly"
          background="linear-gradient(to right, #0F2027, #203A43, #2C5364)"
          color="#FFFFFF"
          isCurrent={isActive}
          onChoose={handleSubscribe}
          isPaymentLoading={isSubscribing}
          buttonText="Subscribe with Paystack"
        />
      </div>

      {!isActive && (
        <div className="mt-6 text-sm text-center" style={{ color: theme.colors.primaryFont }}>
          {status.status === 'TRIAL'
            ? `${status.daysRemaining} day${status.daysRemaining === 1 ? '' : 's'} left in your free trial`
            : status.status}
        </div>
      )}
    </Cover>
  );
};

export default LoungeBillingPage;
