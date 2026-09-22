/**
 * Dynamic Permission Constants & Schema Catalog (Frontend)
 */
export const MODULES = {
  USERS: 'users',
  ROLES: 'roles',
  STAFF: 'staff',
  APPOINTMENTS: 'appointments',
  CLIENTS: 'clients',
  SUBSCRIPTION: 'subscription',
  DASHBOARD: 'dashboard',
  COMPANIES: 'companies',
  PLANS: 'plans',
  SERVICES: 'services',
};

export const ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ASSIGN: 'assign',
  RENEW: 'renew',
  UPGRADE: 'upgrade',
  HISTORY: 'history',
};

export const PERMISSION_CATALOG = [
  {
    module: MODULES.STAFF,
    label: 'Staff',
    description: 'Manage stylists, service specialists, and salon employees',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.SERVICES,
    label: 'Services',
    description: 'Salon service catalog, durations, and pricing',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.CLIENTS,
    label: 'Clients',
    description: 'Client records, profiles, and history',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.APPOINTMENTS,
    label: 'Appointments',
    description: 'Booking, scheduling, and calendar management',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.USERS,
    label: 'Users',
    description: 'Manage system login accounts and company users',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.ROLES,
    label: 'Roles & Permissions',
    description: 'Manage security roles and permission assignments',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
  {
    module: MODULES.SUBSCRIPTION,
    label: 'Subscription',
    description: 'Billing, plan assignments, renewals, and history',
    actions: [ACTIONS.VIEW, ACTIONS.ASSIGN, ACTIONS.RENEW, ACTIONS.UPGRADE, ACTIONS.HISTORY],
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
    description: 'Subscription plans, pricing, and quota limits',
    actions: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.UPDATE, ACTIONS.DELETE],
  },
];
