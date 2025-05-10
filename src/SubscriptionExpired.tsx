// src/components/SubscriptionExpired.tsx
import styled from 'styled-components';
import { theme } from '@/theme/theme';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/api/auth/auth.slice';
import { persistor } from '@/redux/store';
import { useNavigate } from 'react-router-dom';

const ExpiredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${theme.colors.secondary};
  padding: 20px;
  text-align: center;
`;

const ExpiredMessage = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #FF3333;
  margin-bottom: 16px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 20px;
  }
`;

const InstructionText = styled.p`
  font-size: 16px;
  color: ${theme.colors.primaryFont};
  margin-bottom: 24px;
  max-width: 600px;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 14px;
  }
`;

const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.primaryFont};
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${theme.colors.active};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 14px;
    padding: 8px 16px;
  }
`;

const SubscriptionExpired: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        dispatch(logout());
        await persistor.purge();
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('subscription');
        navigate('/');
    };

    return (
        <ExpiredContainer>
            <ExpiredMessage>Subscription Has Expired</ExpiredMessage>
            <InstructionText>
                Your restaurant's subscription has expired, and access to the platform is restricted. Please contact your
                administrator to renew the subscription.
            </InstructionText>
            <LogoutButton onClick={handleLogout}>Log Out</LogoutButton>
        </ExpiredContainer>
    );
};

export default SubscriptionExpired;