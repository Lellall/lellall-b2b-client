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
}

const SearchContainer = styled.div<SearchBarProps>`
  display: flex;
  align-items: center;
  width: ${(props) => props.width || '300px'};
  height: ${(props) => props.height || '40px'};
  padding: 0 10px;
  border: ${(props) => props.border || '1px solid #e5e5e5'};
  border-radius: ${(props) => props.borderRadius || '20px'};
  background-color: ${(props) => props.backgroundColor || '#ffffff'};
  box-shadow: ${(props) =>
    props.shadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};
`;

const SearchInput = styled.input<SearchBarProps>`
  flex: 1;
  border: none;
  outline: none;
  font-size: ${(props) => props.fontSize || '14px'};
  color: ${(props) => props.color || '#333'};
  background-color: transparent;
  padding-left: ${(props) => props.inputPadding || '5px'};
  font-weight: 300;
  ::placeholder {
    color: ${(props) => props.placeholderColor || '#aaa'};
  }
`;

const IconWrapper = styled.div<SearchBarProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.iconColor || '#555'};
`;

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search items',
  width,
  height,
  border,
  borderRadius,
  backgroundColor,
  shadow = true,
  fontSize,
  color,
  inputPadding,
  placeholderColor,
  iconColor,
  iconSize = 20,
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
      />
      <IconWrapper iconColor={iconColor}>
        <SearchNormal1 size={iconSize} />
      </IconWrapper>
    </SearchContainer>
  );
};

export default SearchBar;
