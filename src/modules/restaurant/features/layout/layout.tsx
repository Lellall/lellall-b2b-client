import React, { useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Logout } from 'iconsax-react';
import Menu from '../../../../../assets/menu-collapse.svg';
import Logo from '../../../../../assets/Logo.svg';
import { theme } from '@/theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, logout } from '@/redux/api/auth/auth.slice';
import { persistor } from '@/redux/store';
import { RootState, AppDispatch } from '@/redux/store';
import { navItemsByRole, NavItemConfig } from '@/roleConfig';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  ownedRestaurant?: {
    subscription?: {
      status: string;
      plan: { name: string };
      trialEndDate: string | null;
    };
  };
}

interface SidebarProps { isMobile: boolean; isSidebarOpen: boolean; }
interface LogoWrapperProps { isSidebarOpen: boolean; }
interface TextProps { isSidebarOpen: boolean; }

const LayoutWrapper = styled.div`display: flex; height: 100vh; overflow: hidden;`;
const Sidebar = styled.div<SidebarProps>`width: ${(props) => (props.isMobile ? (props.isSidebarOpen ? '250px' : '0') : props.isSidebarOpen ? '250px' : '80px')}; background-color: ${(props) => props.theme.colors.primary}; color: ${(props) => props.theme.colors.primaryFont}; display: flex; flex-direction: column; transition: width 0.3s ease; overflow-y: auto; position: relative;`;
const LogoWrapper = styled.div<LogoWrapperProps>`display: flex; align-items: ${(props) => (props.isSidebarOpen ? 'left' : 'center')}; justify-content: ${(props) => (props.isSidebarOpen ? 'left' : 'left')}; img { width: ${(props) => (props.isSidebarOpen ? '80px' : '50px')}; height: auto; transition: width 0.3s ease; margin-left: 20px; margin-top: ${(props) => (props.isSidebarOpen ? '0' : '15px')}; }`;
const Header = styled.header`height: 60px; background-color: ${(props) => props.theme.colors.primary}; color: ${(props) => props.theme.colors.primaryFont}; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; position: sticky; top: 0; z-index: 10;`;
const Content = styled.main`flex: 1; background-color: ${(props) => props.theme.colors.secondary}; padding: 20px; overflow-y: auto;`;
const ToggleButton = styled.button`background: none; position: absolute; left: -10px; top: -25px; border: none; color: ${(props) => props.theme.colors.primaryFont}; font-size: 20px; cursor: pointer; margin: 10px;`;
const NavItem = styled(NavLink)`display: flex; align-items: center; gap: 10px; padding: 10px 20px; text-decoration: none; color: ${(props) => props.theme.colors.active}; font-weight: 500; &.active { background-color: ${(props) => props.theme.colors.active}; color: ${(props) => props.theme.colors.secondary}; border-radius: 8px; } &:hover { color: ${(props) => props.theme.colors.hoverFont}; border-radius: 8px; }`;
const Icon = styled.div`font-size: 20px;`;
const Text = styled.span<TextProps>`font-size: 14px; font-weight: 400; display: ${(props) => (props.isSidebarOpen ? 'inline' : 'none')};`;
const LogoutButton = styled.button`display: flex; align-items: center; gap: 10px; padding: 10px 20px; text-decoration: none; color: ${(props) => props.theme.colors.active}; font-weight: 300; background: none; border: none; width: 100%; text-align: left; cursor: pointer; &:hover { color: ${(props) => props.theme.colors.hoverFont}; border-radius: 8px; }`;
const UserInfoWrapper = styled.div`display: flex; align-items: center; gap: 15px; margin-left: auto;`;
const SubscriptionCircle = styled.div<{ status: string }>`width: 15px; height: 15px; border-radius: 50%; background-color: ${({ status }) => (status === 'TRIAL' ? '#FFA500' : status === 'ACTIVE' ? '#00CC00' : status === 'EXPIRED' ? '#FF3333' : '#808080')}; position: relative; &::before { content: ''; position: absolute; top: 1px; right: 3px; width: 24px; height: 24px; border-radius: 50%; background-color: ${({ status }) => (status === 'TRIAL' ? 'rgba(255, 165, 0, 0.5)' : status === 'ACTIVE' ? 'rgba(0, 204, 0, 0.5)' : status === 'EXPIRED' ? 'rgba(255, 51, 51, 0.5)' : 'rgba(128, 128, 128, 0.5)')}; z-index: -1; }`;
const SubscriptionInfo = styled.div`display: flex; align-items: center; gap: 8px; font-size: 14px; color: ${(props) => props.theme.colors.primaryFont};`;
const TrialNotice = styled.span`font-size: 12px; color: #FFA500; font-weight: 500;`;

