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
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Calculate days left for subscription (non-SUPER_ADMIN only)
  // Based on endDate only, regardless of status
  const calculateDaysLeft = (subscription: any): number => {
    if (!subscription) return 0;
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

  const currentSubscription = isSuperAdmin
    ? null
    : user?.ownedRestaurant?.subscription || user?.restaurant?.subscription || subscription;
  const daysLeft = isSuperAdmin ? Infinity : calculateDaysLeft(currentSubscription);
  const planName = isSuperAdmin ? 'Super Admin' : currentSubscription?.plan?.name;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const currentPath = location.pathname;

  // Allow /verify-payment for payment verification (non-SUPER_ADMIN)
  if (currentPath === '/verify-payment' && !isSuperAdmin) {
    return <Outlet />;
  }

  // Block non-SUPER_ADMIN users from admin routes
  if (isAdminRoute && !isSuperAdmin) {
    return <LostScreen />;
  }

  // Restrict SUPER_ADMIN to admin routes only
  if (isSuperAdmin && !isAdminRoute && !currentPath.startsWith('/admin')) {
    return <Navigate to="/admin" replace />;
  }

  // Handle expired subscription for non-SUPER_ADMIN
  if (!isSuperAdmin && daysLeft === 0) {
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