import styled from 'styled-components';
import subs from '@/assets/subs.svg';
import { useState } from 'react';
import LellallSwitch from '@/components/ui/switch.component';
import PricingCard from './components/pricing-card';
import { ColorRing } from 'react-loader-spinner';
import { theme } from '@/theme/theme';
import {
  useGetAllSubscriptionPlansQuery,
  useInitiateSubscriptionPaymentMutation,
} from '@/redux/api/subscriptions/subscriptions.api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

export const Cover = styled.div`
  background-image: url(${subs});
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  padding: 16px;

  @media (max-width: 640px) {
    background-size: contain;
    background-repeat: no-repeat;
    min-height: auto;
    padding: 12px;
  }
`;

const ProviderCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 0 8px;
  border-radius: 12px;
  border: 2px solid
    ${(props) =>
    props.isSelected ? theme.colors.borderSelected : 'transparent'};
  background: ${(props) =>
    props.isSelected
      ? 'linear-gradient(45deg, #4A90E2, #50C878)'
      : 'linear-gradient(45deg, #FFFFFF, #F5F7FA)'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    background: linear-gradient(45deg, #4A90E2, #50C878);
    border-color: transparent;
  }

  @media (max-width: 640px) {
    padding: 10px 12px;
    margin: 0 4px;
  }
`;

const ProviderLabel = styled.span`
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.providerText};
  letter-spacing: 0.5px;
  text-transform: capitalize;
  transition: color 0.3s ease-in-out;

  ${ProviderCard}:hover & {
    color: #FFFFFF;
  }

  ${ProviderCard}[isSelected='true'] & {
    color: #FFFFFF;
  }

  @media (max-width: 640px) {
    font-size: 14px;
    margin-left: 8px;
  }
