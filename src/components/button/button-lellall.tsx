import { Button } from "@/components/ui/button";
import styled from "styled-components";
import { theme } from "@/theme/theme";

export const StyledButton = styled(Button)<{
    width?: string;
    color?: string;
    background?: string;
    spaceTop?: string;
    spaceBottom?: string;
    spaceLeft?: string;
    spaceRight?: string;
    fontSize?: string;
    border?: string;
    hoverBackground?: string;
    hoverColor?: string;
    display?: string;
    alignItems?: string;
    justifyContent?: string;
    textTransform?: string;
    letterSpacing?: string;
    boxShadow?: string;
}>`
    width: ${({ width }) => width || '100%'};
    background-color: ${({ background }) => background || theme.colors.primary};
    color: ${({ color }) => color || theme.colors.primaryFont};
    padding: 20px;
    border-radius: 15px;
    margin-top: ${({ spaceTop }) => spaceTop || 0};
    margin-bottom: ${({ spaceBottom }) => spaceBottom || 0};
    margin-left: ${({ spaceLeft }) => spaceLeft || 0};
    margin-right: ${({ spaceRight }) => spaceRight || 0};
    font-size: ${({ fontSize }) => fontSize || '12px'};
    border: ${({ border }) => border || 'none'};
    display: ${({ display }) => display || 'inline-flex'};
    align-items: ${({ alignItems }) => alignItems || 'center'};
    justify-content: ${({ justifyContent }) => justifyContent || 'center'};
    text-transform: ${({ textTransform }) => textTransform || 'none'};
    letter-spacing: ${({ letterSpacing }) => letterSpacing || 'normal'};
    box-shadow: ${({ boxShadow }) => boxShadow || 'none'};
    transition: transform 0.3s ease, background-color 0.3s ease;

    &:hover {
        transform: scale(0.95);
    }
`;
