import React from 'react';
import styled from 'styled-components';
import { ArrowRight2, Verify, BoxTick, ProfileAdd } from 'iconsax-react';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const TitleText = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
    border-color: #E5E7EB;
  }
`;

const IconBox = styled.div<{ bg: string; color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${(props) => props.bg};
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 2px 0;
`;

const ActionDesc = styled.p`
  font-size: 12px;
  color: #6B7280;
  margin: 0;
`;

const ArrowIcon = styled(ArrowRight2)`
  color: #9CA3AF;
  width: 16px;
  height: 16px;
`;

interface QuickActionsProps {
  pendingCount?: number;
}

const QuickActions: React.FC<QuickActionsProps> = ({ pendingCount = 0 }) => {
  return (
    <Container>
      <Header>
        <TitleText>Quick Actions</TitleText>
      </Header>
      
      <ActionsList>
        <ActionItem>
          <IconBox bg="rgba(16, 185, 129, 0.1)" color="#10B981">
            <Verify size="20" variant="Bold" />
          </IconBox>
          <ActionContent>
            <ActionTitle>Approve Memberships</ActionTitle>
            <ActionDesc>{pendingCount} {pendingCount === 1 ? 'application' : 'applications'} pending</ActionDesc>
          </ActionContent>
          <ArrowIcon />
        </ActionItem>

        <ActionItem>
          <IconBox bg="rgba(245, 158, 11, 0.1)" color="#F59E0B">
            <ProfileAdd size="20" variant="Bold" />
          </IconBox>
          <ActionContent>
            <ActionTitle>Check-in Walk-in</ActionTitle>
            <ActionDesc>Create new guest pass</ActionDesc>
          </ActionContent>
          <ArrowIcon />
        </ActionItem>

        <ActionItem>
          <IconBox bg="rgba(99, 102, 241, 0.1)" color="#6366F1">
            <BoxTick size="20" variant="Bold" />
          </IconBox>
          <ActionContent>
            <ActionTitle>Bottle Retrieval</ActionTitle>
            <ActionDesc>Log guest bottle access</ActionDesc>
          </ActionContent>
          <ArrowIcon />
        </ActionItem>
      </ActionsList>
    </Container>
  );
};

export default QuickActions;
