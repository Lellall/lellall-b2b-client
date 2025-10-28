import React, { useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Logout } from 'iconsax-react';
import { toast } from 'react-toastify';
import Menu from '../../../../../assets/menu-collapse.svg';
import Logo from '../../../../../assets/Logo.svg';
import { theme } from '@/theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, logout } from '@/redux/api/auth/auth.slice';
import { persistor } from '@/redux/store';
import { RootState, AppDispatch } from '@/redux/store';
import { getNavItemsByRole, NavItemConfig } from '@/roleConfig';

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
      endDate: string | null;
    };
  };
  restaurant?: {
    subscription?: {
      status: string;
      plan: { name: string };
      trialEndDate: string | null;
      endDate: string | null;
    };
  };
}

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
}

interface LogoWrapperProps {
  isSidebarOpen: boolean;
}

interface TextProps {
  isSidebarOpen: boolean;
}

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isMobile', 'isSidebarOpen'].includes(prop),
})<SidebarProps>`
  width: ${(props) => (props.isMobile ? (props.isSidebarOpen ? '250px' : '0') : props.isSidebarOpen ? '250px' : '80px')};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.primaryFont};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, transform 0.3s ease;
  overflow-y: auto;
  z-index: ${(props) => (props.isMobile ? (props.isSidebarOpen ? '1000' : '0') : '1')};
  position: ${(props) => (props.isMobile ? 'fixed' : 'relative')};
  top: 0;
  left: 0;
  min-height: 100vh;
  transform: ${(props) => (props.isMobile && !props.isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)')};
  box-shadow: ${(props) => (props.isMobile && props.isSidebarOpen ? '2px 0 8px rgba(0, 0, 0, 0.2)' : 'none')};

  scrollbar-width: thin;
  scrollbar-color: ${(props) => `${props.theme.colors.active} ${props.theme.colors.primary}`};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.primary};
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.active};
    border-radius: 4px;
  }
`;

const Backdrop = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const LogoWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isSidebarOpen'].includes(prop),
})<LogoWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.isSidebarOpen ? 'flex-start' : 'center')};
  padding: 20px;

  img {
    width: ${(props) => (props.isSidebarOpen ? '80px' : '50px')};
    height: auto;
    transition: width 0.3s ease;
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 15px;
    img {
      width: ${(props) => (props.isSidebarOpen ? '70px' : '40px')};
    }
  }
`;

const Header = styled.header`
  height: 60px;
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.primaryFont};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Content = styled.main`
  flex: 1;
  background-color: ${(props) => props.theme.colors.secondary};
  padding: 20px;
  overflow-y: auto;
  width: 100%;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primaryFont};
  font-size: 20px;
  cursor: pointer;
  padding: 10px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  text-decoration: none;
  color: ${(props) => props.theme.colors.active};
  font-weight: 500;

  &.active {
    background-color: ${(props) => props.theme.colors.active};
    color: ${(props) => props.theme.colors.secondary};
    border-radius: 8px;
  }

  &:hover {
    color: ${(props) => props.theme.colors.hoverFont};
    border-radius: 8px;
  }
`;

const Icon = styled.div`
  font-size: 20px;
  display: flex;
  align-items: center;
`;

const Text = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isSidebarOpen'].includes(prop),
})<TextProps>`
  font-size: 14px;
  font-weight: 400;
  display: ${(props) => (props.isSidebarOpen ? 'inline' : 'none')};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  text-decoration: none;
  color: ${(props) => props.theme.colors.active};
  font-weight: 300;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;

  &:hover {
    color: ${(props) => props.theme.colors.hoverFont};
    border-radius: 8px;
  }
`;

const UserInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-left: auto;
`;

const SubscriptionCircle = styled.div<{ status: string }>`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: ${({ status }) =>
    status === 'TRIAL' ? '#FFA500' : status === 'ACTIVE' ? '#00CC00' : status === 'EXPIRED' ? '#FF3333' : '#808080'};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${({ status }) =>
      status === 'TRIAL'
        ? 'rgba(255, 165, 0, 0.5)'
        : status === 'ACTIVE'
        ? 'rgba(0, 204, 0, 0.5)'
        : status === 'EXPIRED'
        ? 'rgba(255, 51, 51, 0.5)'
        : 'rgba(128, 128, 128, 0.5)'};
    z-index: -1;
  }
`;

const SubscriptionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${(props) => props.theme.colors.primaryFont};
`;

const TrialNotice = styled.span`
  font-size: 12px;
  color: #ffa500;
  font-weight: 500;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.primaryFont};
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
`;

interface LayoutProps {
  subdomainData: any;
}

