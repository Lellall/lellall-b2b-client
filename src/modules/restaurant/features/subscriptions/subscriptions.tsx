import styled from "styled-components";
import subs from "@/assets/subs.svg";
import { useState } from "react";
import LellallSwitch from "@/components/ui/switch.component";
import PricingCard from "./components/pricing-card";
import { theme } from "@/theme/theme";
import {
  useGetAllSubscriptionPlansQuery,
  useInitiateSubscriptionPaymentMutation,
} from "@/redux/api/subscriptions/subscriptions.api";
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';

export const Cover = styled.div`
  background-image: url(${subs});
  background-size: cover;
  background-position: center;
  border-radius: 15px;
  width: 100%;
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
`;

// Restyled ProviderCard with modern design
const ProviderCard = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  margin: 0 15px;
  border-radius: 12px;
  border: 2px solid 
    ${(props) =>
        props.isSelected
            ? theme.colors.borderSelected
            : "transparent"}; // No border when not selected for a cleaner look
  background: ${(props) =>
        props.isSelected
            ? "linear-gradient(45deg, #4A90E2, #50C878)" // Gradient for selected state
            : "linear-gradient(45deg, #FFFFFF, #F5F7FA)"}; // Soft gradient for default
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // Subtle shadow for depth
  cursor: pointer;
  transition: all 0.3s ease-in-out; // Smoother transition
  position: relative; // For potential pseudo-elements or badges

  &:hover {
    transform: translateY(-2px); // Lift effect on hover
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); // Enhanced shadow on hover
    background: linear-gradient(45deg, #4A90E2, #50C878); // Same as selected for hover
    border-color: transparent;
  }

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    padding: 2px; // Stroke width
    background: linear-gradient(45deg, #4A90E2, #50C878);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    pointer-events: none; // Ensure clicks go through
  }
`;

const ProviderLabel = styled.span`
  margin-left: 16px;
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.providerText};
  letter-spacing: 0.5px; // Slight spacing for readability
  text-transform: capitalize; // Better readability
  transition: color 0.3s ease-in-out;

  ${ProviderCard}:hover & {
    color: #FFFFFF; // White text on hover for contrast
  }

  ${ProviderCard}[isSelected="true"] & {
    color: #FFFFFF; // White text when selected
  }
