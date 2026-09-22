import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';

/**
 * Returns default landing route for an authenticated role.
 * - SUPER_ADMIN → /admin
 * - OWNER → /dashboard
 * - RECEPTIONIST → /dashboard
 * - Default / Unauthenticated → /login
 *
 * @param {string} role
 * @returns {string}
 */
export const getDefaultRouteForRole = (role) => {
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