const Layout: React.FC<LayoutProps> = ({ subdomainData }) => {
  const isMobile = useMediaQuery({ query: `(max-width: ${theme.breakpoints.mobile})` });
  const [isSidebarOpen, setSidebarOpen] = React.useState(!isMobile);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, subscription } = useSelector(selectAuth);

  useEffect(() => {
    console.log('Redux user:', user);
    console.log('Redux subscription:', subscription);
  }, [user, subscription]);

  const calculateDaysLeft = (subscription: any): number => {
    if (!subscription) return 0;

    // Based on endDate only, regardless of status
    const { trialEndDate, endDate } = subscription;
    let relevantDate: string | null = null;

    // Prioritize endDate, fallback to trialEndDate
    if (endDate) {
      relevantDate = endDate;
    } else if (trialEndDate) {
      relevantDate = trialEndDate;
    }

    if (!relevantDate) return 0;

    const today = new Date();
    const end = new Date(relevantDate);
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

  const closeSidebar = () => {
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (!isAuthenticated || !user) {
    navigate('/');
    return null;
  }

  const userRole = user.role || 'WAITER';
  const currentSubscription = user?.ownedRestaurant?.subscription || user?.restaurant?.subscription || subscription;
  const daysLeft = calculateDaysLeft(currentSubscription);
  // Determine status based on endDate, not the subscription status field
  const getStatusForDisplay = (subscription: any): string => {
    if (!subscription) return 'EXPIRED';
    const hasValidEndDate = subscription.endDate && new Date(subscription.endDate) > new Date();
    const hasValidTrialDate = subscription.trialEndDate && new Date(subscription.trialEndDate) > new Date();
    if (hasValidEndDate || hasValidTrialDate) return 'ACTIVE';
    return 'EXPIRED';
  };
  const status = getStatusForDisplay(currentSubscription);
  const planName = currentSubscription?.plan?.name || 'No Plan';

  // Log for debugging
  useEffect(() => {
    console.log('currentSubscription:', currentSubscription);
    console.log('daysLeft:', daysLeft);
    console.log('userRole:', userRole);
    console.log('planName:', planName);
    console.log('location.pathname:', location.pathname);
  }, [currentSubscription, daysLeft, userRole, planName, location.pathname]);

  // Get navigation items based on role, subscription status, and plan
  const allowedNavItems = getNavItemsByRole(userRole, daysLeft, planName);

  // Redirect to /expired or /subscriptions if subscription is expired, but allow /verify-payment
  useEffect(() => {
    if (daysLeft === 0 && allowedNavItems.length > 0 && location.pathname !== '/verify-payment') {
      const targetRoute = allowedNavItems[0]?.to; // Either /expired or /subscriptions
      if (location.pathname !== targetRoute) {
        console.log('Redirecting to:', targetRoute);
        const message =
          targetRoute === '/expired'
            ? 'Subscription has expired. Please contact your administrator.'
            : 'Subscription has expired. Redirecting to subscriptions.';
        toast.warn(message);
        navigate(targetRoute, { replace: true });
      }
    }
  }, [daysLeft, allowedNavItems, location.pathname, navigate]);

  const fixed = allowedNavItems.filter((item) => item.icon !== null || (item.text && item.text.trim() !== ''));

  return (
    <ThemeProvider theme={theme}>
      <LayoutWrapper>
        {isMobile && <Backdrop isOpen={isSidebarOpen} onClick={closeSidebar} />}
        <Sidebar isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
          <LogoWrapper isSidebarOpen={isSidebarOpen}>
            <img src={Logo} alt="Logo" />
          </LogoWrapper>
          {isMobile && isSidebarOpen && (
            <CloseButton onClick={closeSidebar} aria-label="Close sidebar">
              <Icon>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Icon>
            </CloseButton>
          )}
          <nav className="mt-10 mx-3" style={{ flex: 1 }}>
            {fixed.map((item) => (
              <NavItem key={item.to} to={item.to} end={item.end} onClick={closeSidebar}>
                {item.icon && (
                  <Icon>
                    <item.icon size={16} />
                  </Icon>
                )}
                <Text isSidebarOpen={isSidebarOpen}>{item.text}</Text>
              </NavItem>
            ))}
            <LogoutButton onClick={handleLogout}>
              <Icon>
                <Logout size={16} />
              </Icon>
              <Text isSidebarOpen={isSidebarOpen}>Logout</Text>
            </LogoutButton>
          </nav>
        </Sidebar>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Header>
            <ToggleButton onClick={toggleSidebar}>
              <Icon style={{ width: '30px', height: '30px' }}>
                <img src={Menu} alt="Menu" />
              </Icon>
            </ToggleButton>
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