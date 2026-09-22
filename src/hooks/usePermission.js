import { useAuth } from '../context/AuthContext';
import { useCallback } from 'react';
import { can as canCheck, hasPermission as hasPermissionCheck, hasAnyPermission as hasAnyCheck } from '../utils/permission.utils';

/**
 * Custom hook providing dynamic permission checks for the currently logged-in user.
 *
 * Example:
 * const { can, hasPermission } = usePermission();
 * if (can('clients', 'create')) { ... }
 */
export const usePermission = () => {
  const { user } = useAuth();

  const can = useCallback((moduleName, actionName) => canCheck(user, moduleName, actionName), [user]);
  const hasPermission = useCallback((permission) => hasPermissionCheck(user, permission), [user]);
  const hasAnyPermission = useCallback((...permissions) => hasAnyCheck(user, ...permissions), [user]);

  return {
    can,
    hasPermission,
    hasAnyPermission,
    permissions: user?.permissions || [],
    user,
  };
};

export default usePermission;
