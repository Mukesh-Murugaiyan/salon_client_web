import { NAVIGATION_ITEMS } from '../config/navigation';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { hasPermission } from '../utils/permission.utils';

export const NAV_ITEMS = NAVIGATION_ITEMS;

export const getAuthorizedNavItems = (user) => {
  if (!user || !user.permissions || !Array.isArray(user.permissions)) return [];
  return NAVIGATION_ITEMS.filter((item) => {
    if (!item.requiredPermission) return true;
    if (Array.isArray(item.requiredPermission)) {
      return item.requiredPermission.some((perm) => hasPermission(user, perm));
    }
    return hasPermission(user, item.requiredPermission);
  });
};

/**
 * Returns the default / next available route for a given user.
 * - If dashboard:view is enabled, returns /dashboard (or /admin for super admin).
 * - If dashboard:view is disabled, automatically resolves the next available permitted screen.
 * - If no screens are permitted, returns /403.
 *
 * @param {Object|string} user - User profile object (or role string for backward compatibility)
 * @returns {string} - Route path
 */
export const getDefaultDashboardRoute = (user) => {
  if (!user) return ROUTES.LOGIN.value;

  // Handle case where user is passed as a string role
  if (typeof user === 'string') {
    if (user === ROLES.SUPER_ADMIN.value) {
      return ROUTES.ADMIN.value;
    }
    return ROUTES.DASHBOARD.value;
  }

  // If user has no permissions array, fallback to role default
  if (!user.permissions || !Array.isArray(user.permissions)) {
    const roleName = user.role?.name || user.role;
    if (roleName === ROLES.SUPER_ADMIN.value) {
      return ROUTES.ADMIN.value;
    }
    return ROUTES.DASHBOARD.value;
  }

  // If SUPER_ADMIN has dashboard:view, prioritize /admin
  const roleName = user.role?.name || user.role;
  if (roleName === ROLES.SUPER_ADMIN.value && hasPermission(user, 'dashboard:view')) {
    return ROUTES.ADMIN.value;
  }

  // Check if standard dashboard is authorized
  if (hasPermission(user, 'dashboard:view')) {
    return ROUTES.DASHBOARD.value;
  }

  // Dashboard view is disabled: navigate to the next available permitted screen
  const authorizedItems = getAuthorizedNavItems(user);
  if (authorizedItems && authorizedItems.length > 0) {
    return authorizedItems[0].route;
  }

  // If the user has no permitted screens at all, return forbidden route
  return ROUTES.FORBIDDEN.value;
};

