import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { isRouteAllowed } from '@/roleConfig';
import LostScreen from '@/lost-screen';

interface ProtectedRouteProps {
  isAdminRoute: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAdminRoute }) => {
  const { isAuthenticated, user } = useSelector(selectAuth);
  const location = useLocation();
  const userRole = user?.role || 'WAITER';

  if (!isAuthenticated) {
    return <LostScreen />; // Show LostScreen instead of redirecting
  }

  const currentPath = location.pathname;

  // Explicitly block non-SUPERADMIN users from admin routes
  if (isAdminRoute && userRole !== 'SUPERADMIN') {
    return <LostScreen />;
  }

  // Allow SUPERADMIN to access only admin routes
  if (userRole === 'SUPERADMIN' && !isAdminRoute && !currentPath.startsWith('/admin')) {
    return <LostScreen />;
  }

  // Check if the current route is allowed for the user's role
  if (!isRouteAllowed(userRole, currentPath)) {
    return <LostScreen />;
  }

  return <Outlet />;
};

export default ProtectedRoute;