interface LayoutProps {
  subdomainData: any;
}

const Layout: React.FC<LayoutProps> = ({ subdomainData }) => {
  const isMobile = useMediaQuery({ query: `(max-width: ${theme.breakpoints.mobile})` });
  const [isSidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, user, subscription } = useSelector(selectAuth);

  useEffect(() => {
    console.log('Redux user:', user);
    console.log('Redux subscription:', subscription);
  }, [user, subscription]);

  const calculateDaysLeft = (endDate: string | null): number => {
    if (!endDate) return 0;
    const today = new Date();
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleLogout = async () => {
    dispatch(logout());
    await persistor.purge();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
    navigate('/');
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (!isAuthenticated || !user) {
    navigate('/');
    return null;
  }

  const userRole = user.role || 'WAITER';
  const allowedNavItems = navItemsByRole[userRole] || navItemsByRole['WAITER'];
  const fixed = allowedNavItems.filter(item =>
    item.icon !== null || (item.text && item.text.trim() !== '')
  );

  // Use subscription from user.ownedRestaurant or top-level subscription as fallback
  const currentSubscription = user?.ownedRestaurant?.subscription || subscription;
  const daysLeft = currentSubscription?.trialEndDate
    ? calculateDaysLeft(currentSubscription.trialEndDate)
    : currentSubscription?.endDate
    ? calculateDaysLeft(currentSubscription.endDate)
    : 0;
  const status = currentSubscription?.status || 'UNKNOWN';
  const planName = currentSubscription?.plan?.name || 'No Plan';

  return (
    <ThemeProvider theme={theme}>
      <LayoutWrapper>
        <Sidebar isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
          <LogoWrapper isSidebarOpen={isSidebarOpen}>
            <img src={Logo} alt="Logo" />
          </LogoWrapper>
          <nav className="mt-10 mx-3">
            {fixed.map((item) => (
              <NavItem key={item.to} to={item.to} end={item.end}>
                <Icon><item.icon size={16} /></Icon>
                <Text isSidebarOpen={isSidebarOpen}>{item.text}</Text>
              </NavItem>
            ))}
            <LogoutButton onClick={handleLogout}>
              <Icon><Logout size={16} /></Icon>
              <Text isSidebarOpen={isSidebarOpen}>Logout</Text>
            </LogoutButton>
          </nav>
        </Sidebar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header>
            <div style={{ position: 'relative' }}>
              <ToggleButton onClick={toggleSidebar}>
                <Icon style={{ width: '30px', height: '30px' }}>
                  <img src={Menu} alt="Menu" />
                </Icon>
              </ToggleButton>
            </div>
            <UserInfoWrapper>
              <SubscriptionInfo>
                <SubscriptionCircle status={status} />
                {status !== 'TRIAL' && <span>{planName}</span>}
                {status === 'TRIAL' && <TrialNotice>Trial Account</TrialNotice>}
                <span>({daysLeft} days left)</span>
              </SubscriptionInfo>
            </UserInfoWrapper>
          </Header>
          <Content>
            <Outlet />
          </Content>
        </div>
      </LayoutWrapper>
    </ThemeProvider>
  );
};

export default Layout;