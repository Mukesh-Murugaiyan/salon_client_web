import { ROUTES } from '../constants/routes';

/**
 * Dynamic Permission-Driven Navigation Configuration
 *
 * Each navigation item defines the required permission `${module}:${action}`.
 * The Sidebar evaluates these against the authenticated user's dynamic database permissions.
 */
export const NAVIGATION_ITEMS = [
  {
    label: 'Dashboard',
    value: 'dashboard',
    route: ROUTES.DASHBOARD.value,
    requiredPermission: 'dashboard:view',
    icon: 'Dashboard',
  },
  {
    label: 'Staff',
    value: 'staff',
    route: ROUTES.STAFF.value,
    requiredPermission: 'staff:view',
    icon: 'Badge',
  },
  {
    label: 'Services',
    value: 'services',
    route: ROUTES.SERVICES.value,
    requiredPermission: 'services:view',
    icon: 'Spa',
  },
  {
    label: 'Clients',
    value: 'clients',
    route: ROUTES.CLIENTS.value,
    requiredPermission: 'clients:view',
    icon: 'People',
  },
  {
    label: 'Appointments',
    value: 'appointments',
    route: ROUTES.APPOINTMENTS.value,
    requiredPermission: 'appointments:view',
    icon: 'CalendarMonth',
  },
  {
    label: 'Users',
    value: 'users',
    route: ROUTES.USERS.value,
    requiredPermission: 'users:view',
    icon: 'ManageAccounts',
  },
  {
    label: 'Roles & Permissions',
    value: 'roles',
    route: ROUTES.ROLES.value,
    requiredPermission: 'roles:view',
    icon: 'Security',
  },
  {
    label: 'Subscription',
    value: 'subscription',
    route: ROUTES.SUBSCRIPTION.value,
    requiredPermission: 'subscription:view',
    icon: 'CreditCard',
  },
  {
    label: 'Plans',
    value: 'plans',
    route: ROUTES.ADMIN_PLANS.value,
    requiredPermission: 'plans:view',
    icon: 'Layers',
  },
  {
    label: 'Companies',
    value: 'companies',
    route: ROUTES.ADMIN_SALONS.value,
    requiredPermission: 'companies:view',
    icon: 'Storefront',
  },
];
