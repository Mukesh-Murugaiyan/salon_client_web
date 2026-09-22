import { ROLES } from '../constants/roles';

/**
 * Checks if a given user role exists within an allowed roles list.
 * @param {string} userRole
 * @param {Array<string>} [allowedRoles=[]]
 * @returns {boolean}
 */
export const hasRole = (userRole, allowedRoles = []) => {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Checks if role is Super Admin.
 * @param {string} role
 * @returns {boolean}
 */
export const isSuperAdmin = (role) => {
  return role === ROLES.SUPER_ADMIN.value;
};

/**
 * Checks if role is Salon Owner.
 * @param {string} role
 * @returns {boolean}
 */
export const isOwner = (role) => {
  return role === ROLES.OWNER.value;
};

/**
 * Checks if role is Receptionist.
 * @param {string} role
 * @returns {boolean}
 */
export const isReceptionist = (role) => {
  return role === ROLES.RECEPTIONIST.value;
};

/**
 * Returns human-readable label for a role value.
 * @param {string} roleValue
 * @returns {string}
 */
export const getRoleLabel = (roleValue) => {
  const role = Object.values(ROLES).find((item) => item.value === roleValue);
  return role?.label ?? 'Unknown';
};
