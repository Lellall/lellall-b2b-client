import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import { isRouteAllowed, getNavItemsByRole } from '@/roleConfig';
import LostScreen from '@/lost-screen';

interface ProtectedRouteProps {
  isAdminRoute: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAdminRoute }) => {
  const { isAuthenticated, user, subscription } = useSelector(selectAuth);
  const location = useLocation();
  const userRole = user?.role || 'WAITER';

  // Calculate days left for subscription
  const calculateDaysLeft = (subscription: any): number => {
    if (!subscription) return 0;
    const { status, trialEndDate, endDate } = subscription;
    let relevantDate: string | null = null;
    if (status === 'ACTIVE' && endDate) {
      relevantDate = endDate;
    } else if (status === 'TRIAL' && trialEndDate) {
      relevantDate = trialEndDate;
    }
    if (!relevantDate) return 0;
    const today = new Date();
    const end = new Date(relevantDate);
    if (isNaN(end.getTime())) return 0;
    const diffTime = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const currentSubscription = user?.ownedRestaurant?.subscription || user?.restaurant?.subscription || subscription;
  const daysLeft = calculateDaysLeft(currentSubscription);
  const planName = currentSubscription?.plan?.name;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const currentPath = location.pathname;

  // Allow /verify-payment for payment verification
  if (currentPath === '/verify-payment') {
    return <Outlet />;
  }

  // Explicitly block non-SUPER_ADMIN users from admin routes
  if (isAdminRoute && userRole !== 'SUPER_ADMIN') {
    return <LostScreen />;
  }

  // Allow SUPER_ADMIN to access only admin routes
  if (userRole === 'SUPER_ADMIN' && !isAdminRoute && !currentPath.startsWith('/admin')) {
    return <LostScreen />;
  }

  // Handle expired subscription
  if (daysLeft === 0) {
    const allowedRoutes = getNavItemsByRole(userRole, daysLeft, planName);
    const targetRoute = allowedRoutes[0]?.to; // Either /expired or /subscriptions
    if (currentPath !== targetRoute) {
      const message =
        targetRoute === '/expired'
          ? 'Subscription has expired. Please contact your administrator.'
          : 'Subscription has expired. Redirecting to subscriptions.';
      toast.warn(message);
      return <Navigate to={targetRoute} replace />;
    }
    return <Outlet />;
  }

  // Redirect WAITER to /settings if trying to access the root route (/)
  if (userRole === 'WAITER' && currentPath === '/' && daysLeft > 0) {
    return <Navigate to="/settings" replace />;
  }

  // Check if the current route is allowed for the user's role and plan
  if (!isRouteAllowed(userRole, currentPath, daysLeft, planName)) {
    if (userRole === 'WAITER' && daysLeft > 0) {
      return <Navigate to="/settings" replace />;
    }
    return <LostScreen />;
  }

  return <Outlet />;
};

export default ProtectedRoute;