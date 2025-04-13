// src/lost-screen/lost-screen.tsx
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Lock } from 'iconsax-react'; // Using an icon from iconsax-react for a lock symbol
import { useNavigate } from 'react-router-dom';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LostWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%);
  text-align: center;
  padding: 20px;
`;

const IconWrapper = styled.div`
  margin-bottom: 30px;
  animation: ${fadeIn} 0.5s ease-in-out;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 400;
  color: #dc3545; /* Red for emphasis */
  margin-bottom: 15px;
  animation: ${fadeIn} 0.6s ease-in-out;
`;

const Message = styled.p`
  font-size: 17px;
  color: #495057;
  max-width: 100px;
  line-height: 1.5;
  margin-bottom: 40px;
  animation: ${fadeIn} 0.7s ease-in-out;
  min-width: 400px;
`;

const BackButton = styled.button`
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(90deg, green 0%, orange 100%);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.8s ease-in-out;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LostScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/'); // Redirect to home or a safe route
  };

  return (
    <LostWrapper>
      <IconWrapper>
        <Lock size={80} color="#dc3545" variant="Bold" />
      </IconWrapper>
      <Title>Access Denied</Title>
      <Message>
        Sorry, it looks like you don’t have permission to view this page. Let’s
        get you back to where you belong!
      </Message>
      <BackButton onClick={handleGoBack}>Return Home</BackButton>
    </LostWrapper>
  );
};

export default LostScreen;