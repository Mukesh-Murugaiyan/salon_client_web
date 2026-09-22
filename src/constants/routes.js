/**
 * Centralized Route Definitions (Label/Value Pattern)
 */
export const ROUTES = {
  LOGIN: {
    label: 'Login',
    value: '/login',
  },
  DASHBOARD: {
    label: 'Dashboard',
    value: '/dashboard',
  },
  USERS: {
    label: 'Users',
    value: '/users',
  },
  ROLES: {
    label: 'Roles',
    value: '/roles',
  },
  ROLE_DETAIL: {
    label: 'Role Detail',
    value: '/roles/:id',
  },
  APPOINTMENTS: {
    label: 'Appointments',
    value: '/appointments',
  },
  CLIENTS: {
    label: 'Clients',
    value: '/clients',
  },
  SUBSCRIPTION: {
    label: 'Subscription',
    value: '/subscription',
  },
  ADMIN: {
    label: 'Admin Overview',
    value: '/admin',
  },
  ADMIN_PLANS: {
    label: 'Plans',
    value: '/admin/plans',
  },
  ADMIN_SALONS: {
    label: 'Salons',
    value: '/admin/salons',
  },
  ADMIN_SUBSCRIPTION_HISTORY: {
    label: 'Subscription History',
    value: '/admin/subscription-history',
  },
  FORBIDDEN: {
    label: 'Forbidden',
    value: '/403',
  },
};
