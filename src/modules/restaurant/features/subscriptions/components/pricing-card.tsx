import { StyledButton } from "@/components/button/button-lellall";
import { theme } from "@/theme/theme";
import React from "react";
import styled from "styled-components";
import tick from '@/assets/tick.svg';

interface PricingCardProps {
    title: string;
    features: string[];
    price: string;
    billingCycle: string;
    background?: string;
    color?: string;
    buttonText?: string;
}

const CardContainer = styled.div<{ background?: string }>`
  background: ${(props) => props.background || "white"};
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  min-height: 416px;
  min-width: 260px;
  color: ${(props) => props.color || theme.colors.active}
`;

const PricingCard: React.FC<PricingCardProps> = ({
    title,
    features,
    price,
    billingCycle,
    background,
    buttonText = "Choose",
    color
}) => {
    return (
        <CardContainer background={background} color={color} className="p-6 rounded-lg">
            <div className="flex-grow">
                <h2 className="text-xl font-semibold ">{title}</h2>
                <ul className="mt-4 text-left space-y-2 ">
                    {features.map((feature, index) => (
                        <li key={index} className="text-sm flex items-center font-light">
                           {color ? '>' : <img src={tick} className="mr-1"/>} {feature}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="my-1">
                <p className="mt-6 text-lg font-semibold ">
                    ₦{price} <span className="text-sm font-normal">/{billingCycle}</span>
                </p>
            </div>
            <StyledButton
                background={background ? '#fff' : theme.colors.active}
                color={color ? theme.colors.active : '#fff'  }
                variant="outline"
                type="submit"
            >
                Choose
            </StyledButton>
        </CardContainer>
    );
};

export default PricingCard;
