import { describe, it, expect } from 'vitest';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { NAVIGATION_ITEMS } from '../config/navigation';
import { hasPermission } from '../utils/permission.utils';
import { getDefaultRouteForRole } from '../utils/route.utils';

describe('Dynamic Permission-Driven Navigation Tests', () => {
  it('RECEPTIONIST navigation strictly excludes Plans, Salons, and Subscription', () => {
    const receptionistUser = {
      permissions: ['dashboard:view', 'appointments:view', 'clients:view', 'services:view', 'staff:view'],
    };
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      hasPermission(receptionistUser, item.requiredPermission)
    );
    const routes = visibleItems.map((item) => item.route);

    expect(routes).toContain(ROUTES.DASHBOARD.value);
    expect(routes).toContain(ROUTES.APPOINTMENTS.value);
    expect(routes).toContain(ROUTES.CLIENTS.value);

    // Forbidden areas for RECEPTIONIST without admin/subscription permissions
    expect(routes).not.toContain(ROUTES.SUBSCRIPTION.value);
    expect(routes).not.toContain(ROUTES.ADMIN_PLANS.value);
    expect(routes).not.toContain(ROUTES.ADMIN_SALONS.value);
  });

  it('OWNER navigation includes Dashboard, Appointments, Clients, and Subscription', () => {
    const ownerUser = {
      permissions: [
        'dashboard:view',
        'appointments:view',
        'clients:view',
        'services:view',
        'staff:view',
        'subscription:view',
      ],
    };
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      hasPermission(ownerUser, item.requiredPermission)
    );
    const routes = visibleItems.map((item) => item.route);

    expect(routes).toContain(ROUTES.DASHBOARD.value);
    expect(routes).toContain(ROUTES.APPOINTMENTS.value);
    expect(routes).toContain(ROUTES.CLIENTS.value);
    expect(routes).toContain(ROUTES.SUBSCRIPTION.value);

    // Super-admin only areas forbidden for standard OWNER
    expect(routes).not.toContain(ROUTES.ADMIN_PLANS.value);
    expect(routes).not.toContain(ROUTES.ADMIN_SALONS.value);
  });

  it('SUPER_ADMIN navigation includes Plans, Salons, and Subscription', () => {
    const adminUser = {
      permissions: ['plans:view', 'salons:view', 'subscription:view', 'users:view', 'roles:view'],
    };
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      hasPermission(adminUser, item.requiredPermission)
    );
    const routes = visibleItems.map((item) => item.route);

    expect(routes).toContain(ROUTES.ADMIN_PLANS.value);
    expect(routes).toContain(ROUTES.ADMIN_SALONS.value);
    expect(routes).toContain(ROUTES.SUBSCRIPTION.value);
  });

  it('getDefaultRouteForRole routes each role correctly', () => {
    expect(getDefaultRouteForRole(ROLES.SUPER_ADMIN.value)).toBe(ROUTES.ADMIN.value);
    expect(getDefaultRouteForRole(ROLES.OWNER.value)).toBe(ROUTES.DASHBOARD.value);
    expect(getDefaultRouteForRole(ROLES.RECEPTIONIST.value)).toBe(ROUTES.DASHBOARD.value);
    expect(getDefaultRouteForRole('UNKNOWN_ROLE')).toBe(ROUTES.LOGIN.value);
  });
});
