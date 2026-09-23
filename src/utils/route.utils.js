import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { getDefaultDashboardRoute } from '../routes/navigation';

/**
 * Returns default landing route for an authenticated role or user profile.
 * - If a user object with permissions is passed, dynamically resolves to their first permitted screen.
 * - Otherwise falls back to static role defaults:
 *   - SUPER_ADMIN → /admin
 *   - OWNER → /dashboard
 *   - RECEPTIONIST → /dashboard
 *   - Default / Unauthenticated → /login
 *
 * @param {string|Object} roleOrUser
 * @returns {string}
 */
export const getDefaultRouteForRole = (roleOrUser) => {
  if (roleOrUser && typeof roleOrUser === 'object' && roleOrUser.permissions) {
    return getDefaultDashboardRoute(roleOrUser);
  }

  const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;

  switch (role) {
    case ROLES.SUPER_ADMIN.value:
      return ROUTES.ADMIN.value;

    case ROLES.OWNER.value:
    case ROLES.RECEPTIONIST.value:
      return ROUTES.DASHBOARD.value;

    default:
      return ROUTES.LOGIN.value;
  }
};

