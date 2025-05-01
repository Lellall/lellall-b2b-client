import { Element2, Setting, Home, ArchiveBox, Calendar2, UserSearch, Activity, Link, MoneyChange } from 'iconsax-react';

export interface NavItemConfig {
  to: string;
  icon?: React.ComponentType<{ size: number }>;
  text?: string;
  end?: boolean;
}

export const navItemsByRole: Record<string, NavItemConfig[]> = {
  WAITER: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
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
    { to: '/', icon: Home, text: 'Dashboard', end: true },
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

export const isRouteAllowed = (role: string, path: string): boolean => {
  // Restrict /admin and /operations routes to SUPER_ADMIN only
  if (path.startsWith('/admin') || path.startsWith('/operations')) {
    return role === 'SUPER_ADMIN';
  }

  // For SUPER_ADMIN, only allow admin routes
  if (role === 'SUPER_ADMIN') {
    const allowedRoutes = navItemsByRole['SUPER_ADMIN'];
    return allowedRoutes.some((item) => {
      const baseRoute = item.to.split('/')[1];
      const basePath = path.split('/')[1];
      return path === item.to || (baseRoute === basePath && path.startsWith(item.to));
    });
  }

  // For non-SUPER_ADMIN roles, check allowed routes
  const allowedRoutes = navItemsByRole[role] || navItemsByRole['WAITER'];
  return allowedRoutes.some((item) => {
    const baseRoute = item.to.split('/')[1];
    const basePath = path.split('/')[1];
    return path === item.to || (baseRoute === basePath && path.startsWith(item.to));
  });
};