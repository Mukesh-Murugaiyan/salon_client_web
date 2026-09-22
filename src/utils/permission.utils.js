/**
 * Frontend Permission Utilities for UX and Guarding
 * Note: Real authorization remains enforced strictly on the backend.
 */

/**
 * Checks if the user has a specific permission string (e.g. 'users:create').
 *
 * @param {Object} user - User object with permissions array
 * @param {string} permission - e.g. 'users:view' or 'appointments:create'
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions || !Array.isArray(user.permissions)) {
    return false;
  }
  return user.permissions.map((p) => p.toLowerCase()).includes(permission.toLowerCase());
};

/**
 * Checks if the user has permission for a specific module and action.
 *
 * @param {Object} user
 * @param {string} moduleName - e.g. 'users', 'roles', 'appointments'
 * @param {string} actionName - e.g. 'view', 'create', 'update', 'delete'
 * @returns {boolean}
 */
export const can = (user, moduleName, actionName) => {
  if (!moduleName || !actionName) return false;
  return hasPermission(user, `${moduleName}:${actionName}`);
};

/**
 * Checks if the user has ANY of the specified permissions.
 *
 * @param {Object} user
 * @param {Array<string>} permissions
 * @returns {boolean}
 */
export const hasAnyPermission = (user, ...permissions) => {
  if (!user || !user.permissions) return false;
  return permissions.flat().some((perm) => hasPermission(user, perm));
};
