import React from 'react';
import styled from 'styled-components';
import { ArrowRight2, Box1, Warning2 } from 'iconsax-react';

// Styled component for the container
const WarningContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 3px solid red;
`;

// Styled component for the icon wrapper
const IconWrapper = styled.div`
  width: 30px;
  height: 30px;
  background-color: #ff4d4d; // Pink color
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

// Styled component for the text
const WarningText = styled.span`
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

// Main component
const LowInventoryWarning = ({ navigation }) => {
    return (
        <WarningContainer>
            <div className="flex">
                <IconWrapper>
                    <Warning2 size="17" color="#fff" />
                </IconWrapper>
                <WarningText className='mt-1'>
                    <b><i>  Low Inventory Stock Warning: </i></b> <i>Please visit your inventory to restock the low products thanks.</i>
                </WarningText>
            </div>
            <div className='flex cursor-pointer' onClick={() => navigation('/inventory?tab=tab-8')}>
                <div className='mt-[0.9px] mr-1'> <Box1 size="14" color="#333" /></div>
                <div className='text-[#333] text-xs font-light'>Inventory</div>
                <div className='mt-[1px] ml-1' >
                    <ArrowRight2 size="14" color="#333" />
                </div>
            </div>
        </WarningContainer>
    );
};

export default LowInventoryWarning;