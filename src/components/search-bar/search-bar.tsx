import React from 'react';
import styled from 'styled-components';
import { SearchNormal1 } from 'iconsax-react';

interface SearchBarProps {
  placeholder?: string;
  width?: string;
  height?: string;
  border?: string;
  borderRadius?: string;
  backgroundColor?: string;
  shadow?: boolean;
  fontSize?: string;
  color?: string;
  inputPadding?: string;
  placeholderColor?: string;
  iconColor?: string;
  iconSize?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // Add onChange prop
}

const SearchContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['width', 'height', 'border', 'borderRadius', 'backgroundColor', 'shadow'].includes(prop),
})<SearchBarProps>`
  display: flex;
  align-items: center;
  width: ${({ width }) => width || 'min(100%, 400px)'}; /* Responsive width */
  height: ${({ height }) => height || 'clamp(36px, 10vw, 44px)'}; /* Responsive height */
  padding: 0 6px; /* More minimal padding */
  // border: ${({ border }) => border || '1px solid #e5e5e5'}; /* Initial border */
  border-radius: ${({ borderRadius }) => borderRadius || '20px'};
  background-color: ${({ backgroundColor }) => backgroundColor || '#ffffff'}; /* Initial background */
  box-shadow: ${({ shadow }) =>
    shadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

  /* Media Queries for Tablets */
  @media (min-width: 768px) {
    width: ${({ width }) => width || 'min(100%, 500px)'};
    height: ${({ height }) => height || '48px'};
    padding: 0 8px; /* Slightly larger but minimal padding */
  }

  /* Media Queries for Desktops */
  @media (min-width: 1024px) {
    width: ${({ width }) => width || '330px'}; /* Fixed 400px width */
    padding: 0 8px; /* Minimal padding */
  }
`;

const SearchInput = styled.input.withConfig({
  shouldForwardProp: (prop) => !['fontSize', 'color', 'inputPadding', 'placeholderColor'].includes(prop),
})<SearchBarProps>`
  flex: 1;
  border: none;
  outline: none;
  font-size: ${({ fontSize }) => fontSize || 'clamp(12px, 2.5vw, 14px)'}; /* Responsive font size */
  color: ${({ color }) => color || '#333'};
  background-color: transparent;
  padding-left: ${({ inputPadding }) => inputPadding || '8px'};
  font-weight: 300;

  ::placeholder {
    color: ${({ placeholderColor }) => placeholderColor || '#aaa'};
  }

  /* Media Queries for larger screens */
  @media (min-width: 768px) {
    font-size: ${({ fontSize }) => fontSize || '16px'};
    padding-left: ${({ inputPadding }) => inputPadding || '10px'};
  }
`;

const IconWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['iconColor'].includes(prop),
})<SearchBarProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ iconColor }) => iconColor || '#555'};
`;

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search items',
  width,
  height,
  border,
  borderRadius,
  backgroundColor,
  shadow = false,
  fontSize,
  color,
  inputPadding,
  placeholderColor,
  iconColor,
  iconSize = 20,
  onChange,
}) => {
  return (
    <SearchContainer
      width={width}
      height={height}
      border={border}
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      shadow={shadow}
    >
      <SearchInput
        type="text"
        placeholder={placeholder}
        fontSize={fontSize}
        color={color}
        inputPadding={inputPadding}
        placeholderColor={placeholderColor}
        onChange={onChange} // Pass onChange to input
      />
      <IconWrapper iconColor={iconColor}>
        <SearchNormal1 size={iconSize} />
      </IconWrapper>
    </SearchContainer>
  );
};

export default SearchBar;