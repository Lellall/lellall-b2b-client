import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #333;
  margin-bottom: 5px;
`;

const StyledInput = styled.input<{ width?: string }>`
  padding: 20px;
  border: 1px solid #E2E8F0;
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
    border-color: #ccc;
  }
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  width?: string;
}

const Input: React.FC<InputProps> = ({ label, placeholder, type = 'text', width, ...props }) => {
  return (
    <InputContainer>
      <Label>{label}</Label>
      <StyledInput type={type} placeholder={placeholder} width={width} {...props} />
    </InputContainer>
  );
};

export default Input;