`;

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

const Subscriptions = () => {
  const [isChecked, setChecked] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'flutterwave' | 'paystack' | null>(null);
  const { data: plans, isLoading, error } = useGetAllSubscriptionPlansQuery();
  const { subscription, user } = useSelector(selectAuth);
  const [initiatePayment, { isLoading: isPaymentLoading }] = useInitiateSubscriptionPaymentMutation();
  const { subdomain } = useSelector(selectAuth);

  // Calculate days left for subscription
  const calculateDaysLeft = (endDate: string | null): number => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const daysLeft = subscription?.trialEndDate
    ? calculateDaysLeft(subscription.trialEndDate)
    : subscription?.endDate
      ? calculateDaysLeft(subscription.endDate)
      : 0;

  const filteredPlans = plans
    ? plans
      .filter((plan) => plan.name !== 'Basic')
      .map((plan) => ({
        ...plan,
        price: isChecked ? plan.price * 12 : plan.price,
        billingCycle: isChecked ? 'Annually' : 'Monthly',
        isCurrent: subscription?.plan?.id === plan.id && subscription?.status === 'ACTIVE',
      }))
    : [];

  const planFeatures = {
    // 'Basic Plan': ['Inventory Management', 'Menu Management'],
    // 'Standard Plan': ['Inventory Management', 'Menu Management', 'Reports'],
    'Core': ['Inventory Management', 'Menu Management', 'Reports', 'Reservations', 'Staff Management'],
    'Elite': [
      'Inventory Management',
      'Menu Management',
      'Reports',
      'Reservations',
      'Staff Management',
      // 'In App Chat',
      'Staff Management',
      // 'Multi Branch Management',
      'AI-Powered Reports and Management'
    ],
  };

  const planStyles = {
    // 'Basic Plan': { background: '#1E2A38', color: '#A9CCE3' },
    // 'Standard Plan': { background: '#2E4057', color: '#D4A017' },
    'Core': {
      background: 'linear-gradient(to right, #36D1DC, #5B86E5)', // aqua → soft blue
      color: '#FFFFFF'     // clean light text
    },

    'Elite': {
      background: 'linear-gradient(to right, #0F2027, #203A43, #2C5364)', // dark modern teal gradient
      color: '#FFFFFF'
    }
  };

  const handleInitiatePayment = async (planId: string, planPrice: number) => {
    if (!user?.ownedRestaurant?.id || !user?.email) {
      toast.error('User or restaurant information is missing.');
      return;
    }

    if (!selectedProvider) {
      toast.error('Please select a payment provider.');
      return;
    }

    const reference = `sub_${user.ownedRestaurant.id}_${Date.now()}`;
    const paymentDto = {
      email: user.email,
      amount: isChecked ? (planPrice * 12).toString() : planPrice.toString(),
      currency: 'NGN',
      plan: planId,
      ...(selectedProvider === 'flutterwave'
        ? { tx_ref: reference, redirect_url: `${window.location.origin}/verify-payment?provider=flutterwave&trxref=${reference}` }
        : { reference: reference }),
    };

    try {
      console.log('Initiating payment with DTO:', paymentDto);
      const response = await initiatePayment({
        restaurantId: user.ownedRestaurant.id,
        dto: paymentDto,
        provider: selectedProvider,
        subdomain,
      }).unwrap();
      console.log('Payment initiation response:', response);
      toast.success('Redirecting to payment...');
      if (response.paymentLink) {
        window.location.href = response.paymentLink;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Cover>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <ColorRing
            height="80"
            width="80"
            radius="9"
            color={theme.colors.active}
            ariaLabel="three-dots-loading"
            visible={true}
          />
        </div>
      </Cover>
    );
  }

  if (error) {
    return (
      <Cover>
        <div className="mt-20 text-center text-red-500">Error loading plans: {JSON.stringify(error)}</div>
      </Cover>
    );
  }

  return (
    <Cover>
      {daysLeft === 3 && (
        <ExpiredMessage>Subscription has expired. Please renew to continue using the platform.</ExpiredMessage>
      )}
      <div className="mt-12 sm:mt-20 text-lg sm:text-2xl text-center font-semibold text-[${theme.colors.accent}]">
        Streamline Your Restaurant Operations
      </div>
      <div className="mt-2 text-sm sm:text-base text-center font-light text-[${theme.colors.accent}]">
        Comprehensive Management Solutions for Modern Dining Experiences
      </div>
      <div className="mt-6 flex justify-center text-center">
        <div className="text-sm sm:text-base font-light text-[${theme.colors.accent}]">
          Select Your Preferred Payment Provider
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
        <ProviderCard
          isSelected={selectedProvider === 'flutterwave'}
          onClick={() => setSelectedProvider('flutterwave')}
        >
          <img
            src="https://cdn.brandfetch.io/iddYbQIdlK/id3uOuItwN.svg?c=1dxbfHSJFAPEGdCLU4o5B"
            alt="Flutterwave"
            width={24}
            height={24}
            className="sm:w-6 sm:h-6"
          />
          <ProviderLabel>Flutterwave</ProviderLabel>
        </ProviderCard>
        <ProviderCard
          isSelected={selectedProvider === 'paystack'}
          onClick={() => setSelectedProvider('paystack')}
        >
          <img
            src="https://cdn.brandfetch.io/idM5mrwtDs/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B"
            alt="Paystack"
            width={24}
            height={24}
            className="sm:w-6 sm:h-6"
          />
          <ProviderLabel>Paystack</ProviderLabel>
        </ProviderCard>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row sm:justify-evenly gap-6 sm:gap-4 rounded-xl p-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="w-full sm:w-auto"
            style={{ marginTop: plan.name === 'Standard Plan' ? '-20px' : '0' }}
          >
            <PricingCard
              title={plan.name}
              features={planFeatures[plan.name] || []}
              price={plan.amount.toLocaleString()}
              billingCycle={plan.billingCycle}
              background={planStyles[plan.name]?.background || theme.colors.secondary}
              color={planStyles[plan.name]?.color || theme.colors.primaryFont}
              isCurrent={plan.isCurrent}
              isRecommended={plan.name === 'Premium Plan'}
              onChoose={() => handleInitiatePayment(plan.id, plan.amount)}
              isPaymentLoading={isPaymentLoading}
            />
          </div>
        ))}
      </div>
    </Cover>
  );
};

export default Subscriptions;