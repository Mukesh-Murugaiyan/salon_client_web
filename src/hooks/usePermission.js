import { useAuth } from '../context/AuthContext';
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

  return {
    can: (moduleName, actionName) => canCheck(user, moduleName, actionName),
    hasPermission: (permission) => hasPermissionCheck(user, permission),
    hasAnyPermission: (...permissions) => hasAnyCheck(user, ...permissions),
    permissions: user?.permissions || [],
    user,
  };
};

export default usePermission;
