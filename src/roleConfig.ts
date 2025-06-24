import { Home, UserSearch, Car, MessageQuestion, Setting, Element2, ArchiveBox, Calendar2, MoneyChange } from 'iconsax-react';

export interface NavItemConfig {
  to: string;
  icon?: React.ComponentType<{ size: number }>;
  text?: string;
  end?: boolean;
}

export const navItemsByRole: Record<string, NavItemConfig[]> = {
  WAITER: [
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
  ],
  ADMIN: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/subscriptions', icon: MoneyChange, text: 'Subscriptions' },
    { to: '/verify-payment', icon: null, text: '' },
  ],
  MANAGER: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/settings', icon: Setting, text: 'Settings' },
  ],
  SUPER_ADMIN: [
    { to: '/', icon: Home, text: 'Operations', end: true },
    { to: '/agents', icon: UserSearch, text: 'Agents' },
    { to: '/reports', icon: Car, text: 'Logistics' },
    { to: '/shops', icon: MessageQuestion, text: 'Customer Care' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/operations', icon: Home, text: 'Operations' }, // Static route for sidebar
  ],
};

const planFeatures: Record<string, string[]> = {
  'Basic Plan': ['Inventory Management', 'Menu Management'],
  'Standard Plan': ['Inventory Management', 'Menu Management', 'Reports'],
  'Business Plan': ['Inventory Management', 'Menu Management', 'Reports', 'Reservations'],
  'Premium Plan': [
    'Inventory Management',
    'Menu Management',
    'Reports',
    'Reservations',
    'Staff Management',
    'In App Chat',
    'Multi Branch Management',
  ],
};

const featureToRoutes: Record<string, string[]> = {
  'Inventory Management': ['/inventory'],
  'Menu Management': ['/menu'],
  'Reports': ['/reports'],
  'Reservations': ['/reservations'],
  'Staff Management': ['/staffs'],
  'In App Chat': [],
  'Multi Branch Management': [],
};

export const getNavItemsByRole = (role: string, daysLeft: number, planName: string | undefined): NavItemConfig[] => {
  const defaultRoutes = navItemsByRole[role] || navItemsByRole['WAITER'];

  // SUPER_ADMIN bypasses subscription checks
  if (role === 'SUPER_ADMIN') {
    return defaultRoutes;
  }

  if (daysLeft === 0) {
    const hasSubscriptionAccess = defaultRoutes.some((item) => item.to === '/subscriptions');
    if (hasSubscriptionAccess) {
      return [{ to: '/subscriptions', icon: MoneyChange, text: 'Subscriptions' }];
    } else {
      return [{ to: '/expired', icon: MoneyChange, text: 'Subscription Expired' }];
    }
  }

  if (!planName || !planFeatures[planName]) {
    return defaultRoutes;
  }

  const allowedFeatures = planFeatures[planName];
  const allowedRoutes = allowedFeatures
    .flatMap((feature) => featureToRoutes[feature] || [])
    .concat(['/settings', '/subscriptions', '/verify-payment', '/']);

  return defaultRoutes.filter((item) => allowedRoutes.includes(item.to));
};

export const isRouteAllowed = (
  role: string,
  path: string,
  daysLeft: number,
  planName: string | undefined
): boolean => {
  console.log('isRouteAllowed - role:', role, 'path:', path, 'daysLeft:', daysLeft);

  if (path.startsWith('/admin')) {
    if (role !== 'SUPER_ADMIN') {
      console.log('Blocked non-SUPER_ADMIN from:', path);
      return false;
    }
    // Allow all /admin/* routes for SUPER_ADMIN, including dynamic routes like /admin/operations/:id
    const allowedAdminRoutes = navItemsByRole['SUPER_ADMIN'].map((item) => item.to);
    const isAllowed = allowedAdminRoutes.some((route) => {
      const baseRoute = route.split('/').slice(0, 3).join('/'); // e.g., /admin/operations
      return path === route || path.startsWith(`${baseRoute}/`) || path === baseRoute;
    });
    console.log('SUPER_ADMIN route check - path:', path, 'allowed:', isAllowed);
    return isAllowed;
  }

  if (path === '/verify-payment' && role !== 'SUPER_ADMIN') {
    return true;
  }

  const allowedRoutes = getNavItemsByRole(role, daysLeft, planName);

  if (daysLeft === 0 && path === '/expired' && role !== 'SUPER_ADMIN') {
    return allowedRoutes.some((item) => item.to === '/expired');
  }

  const isAllowed = allowedRoutes.some((item) => {
    const baseRoute = item.to.split('/')[1] || item.to;
    const basePath = path.split('/')[1] || path;
    return path === item.to || (baseRoute === basePath && path.startsWith(item.to));
  });

  console.log('Non-admin route check - role:', role, 'path:', path, 'allowed:', isAllowed);
  return isAllowed;
};