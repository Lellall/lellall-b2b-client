import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, Alarm, ArchiveBox, ArrowForwardSquare, BackSquare, Calendar2, MoneyChange, Element2, Home, Link, Setting, User, UserSearch, Car, MessageQuestion } from 'iconsax-react';
// import Logo from '@/assets/Logo.svg';
import Menu from '../.././../../../assets/menu-collapse.svg';
import { theme } from '@/theme/theme';
import Logo from '../../../../../assets/Logo.svg'

const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.div`
  width: ${(props) =>
        props.isMobile
            ? props.isSidebarOpen
                ? '250px'
                : '0'
            : props.isSidebarOpen
                ? '250px'
                : '80px'};
  background-color: ${(props) => props.theme.colors.primary};
  color: ${(props) => props.theme.colors.primaryFont};
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow-y: auto;
  position: relative;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: ${(props) => (props.isSidebarOpen ? 'left' : 'center')};
  justify-content: ${(props) => (props.isSidebarOpen ? 'left' : 'left')};
  img {
    width: ${(props) => (props.isSidebarOpen ? '80px' : '50px')};
    height: auto;
    transition: width 0.3s ease;
    margin-left: 20px;
    margin-top: ${(props) => (props.isSidebarOpen ? '0' : '15px')};
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
`;

const ToggleButton = styled.button`
  background: none;
  position: absolute;
  left: -10px;
  top: -25px;
  border: none;
  color: ${(props) => props.theme.colors.primaryFont};
  font-size: 20px;
  cursor: pointer;
  margin: 10px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  text-decoration: none;
  color: ${(props) => props.theme.colors.active};
  font-weight: 300;
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
`;

const Text = styled.span`
  font-size: 14px;
  font-weigth: 100;
  display: ${(props) => (props.isSidebarOpen ? 'inline' : 'none')};
`;

const AdminLayout = () => {
    const isMobile = useMediaQuery({ query: `(max-width: ${theme.breakpoints.mobile})` });
    const [isSidebarOpen, setSidebarOpen] = React.useState(!isMobile);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    React.useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    return (
        <ThemeProvider theme={theme}>
            <LayoutWrapper>
                <Sidebar isMobile={isMobile} isSidebarOpen={isSidebarOpen}>
                    <LogoWrapper isSidebarOpen={isSidebarOpen}>
                        <img src={Logo} alt="Logo" />
                    </LogoWrapper>
                    <nav className="mt-10 mx-3">
                        <NavItem to="/operations" end>
                            <Icon>
                                <Home size={16} />
                            </Icon>
                            <Text isSidebarOpen={isSidebarOpen}>Operations</Text>
                        </NavItem>
                        <NavItem to="/agents">
                            <Icon>
                                <UserSearch size={16} />
                            </Icon>
                            <Text isSidebarOpen={isSidebarOpen}>Agents</Text>
                        </NavItem>
                        <NavItem to="/reports">
                            <Icon>
                                <Car size={16} />
                            </Icon>
                            <Text isSidebarOpen={isSidebarOpen}>Logistics</Text>
                        </NavItem>
                        <NavItem to="/shops">
                            <Icon>
                                <MessageQuestion size={16} />
                            </Icon>
                            <Text isSidebarOpen={isSidebarOpen}>Customer Care</Text>
                        </NavItem>
                        <NavItem to="/settings">
                            <Icon>
                                <Setting size={16} />
                            </Icon>
                            <Text isSidebarOpen={isSidebarOpen}>Settings</Text>
                        </NavItem>
                    </nav>
                </Sidebar>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Header>
                        <div style={{ position: 'relative' }}>
                            <ToggleButton onClick={toggleSidebar}>
                                {isSidebarOpen ? (
                                    <Icon style={{ width: '30px', height: '30px' }}>
                                        <img src={Menu} alt="" />
                                    </Icon>
                                ) : (
                                    <Icon style={{ width: '30px', height: '30px' }}>
                                        <img src={Menu} alt="" />
                                    </Icon>
                                )}
                            </ToggleButton>
                        </div>
                    </Header>
                    <Content>
                        <Outlet />
                    </Content>
                </div>
            </LayoutWrapper>
        </ThemeProvider>
    );
};

export default AdminLayout;
