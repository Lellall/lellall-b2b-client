import React from 'react';
import styled from 'styled-components';
import { User } from 'iconsax-react';

const Container = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 24px;
`;

const Header = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleText = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const ViewAllButton = styled.button`
  background: transparent;
  border: none;
  color: #05431E;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #E5E7EB;
`;

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #F3F4F6;
  vertical-align: middle;
`;

const MemberInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
`;

const MemberName = styled.div`
  font-weight: 500;
  color: #111827;
`;

const TierBadge = styled.span<{ tier: 'Black' | 'Gold' | 'Silver' }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  ${(props) => {
    switch (props.tier) {
      case 'Black':
        return `
          background: #111827;
          color: #F9FAFB;
        `;
      case 'Gold':
        return `
          background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
          color: #78350F;
        `;
      case 'Silver':
        return `
          background: linear-gradient(135deg, #F3F4F6 0%, #D1D5DB 100%);
          color: #374151;
        `;
      default:
        return ``;
    }
  }}
`;

const activities = [
  {
    id: 1,
    name: 'Chief Tunde M.',
    tier: 'Black' as const,
    action: 'Retrieved 2x Dom Perignon',
    time: '10 mins ago',
  },
  {
    id: 2,
    name: 'Sarah O.',
    tier: 'Gold' as const,
    action: 'Reservation Check-in (VIP Table 4)',
    time: '25 mins ago',
  },
  {
    id: 3,
    name: 'Dr. Ahmed K.',
    tier: 'Silver' as const,
    action: 'Membership Renewed (Annual)',
    time: '1 hour ago',
  },
  {
    id: 4,
    name: 'Jane Smith',
    tier: 'Gold' as const,
    action: 'Walk-in (+3 guests)',
    time: '2 hours ago',
  },
];

const ActivityTable: React.FC = () => {
  return (
    <Container>
      <Header>
        <TitleText>Recent Premium Activity</TitleText>
        <ViewAllButton>View All</ViewAllButton>
      </Header>
      
      <Table>
        <thead>
          <tr>
            <Th>Member</Th>
            <Th>Tier</Th>
            <Th>Action</Th>
            <Th>Time</Th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <Td>
                <MemberInfo>
                  <Avatar>
                    <User size="16" />
                  </Avatar>
                  <MemberName>{activity.name}</MemberName>
                </MemberInfo>
              </Td>
              <Td>
                <TierBadge tier={activity.tier}>{activity.tier}</TierBadge>
              </Td>
              <Td>{activity.action}</Td>
              <Td style={{ color: '#6B7280' }}>{activity.time}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ActivityTable;
