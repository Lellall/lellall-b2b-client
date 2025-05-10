import { Element2, Setting, Home, ArchiveBox, Calendar2, UserSearch, Activity, MoneyChange } from 'iconsax-react';

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
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/settings', icon: Setting, text: 'Settings' },
  ],
  SUPER_ADMIN: [
    { to: '/', icon: Home, text: 'Operations', end: true },
    { to: '/operations', icon: Activity, text: 'Operations' },
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
  if (path.startsWith('/admin') || path.startsWith('/operations')) {
    return role === 'SUPER_ADMIN';
  }

  if (path === '/verify-payment') {
    return true;
  }

  const allowedRoutes = getNavItemsByRole(role, daysLeft, planName);

  if (daysLeft === 0 && path === '/expired' && role !== 'SUPER_ADMIN') {
    return allowedRoutes.some((item) => item.to === '/expired');
  }

  return allowedRoutes.some((item) => {
    const baseRoute = item.to.split('/')[1] || item.to;
    const basePath = path.split('/')[1] || path;
    return path === item.to || (baseRoute === basePath && path.startsWith(item.to));
  });
};