import { StyledButton } from "@/components/button/button-lellall";
import { theme } from "@/theme/theme";
import React from "react";
import styled, { css, keyframes } from "styled-components";
import tick from '@/assets/tick.svg';

interface PricingCardProps {
    title: string;
    features: string[];
    price: string;
    billingCycle: string;
    background?: string;
    color?: string;
    buttonText?: string;
    isCurrent?: boolean;
    isRecommended?: boolean; // New prop to indicate if this is the recommended plan
    onChoose?: () => void; // Callback for initiating payment
    isPaymentLoading?: boolean; // Loading state for payment
}

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const RecommendedBadge = styled.div<{ background?: string }>`
  position: absolute;
  top: -15px; // Position slightly above the card
  left: 30%;
  transform: translateX(-50%);
  width: 40px; // Circular size
  height: 40px; // Circular size
  background: linear-gradient(135deg, #D4A017, #8E44AD); // Gold-to-purple gradient to match Premium
  border-radius: 50%; // Perfect circle
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF; // White text/icon
  font-size: 0px; // Hide text, we’ll use a cog design instead
  border: 2px solid rgba(255, 255, 255, 0.2); // Subtle white border for depth
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), 0 0 10px rgba(212, 160, 23, 0.3); // Soft shadow with glow
  animation: ${rotateAnimation} 8s infinite linear; // Slow, continuous rotation for a modern feel

  &:before, &:after {
    content: "";
    position: absolute;
    border-radius: 50%;
  }

  &:before { // Outer cog teeth
    width: 44px;
    height: 44px;
    border: 2px dashed rgba(255, 255, 255, 0.4); // Dashed line for cog effect
    animation: ${rotateAnimation} 4s infinite reverse linear; // Opposite rotation for depth
  }

  &:after { // Inner cog detail
    width: 28px;
    height: 28px;
    border: 2px solid rgba(255, 255, 255, 0.2); // Inner circle for cog center
    background: rgba(0, 0, 0, 0.1); // Slight dark center for contrast
  }
`;

const CardContainer = styled.div<{ background?: string; isCurrent?: boolean; isRecommended?: boolean }>`
  position: relative;
  background: ${(props) => props.background || "white"};
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 416px;
  min-width: 260px;
  color: ${(props) => props.color || theme.colors.active};
  box-shadow: ${(props) => 
    props.isCurrent ? "0 8px 24px rgba(0, 0, 0, 0.1)" : 
    props.isRecommended ? "0 8px 24px rgba(0, 0, 0, 0.15)" : 
    "0 4px 12px rgba(0, 0, 0, 0.05)"};
  border: ${(props) =>
    props.isCurrent
      ? `2px solid transparent`
      : props.isRecommended
      ? `2px solid rgba(212, 160, 23, 0.5)` // Subtle gold border for recommended
      : `1px solid ${theme.colors.gray200}`};
  background: ${(props) =>
    props.isCurrent
      ? `linear-gradient(${props.background || "white"}, ${props.background || "white"}) padding-box, linear-gradient(135deg, ${theme.colors.success}, ${theme.colors.primary}) border-box`
      : props.background || "white"};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  transform: ${(props) => (props.isCurrent || props.isRecommended) ? "scale(1.02)" : "scale(1)"};
  
  &:hover {
    transform: scale(1.03);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const CurrentBadge = styled.div`
  position: absolute;
  top: -12px;
  right: 16px;
  background: ${theme.colors.success};
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
`;

const FeatureList = styled.ul`
  margin-top: 16px;
  text-align: left;
  space-y: 12px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 300;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const PriceText = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 24px;
  margin-bottom: 16px;
`;

const BillingCycleText = styled.span`
  font-size: 0.875rem;
  font-weight: 400;
  opacity: 0.8;
`;

const PricingCard: React.FC<PricingCardProps> = ({
    title,
    features,
    price,
    billingCycle,
    background,
    color,
    buttonText = "Choose",
    isCurrent,
    isRecommended = false, // Default to false, can be set to true for "Premium"
    onChoose,
    isPaymentLoading,
}) => {
    return (
        <CardContainer background={background} color={color} isCurrent={isCurrent} isRecommended={isRecommended} className="p-6 rounded-lg">
            {isCurrent && <CurrentBadge>Current Plan</CurrentBadge>}
            {isRecommended && <RecommendedBadge background={background} />}
            <div className="flex-grow">
                <Title>{title}</Title>
                <FeatureList>
                    {features.map((feature, index) => (
                        <FeatureItem key={index}>
                            {color ? (
                                <span className="mr-2"></span>
                            ) : (
                                <img src={tick} className="mr-2 w-4 h-4" alt="tick" />
                            )}
                            {feature}
                        </FeatureItem>
                    ))}
                </FeatureList>
            </div>
            <div>
                <PriceText>
                    ₦{price} <BillingCycleText>/{billingCycle}</BillingCycleText>
                </PriceText>
            </div>
            <StyledButton
                background={isCurrent ? theme.colors.success : background ? '#fff' : theme.colors.active}
                color={isCurrent ? '#fff' : color ? theme.colors.active : '#fff'}
                variant={isCurrent ? "solid" : "outline"}
                type="submit"
                disabled={isCurrent || isPaymentLoading}
                style={{ borderRadius: '8px', padding: '10px 24px' }}
                onClick={isCurrent ? undefined : onChoose} // Trigger payment for non-current plans
            >
                {isPaymentLoading && !isCurrent ? "Processing..." : isCurrent ? "Active" : buttonText}
            </StyledButton>
        </CardContainer>
    );
};

export default PricingCard;