`;

const Subscriptions = () => {
  const [isChecked, setChecked] = useState(false); // False = Monthly, True = Annually
  const [selectedProvider, setSelectedProvider] = useState<"flutterwave" | "paystack" | null>(null); // Track selected provider
  const { data: plans, isLoading, error } = useGetAllSubscriptionPlansQuery();
  const { subscription, user } = useSelector(selectAuth); // Get current subscription and user
  const [initiatePayment, { isLoading: isPaymentLoading }] = useInitiateSubscriptionPaymentMutation();
  const { subdomain } = useSelector(selectAuth);

  // Filter out the "Basic" plan and adjust pricing based on billing cycle
  const filteredPlans = plans
    ? plans
      .filter((plan) => plan.name !== "Basic") // Exclude Basic plan
      .map((plan) => ({
        ...plan,
        price: isChecked ? plan.price * 12 : plan.price,
        billingCycle: isChecked ? "Annually" : "Monthly",
        isCurrent: subscription?.plan?.id === plan.id && subscription?.status === "ACTIVE",
      }))
    : [];

  const planFeatures = {
    "Basic Plan": ["Inventory Management", "Menu Management"],
    "Standard Plan": ["Inventory Management", "Menu Management", "Reports"],
    "Business Plan": ["Inventory Management", "Menu Management", "Reports", "Reservations"],
    "Premium Plan": [
      "Inventory Management",
      "Menu Management",
      "Reports",
      "Reservations",
      "Staff Management",
      "In App Chat",
      "Multi Branch Management",
    ],
  };

  const planStyles = {
    "Basic Plan": { background: "#1E2A38", color: "#A9CCE3" }, // Deep navy blue-gray, soft sky blue
    "Standard Plan": { background: "#2E4057", color: "#D4A017" }, // Charcoal blue, mustard gold
    "Business Plan": { background: "#1ABC9C", color: "#ECF0F1" }, // Vibrant teal, light gray
    "Premium Plan": { background: "linear-gradient(to right, #D4A017, #8E44AD)", color: "#FFFFFF" }, // Gold to purple, white text
  };

  // Handle payment initiation with subdomain
  const handleInitiatePayment = async (planId: string, planPrice: number) => {
    if (!user?.ownedRestaurant?.id || !user?.email) {
      toast.error("User or restaurant information is missing.");
      return;
    }

    if (!selectedProvider) {
      toast.error("Please select a payment provider.");
      return;
    }

    const reference = `sub_${user.ownedRestaurant.id}_${Date.now()}`;
    const paymentDto = {
      email: user.email,
      amount: isChecked ? (planPrice * 12).toString() : planPrice.toString(),
      currency: "NGN",
      plan: planId,
      ...(selectedProvider === "flutterwave"
        ? { tx_ref: reference, redirect_url: `${window.location.origin}/verify-payment?provider=flutterwave&trxref=${reference}` }
        : { reference: reference }),
    };

    try {
      console.log("Initiating payment with DTO:", paymentDto);
      const response = await initiatePayment({
        restaurantId: user.ownedRestaurant.id,
        dto: paymentDto,
        provider: selectedProvider,
        subdomain, // Hardcode or dynamically set the subdomain (e.g., from config or user input)
      }).unwrap();
      console.log("Payment initiation response:", response);
      toast.success("Redirecting to payment...");
      if (response.paymentLink) {
        window.location.href = response.paymentLink;
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <Cover>
        <div className="mt-20 text-center text-[${theme.colors.accent}]">Loading subscription plans...</div>
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
      <div className="mt-20 my-auto text-2xl text-center ml-1 font-semibold text-[${theme.colors.accent}]">
        Streamline Your Restaurant Operations
      </div>
      <div className="mt-1 my-auto text-sm text-center ml-1 font-light text-[${theme.colors.accent}]">
        Comprehensive Management Solutions for Modern Dining Experiences
      </div>
      <div className="mx-auto mt-5 flex justify-center text-center">
        <div className="mt-1 my-auto text-sm text-center ml-1 font-light text-[${theme.colors.accent}]">
          Select Your Preferred Payment Provider
        </div>
      </div>
      {/* Payment Provider Selection */}
      <div className="mx-auto mt-5 flex justify-center text-center">
        <div className="flex">
          <ProviderCard
            isSelected={selectedProvider === "flutterwave"}
            onClick={() => setSelectedProvider("flutterwave")}
          >
            <img
              src="https://cdn.brandfetch.io/iddYbQIdlK/id3uOuItwN.svg?c=1dxbfHSJFAPEGdCLU4o5B" // Add logo to public folder
              alt="Flutterwave"
              width={30}
              height={30}
            />
            <ProviderLabel>Flutterwave</ProviderLabel>
          </ProviderCard>
          <ProviderCard
            isSelected={selectedProvider === "paystack"}
            onClick={() => setSelectedProvider("paystack")}
          >
            <img
              src="https://cdn.brandfetch.io/idM5mrwtDs/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B" // Add logo to public folder
              alt="Paystack"
              width={30}
              height={30}
            />
            <ProviderLabel>Paystack</ProviderLabel>
          </ProviderCard>
        </div>
      </div>
      <div className="mt-10 flex justify-evenly text-center bg-[${theme.colors.secondary}] min-h-[416px] rounded-xl">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-[${theme.colors.secondary}]"
            style={{ marginTop: plan.name === "Standard Plan" ? "-20px" : "0" }}
          >
            <PricingCard
              title={plan.name}
              features={planFeatures[plan.name] || []}
              price={plan.amount.toLocaleString()}
              billingCycle={plan.billingCycle}
              background={planStyles[plan.name]?.background || theme.colors.secondary}
              color={planStyles[plan.name]?.color || theme.colors.primaryFont}
              isCurrent={plan.isCurrent}
              isRecommended={plan.name === "Premium Plan"}
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