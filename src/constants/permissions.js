/**
 * Dynamic Permission Constants & Schema Catalog (Frontend)
 */
export const MODULES = {
  USERS: 'users',
  ROLES: 'roles',
  APPOINTMENTS: 'appointments',
  CLIENTS: 'clients',
  SUBSCRIPTION: 'subscription',
  DASHBOARD: 'dashboard',
  COMPANIES: 'companies',
  PLANS: 'plans',
};

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const PERMISSION_CATALOG = [
  {
    module: MODULES.USERS,
    label: 'Users',
    description: 'Manage staff and company users',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.ROLES,
    label: 'Roles & Permissions',
    description: 'Manage security roles and permission assignments',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.APPOINTMENTS,
    label: 'Appointments',
    description: 'Booking, scheduling, and calendar management',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.CLIENTS,
    label: 'Clients',
    description: 'Client records, profiles, and history',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.SUBSCRIPTION,
    label: 'Subscription',
    description: 'Billing, tiers, and subscription management',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE],
  },
  {
    module: MODULES.DASHBOARD,
    label: 'Dashboard',
    description: 'Access main operational dashboard and metrics',
    actions: [ACTIONS.VIEW],
  },
  {
    module: MODULES.COMPANIES,
    label: 'Companies',
    description: 'Company profiles and settings',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE],
  },
  {
    module: MODULES.PLANS,
    label: 'Plans',
    description: 'Subscription plans and pricing',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE],
  },
];
