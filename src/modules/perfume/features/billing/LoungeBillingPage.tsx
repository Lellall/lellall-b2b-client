import React from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { theme } from '@/theme/theme';
import { ColorRing } from 'react-loader-spinner';
import { Cover } from '@/modules/restaurant/features/subscriptions/subscriptions';
import PricingCard from '@/modules/restaurant/features/subscriptions/components/pricing-card';
import { useGetPerfumeBillingStatusQuery, useSubscribePerfumeBillingMutation } from '@/redux/api/perfume-store/billing.api';

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

const PLAN_FEATURES = ['POS & Inventory', 'Client Management', 'Sales Dashboard', 'Recent Transactions & Reports'];

const StoreBillingPage: React.FC = () => {
  const { user, restaurant } = useSelector(selectAuth);
  const storeId = user?.perfumeStoreId || restaurant?.id || '';
  const { data: status, isLoading } = useGetPerfumeBillingStatusQuery(storeId, { skip: !storeId });
  const [subscribe, { isLoading: isSubscribing }] = useSubscribePerfumeBillingMutation();

  const handleSubscribe = async () => {
    try {
      const result = await subscribe({ storeId, email: user?.email || '' }).unwrap();
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
        Power Your Perfume Store
      </div>
      <div className="mt-2 text-sm sm:text-base text-center font-light">
        Your store's subscription with Lellall, billed monthly via Paystack
      </div>

      <div className="mt-8 flex justify-center">
        <PricingCard
          title="Core"
          features={PLAN_FEATURES}
          price={(status.amount || 0).toLocaleString()}
          billingCycle="Monthly"
          background="linear-gradient(to right, #36D1DC, #5B86E5)"
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

export default StoreBillingPage;
