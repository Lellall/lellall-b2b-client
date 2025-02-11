import React from "react";
import styled from "styled-components";

type SwitchProps = {
  labelLeft?: string;
  labelRight?: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const SwitchContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
`;

const Slider = styled.span`
  width: 50px;
  height: 20px;
  background-color: #05431E;
  border-radius: 999px;
  position: relative;
  transition: background 0.3s;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    transition: transform 0.3s;
  }

  ${HiddenCheckbox}:checked + & {
    background-color: #05431E;
  }

  ${HiddenCheckbox}:checked + &::after {
    transform: translateX(30px);
  }
`;

const LellallSwitch: React.FC<SwitchProps> = ({ labelLeft, labelRight, checked, onChange }) => {
  return (
    <SwitchContainer>
      {labelLeft && <span className="text-gray-700">{labelLeft}</span>}
      <HiddenCheckbox checked={checked} onChange={onChange} />
      <Slider />
      {labelRight && <span className="text-gray-700">{labelRight}</span>}
    </SwitchContainer>
  );
};

export default LellallSwitch;