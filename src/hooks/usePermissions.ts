import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/api/auth/auth.slice';
import {
  hasPermission,
  canMutate,
  canCreate,
  canUpdate,
  canDelete,
  canExport,
  canRead,
  Permission,
} from '@/config/permissions';

/**
 * React hook to check user permissions
 * 
 * @example
 * const { canCreate, canUpdate, canDelete, canExport, userRole } = usePermissions();
 * 
 * {canCreate && <button onClick={handleCreate}>Create</button>}
 * {canUpdate && <button onClick={handleUpdate}>Edit</button>}
 * {canDelete && <button onClick={handleDelete}>Delete</button>}
 */
export const usePermissions = () => {
  const { user } = useSelector(selectAuth);
  const userRole = user?.role;

  return {
    userRole,
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    canMutate: canMutate(userRole),
    canCreate: canCreate(userRole),
    canUpdate: canUpdate(userRole),
    canDelete: canDelete(userRole),
    canExport: canExport(userRole),
    canRead: canRead(userRole),
    isCOO: userRole === 'COO',
    isReadOnly: userRole === 'COO', // COO is read-only
  };
};



