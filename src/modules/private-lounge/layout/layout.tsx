import React, { useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Logout } from 'iconsax-react';
import { toast } from 'react-toastify';
import Menu from '../../../../assets/menu-collapse.svg';
import Logo from '../../../../assets/Logo.svg';
import { theme } from '@/theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, logout } from '@/redux/api/auth/auth.slice';
import { persistor } from '@/redux/store';
import { AppDispatch } from '@/redux/store';
import { navItemsByRole } from '@/roleConfig';

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
}) <SidebarProps>`
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
}) <LogoWrapperProps>`
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
}) <TextProps>`
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
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;

  &:hover {
    color: ${(props) => props.theme.colors.hoverFont};
    border-radius: 8px;
  }
`;

const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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

const LoungeLayout: React.FC = () => {
  // Mobile: < 768px — sidebar is a full overlay
  const isMobile = useMediaQuery({ query: `(max-width: 767px)` });
  // Tablet: 768px–1023px — sidebar collapses to icons-only automatically
  const isTablet = useMediaQuery({ query: `(min-width: 768px) and (max-width: 1023px)` });

  // On desktop open; on tablet or mobile start collapsed
  const [isSidebarOpen, setSidebarOpen] = React.useState(!isMobile && !isTablet);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(selectAuth);

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
    if (isMobile) {
      // On phone: collapse and use overlay mode
      setSidebarOpen(false);
    } else if (isTablet) {
      // On tablet: collapse to icon-only (no overlay)
      setSidebarOpen(false);
    } else {
      // On desktop: expand
      setSidebarOpen(true);
    }
  }, [isMobile, isTablet]);

  if (!isAuthenticated || !user) {
    navigate('/');
    return null;
  }

  // Sidebar as overlay only on true mobile, not tablet
  const sidebarIsOverlay = isMobile;

  const navItems = navItemsByRole['PRIVATE_LOUNGE_ADMIN'] || [];

  return (
    <ThemeProvider theme={theme}>
      <LayoutWrapper>
        {sidebarIsOverlay && <Backdrop isOpen={isSidebarOpen} onClick={closeSidebar} />}
        <Sidebar isMobile={sidebarIsOverlay} isSidebarOpen={isSidebarOpen}>
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
            {navItems.map((item) => (
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
              <span style={{ fontWeight: '500' }}>{user.firstName} {user.lastName}</span>
              <span style={{ fontSize: '12px', color: theme.colors.primaryFont }}>Lounge Admin</span>
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

export default LoungeLayout;
