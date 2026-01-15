/**
 * Permissions configuration for different user roles
 * 
 * This file defines what actions each role can perform.
 * - READ: Can view data
 * - CREATE: Can create new records
 * - UPDATE: Can edit existing records
 * - DELETE: Can delete records
 * - EXPORT: Can export data
 */

export type Permission = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXPORT';

export interface RolePermissions {
  [key: string]: Permission[];
}

/**
 * Default permissions for each role
 * COO has read-only access with export capability
 */
export const rolePermissions: RolePermissions = {
  SUPER_ADMIN: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
  ADMIN: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
  MANAGER: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
  HUMAN_RESOURCE: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
  ACCOUNTANT: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
  COO: ['READ', 'EXPORT'], // Read-only with export
  AUDITOR: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'],
  SUPERVISOR: ['READ', 'EXPORT'], // Read-only with export
  WAITER: ['READ', 'CREATE', 'UPDATE'], // Can create orders
  CASHIER: ['READ', 'CREATE', 'UPDATE'], // Can create orders
  STORE_KEEPER: ['READ', 'CREATE', 'UPDATE'], // Can manage inventory
  CHEF: ['READ', 'UPDATE'], // Can update menu items
  BARTENDER: ['READ', 'UPDATE'], // Can update menu items
  HOST: ['READ', 'CREATE', 'UPDATE'], // Can manage reservations
  KITCHEN_STAFF: ['READ', 'UPDATE'], // Can update orders
};

/**
 * Check if a user role has a specific permission
 */
export const hasPermission = (role: string | undefined, permission: Permission): boolean => {
  if (!role) return false;
  const permissions = rolePermissions[role] || [];
  return permissions.includes(permission);
};

/**
 * Check if a user can perform mutations (CREATE, UPDATE, DELETE)
 */
export const canMutate = (role: string | undefined): boolean => {
  if (!role) return false;
  const permissions = rolePermissions[role] || [];
  return permissions.includes('CREATE') || permissions.includes('UPDATE') || permissions.includes('DELETE');
};

/**
 * Check if a user can create new records
 */
export const canCreate = (role: string | undefined): boolean => {
  return hasPermission(role, 'CREATE');
};

/**
 * Check if a user can update existing records
 */
export const canUpdate = (role: string | undefined): boolean => {
  return hasPermission(role, 'UPDATE');
};

/**
 * Check if a user can delete records
 */
export const canDelete = (role: string | undefined): boolean => {
  return hasPermission(role, 'DELETE');
};

/**
 * Check if a user can export data
 */
export const canExport = (role: string | undefined): boolean => {
  return hasPermission(role, 'EXPORT');
};

/**
 * Check if a user has read access (all roles should have this by default)
 */
export const canRead = (role: string | undefined): boolean => {
  return hasPermission(role, 'READ');
};

