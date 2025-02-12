import { theme } from '@/theme/theme';
import { Eye, EyeSlash } from 'iconsax-react';
import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  position: relative;
`;

const Label = styled.label`
  font-size: 12px;
  color: #333;
  margin-bottom: 5px;
`;

const StyledInput = styled.input<{ width?: string; error?: boolean }>`
  padding: 20px;
  border: 1px solid ${props => props.error ? '#e74c3c' : '#E2E8F0'};
  border-radius: 15px;
  font-size: 12px;
  height: 50px;
  width: ${({ width }) => width || '100%'};
  &::placeholder {
    color: #A0AEC0;
    font-size: 12px;
  }
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#e74c3c' : '#ccc'};
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 10px;
  position: absolute;
  bottom: -15px;
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px; // Adjust based on your icon size
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  placeholder?: string;
  width?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, name, placeholder, type = 'text', width, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle the password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the type based on whether the password should be shown
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <InputContainer>
      <Label>{label}</Label>
      <StyledInput
        type={inputType}
        name={name}
        placeholder={placeholder}
        width={width}
        error={!!error}
        {...props}
      />
      {type === 'password' && (
        <TogglePassword onClick={togglePasswordVisibility}>
          {showPassword ? <div className='mt-6'>
            <Eye size="12" color={theme.colors.active} />
          </div> : <div className='mt-6'>
            <EyeSlash size="12" color={theme.colors.active} />
          </div>}
        </TogglePassword>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputContainer>
  );
};

export default Input;