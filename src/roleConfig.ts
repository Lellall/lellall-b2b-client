// src/roleConfig.ts
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
    // { to: '/reports', icon: Activity, text: 'Reports' },
    // { to: '/shops', icon: Link, text: 'Shops & Branches' },
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
  SUPERADMIN: [
    { to: '/admin', icon: Home, text: 'Admin Dashboard', end: true },
    { to: '/admin/operations', icon: Activity, text: 'Operations' },
  ],
};

export const isRouteAllowed = (role: string, path: string): boolean => {
  // Restrict /admin routes to SUPERADMIN only
  if (path.startsWith('/admin') && role !== 'SUPERADMIN') {
    return false;
  }

  // For SUPERADMIN, only allow /admin routes
  if (role === 'SUPERADMIN') {
    return path.startsWith('/admin');
  }

  // For non-SUPERADMIN roles, check allowed routes
  const allowedRoutes = navItemsByRole[role] || navItemsByRole['WAITER'];
  return allowedRoutes.some((item) => {
    const baseRoute = item.to.split('/')[1];
    const basePath = path.split('/')[1];
    return path === item.to || (baseRoute === basePath && path.startsWith(item.to));
  });
};