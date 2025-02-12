import { More } from 'iconsax-react';
import React from 'react';
import styled from 'styled-components';

interface CardProps {
  imageSrc: string;
  title: string;
  actionDotColor?: string;
  className?: string;
  onClick: () => void;
}

const StyledCard = styled.div`
  min-width: 300px; /* Adjust the size as needed */
  max-height: 250px; /* Adjust the size as needed */
  border-radius: 8px;
  background-color: white;
  box-shadow: 5px 5px 80px rgba(0, 0, 0, 0.1);
  padding: 16px;
  transition: transform 0.2s ease-in-out; /* Smooth transition for scaling effect */
  &:hover {
    transform: scale(0.98); /* Shrinks the card slightly */
    cursor: pointer;
  }
    
`;

const StyledImage = styled.img`
  display: block;
  margin: 0 auto;
  width: 60%; /* Centers the image and sets it to 80% width */
  border-radius: 8px;
`;

const Card: React.FC<CardProps> = ({ imageSrc, title, actionDotColor = 'bg-black', className = '', onClick }) => {
  return (
    <div onClick={onClick}>
      <StyledCard className={className}>
        <div className="relative flex flex-col">
          <StyledImage src={imageSrc} alt={title} />
        </div>
      </StyledCard>
      <div className="mt-1 w-[350px] px-1 flex justify-between">
        <div className='text-xs'>{title}</div>
        <div className='mr-1'><More size="20px" color="#000" /></div>
      </div>
    </div>
  );
};

export default Card;
