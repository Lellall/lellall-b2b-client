import { Home, UserSearch, Car, MessageQuestion, Setting, Element2, ArchiveBox, Calendar2, MoneyChange, TrendUp, DocumentText } from 'iconsax-react';
import { MessageSquare } from 'lucide-react';

export interface NavItemConfig {
  to: string;
  icon?: React.ComponentType<{ size: number }>;
  text?: string;
  end?: boolean;
}

export const navItemsByRole: Record<string, NavItemConfig[]> = {
  WAITER: [
    // { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  CASHIER: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  STORE_KEEPER: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  ADMIN: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/insights', icon: TrendUp, text: 'Insights & AI' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/attendance', icon: DocumentText, text: 'Attendance' },
    { to: '/whatsapp-messages', icon: MessageSquare, text: 'WhatsApp Messages' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/subscriptions', icon: MoneyChange, text: 'Subscriptions' },
    { to: '/verify-payment', icon: null, text: '' },
    { to: '/shops', icon: MessageQuestion, text: 'shops' },
    { to: '/branches', icon: null, text: '' },
    { to: '/branches/:branchId', icon: null, text: '' }
  ],
  MANAGER: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    // { to: '/insights', icon: TrendUp, text: 'Insights & AI' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/attendance', icon: DocumentText, text: 'Attendance' },
    { to: '/whatsapp-messages', icon: MessageSquare, text: 'WhatsApp Messages' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
    { to: '/subscriptions', icon: MoneyChange, text: 'Subscriptions' },
    { to: '/verify-payment', icon: null, text: '' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    // { to: '/branches', icon: null, text: '' },
    // { to: '/branches/:branchId', icon: null, text: '' }
  ],
  SUPER_ADMIN: [
    { to: '/', icon: Home, text: 'Operations', end: true },
    { to: '/agents', icon: UserSearch, text: 'Agents' },
    { to: '/reports', icon: Car, text: 'Logistics' },
    { to: '/shops', icon: MessageQuestion, text: 'Customer Care' },
    { to: '/subscriptions', icon: MoneyChange, text: 'Subscriptions' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/operations', icon: Home, text: 'Operations' }, // Static route for sidebar
    { to: '/branches', icon: null, text: '' },
    { to: '/branches/:branchId', icon: null, text: '' }
  ],
  HUMAN_RESOURCE: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/attendance', icon: DocumentText, text: 'Attendance' },
    { to: '/staffs', icon: UserSearch, text: 'All Employees' },
    { to: '/salary', icon: DocumentText, text: 'Salary Management' },
    { to: '/payroll', icon: MoneyChange, text: 'Payroll' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
    { to: '/departments', icon: ArchiveBox, text: 'All Departments' },
    { to: '/shops', icon: MessageQuestion, text: 'Shops' },
    { to: '/settings', icon: Setting, text: 'Settings' },
  ],
  // Default navigation for staff roles (CHEF, BARTENDER, HOST, KITCHEN_STAFF, ACCOUNTANT)
  CHEF: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  BARTENDER: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  HOST: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  KITCHEN_STAFF: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/settings', icon: Setting, text: 'Settings' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
  ],
  ACCOUNTANT: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu-items', icon: Element2, text: 'Menu' },
    { to: '/menu', icon: TrendUp, text: 'Menu Analysis' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/salary', icon: DocumentText, text: 'Salary Management' },
    { to: '/payroll', icon: MoneyChange, text: 'Payroll' },
    { to: '/vendor-invoices', icon: DocumentText, text: 'Vendor Invoices' },
    { to: '/whatsapp-messages', icon: MessageSquare, text: 'WhatsApp Messages' },
    { to: '/insights', icon: TrendUp, text: 'Insights & AI' },
    { to: '/shops', icon: MessageQuestion, text: 'Shops' },
    // { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
    { to: '/settings', icon: Setting, text: 'Settings' },
  ],
  COO: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/menu-items', icon: Element2, text: 'Menu Items' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/insights', icon: TrendUp, text: 'Insights & AI' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/attendance', icon: DocumentText, text: 'Attendance' },
    { to: '/salary', icon: DocumentText, text: 'Salary Management' },
    { to: '/payroll', icon: MoneyChange, text: 'Payroll' },
    { to: '/vendor-invoices', icon: DocumentText, text: 'Vendor Invoices' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
    { to: '/departments', icon: ArchiveBox, text: 'All Departments' },
    { to: '/shops', icon: MessageQuestion, text: 'Shops' },
    { to: '/settings', icon: Setting, text: 'Settings' },
  ],
  AUDITOR: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/menu-items', icon: Element2, text: 'Menu Items' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/insights', icon: TrendUp, text: 'Insights & AI' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/attendance', icon: DocumentText, text: 'Attendance' },
    { to: '/salary', icon: DocumentText, text: 'Salary Management' },
    { to: '/payroll', icon: MoneyChange, text: 'Payroll' },
    { to: '/vendor-invoices', icon: DocumentText, text: 'Vendor Invoices' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
    { to: '/departments', icon: ArchiveBox, text: 'All Departments' },
    { to: '/shops', icon: MessageQuestion, text: 'Shops' },
    { to: '/settings', icon: Setting, text: 'Settings' },
  ],
  SUPERVISOR: [
    { to: '/', icon: Home, text: 'Dashboard', end: true },
    { to: '/menu', icon: Element2, text: 'Menu' },
    { to: '/menu-items', icon: Element2, text: 'Menu Items' },
    { to: '/inventory', icon: ArchiveBox, text: 'Inventory & Stock' },
    { to: '/insights', icon: TrendUp, text: 'Insights & AI' },
    { to: '/reservations', icon: Calendar2, text: 'Reservations' },
    { to: '/staffs', icon: UserSearch, text: 'Staffs' },
    { to: '/attendance', icon: DocumentText, text: 'Attendance' },
    { to: '/salary', icon: DocumentText, text: 'Salary Management' },
    { to: '/payroll', icon: MoneyChange, text: 'Payroll' },
    { to: '/vendor-invoices', icon: DocumentText, text: 'Vendor Invoices' },
    { to: '/leave-tracker', icon: Calendar2, text: 'Leave Tracker' },
    { to: '/departments', icon: ArchiveBox, text: 'All Departments' },
    { to: '/shops', icon: MessageQuestion, text: 'Shops' },
    { to: '/settings', icon: Setting, text: 'Settings' },
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
    'Insights',
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
  'Insights': ['/insights'],
};

export const getNavItemsByRole = (role: string, daysLeft: number, planName: string | undefined): NavItemConfig[] => {
  const defaultRoutes = navItemsByRole[role] || navItemsByRole['WAITER'];

  // SUPER_ADMIN bypasses subscription checks
  if (role === 'SUPER_ADMIN') {
    return defaultRoutes;
  }

  // COO, AUDITOR, SUPERVISOR bypass subscription checks and have access to all routes (read-only)
  if (role === 'COO' || role === 'AUDITOR' || role === 'SUPERVISOR') {
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
    .concat(['/settings', '/subscriptions', '/verify-payment', '/', '/insights', '/attendance', '/leave-tracker', '/payroll', '/menu', '/whatsapp-messages']);

  // HUMAN_RESOURCE bypasses subscription checks
  if (role === 'HUMAN_RESOURCE') {
    return defaultRoutes;
  }

  // ADMIN and MANAGER bypass subscription checks for WhatsApp messages
  if (role === 'ADMIN' || role === 'MANAGER') {
    return defaultRoutes.filter((item) => 
      item.to === '/whatsapp-messages' || allowedRoutes.includes(item.to)
    );
  }

  // ACCOUNTANT bypasses subscription checks
  if (role === 'ACCOUNTANT') {
    return defaultRoutes;
  }

  // For STORE_KEEPER, always allow dashboard, inventory, settings, and leave-tracker regardless of plan
  if (role === 'STORE_KEEPER') {
    return defaultRoutes.filter((item) => 
      item.to === '/' || item.to === '/inventory' || item.to === '/settings' || item.to === '/leave-tracker' || allowedRoutes.includes(item.to)
    );
  }

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

  // Special handling for STORE_KEEPER - always allow dashboard, inventory, settings, and leave-tracker
  if (role === 'STORE_KEEPER') {
    if (path === '/' || path === '/inventory' || path === '/settings' || path === '/leave-tracker') {
      return true;
    }
  }

  // Special handling for HUMAN_RESOURCE - always allow their routes
  if (role === 'HUMAN_RESOURCE') {
    const hrRoutes = ['/', '/attendance', '/staffs', '/salary', '/payroll', '/leave-tracker', '/departments', '/shops', '/settings'];
    if (hrRoutes.includes(path) || path.startsWith('/staffs') || path.startsWith('/attendance') || path.startsWith('/salary') || path.startsWith('/shops')) {
      return true;
    }
  }

  // Allow leave-tracker for all staff roles (any role that's not SUPER_ADMIN)
  if (path === '/leave-tracker' && role !== 'SUPER_ADMIN') {
    return true;
  }

  // Special handling for ACCOUNTANT - always allow dashboard, menu, menu-items, inventory, salary, payroll, vendor-invoices, insights, shops, whatsapp-messages, and other accountant routes
  if (role === 'ACCOUNTANT') {
    if (path === '/' || path === '/menu' || path.startsWith('/menu') || path === '/menu-items' || path === '/inventory' || path.startsWith('/inventory') || path === '/salary' || path.startsWith('/salary') || path === '/payroll' || path === '/vendor-invoices' || path.startsWith('/vendor-invoices') || path === '/insights' || path.startsWith('/insights') || path === '/shops' || path.startsWith('/shops') || path === '/whatsapp-messages' || path.startsWith('/whatsapp-messages') || path === '/settings' || path === '/leave-tracker') {
      return true;
    }
  }

  // Special handling for ADMIN and MANAGER - allow whatsapp-messages
  if ((role === 'ADMIN' || role === 'MANAGER') && (path === '/whatsapp-messages' || path.startsWith('/whatsapp-messages'))) {
    return true;
  }

  // Special handling for COO, AUDITOR, SUPERVISOR - read-only access to all routes (except admin routes)
  if (role === 'COO' || role === 'AUDITOR' || role === 'SUPERVISOR') {
    // Allow all routes except admin routes
    if (!path.startsWith('/admin')) {
      return true;
    }
  }

  const isAllowed = allowedRoutes.some((item) => {
    const baseRoute = item.to.split('/')[1] || item.to;
    const basePath = path.split('/')[1] || path;
    return path === item.to || (baseRoute === basePath && path.startsWith(item.to));
  });

  console.log('Non-admin route check - role:', role, 'path:', path, 'allowed:', isAllowed);
  return isAllowed;
};