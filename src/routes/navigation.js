/**
 * Role-aware Navigation and Routing Definitions
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  RECEPTIONIST: 'RECEPTIONIST',
};

/**
 * Returns the landing route based on user role.
 * @param {string} role
 * @returns {string}
 */
export const getDefaultDashboardRoute = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/admin';
    case ROLES.OWNER:
    case ROLES.RECEPTIONIST:
    default:
      return '/dashboard';
  }
};

/**
 * All navigational items mapped to authorized roles
 */
export const NAV_ITEMS = [
  {
    title: 'Platform Overview',
    path: '/admin',
    icon: 'Dashboard',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'Dashboard',
    roles: [ROLES.OWNER, ROLES.RECEPTIONIST],
  },
  {
    title: 'Appointments',
    path: '/appointments',
    icon: 'CalendarMonth',
    roles: [ROLES.OWNER, ROLES.RECEPTIONIST],
  },
  {
    title: 'Clients',
    path: '/clients',
    icon: 'People',
    roles: [ROLES.OWNER, ROLES.RECEPTIONIST],
  },
  {
    title: 'Plans',
    path: '/plans',
    icon: 'Layers',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: 'Salons',
    path: '/salons',
    icon: 'Storefront',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    title: 'Subscription',
    path: '/subscriptions',
    icon: 'CreditCard',
    roles: [ROLES.SUPER_ADMIN, ROLES.OWNER], // Receptionist is strictly excluded
  },
];

/**
 * Filters navigation items visible to the given role.
 * @param {string} role
 * @returns {Array}
 */
export const getAuthorizedNavItems = (role) => {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
};
