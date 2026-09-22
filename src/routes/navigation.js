/**
 * Dynamic Navigation Definitions (Ticket 3 - DB Driven)
 */
import { NAVIGATION_ITEMS } from '../config/navigation';
import { ROUTES } from '../constants/routes';

export const getDefaultDashboardRoute = (user) => {
  return ROUTES.DASHBOARD.value;
};

export const NAV_ITEMS = NAVIGATION_ITEMS;

export const getAuthorizedNavItems = (user) => {
  if (!user || !user.permissions) return [];
  return NAVIGATION_ITEMS.filter((item) =>
    !item.requiredPermission || user.permissions.includes(item.requiredPermission)
  );
};
