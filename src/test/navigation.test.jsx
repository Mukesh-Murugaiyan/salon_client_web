import { describe, it, expect } from 'vitest';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { NAVIGATION_ITEMS } from '../config/navigation';
import { hasRole } from '../utils/role.utils';
import { getDefaultRouteForRole } from '../utils/route.utils';

describe('Configuration-Driven Navigation & Role Groups Tests', () => {
  it('RECEPTIONIST navigation strictly excludes Plans, Salons, and Subscription', () => {
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      hasRole(ROLES.RECEPTIONIST.value, item.allowedRoles)
    );
    const routes = visibleItems.map((item) => item.route);

    expect(routes).toContain(ROUTES.DASHBOARD.value);
    expect(routes).toContain(ROUTES.APPOINTMENTS.value);
    expect(routes).toContain(ROUTES.CLIENTS.value);

    // Forbidden areas for RECEPTIONIST
    expect(routes).not.toContain(ROUTES.SUBSCRIPTION.value);
    expect(routes).not.toContain(ROUTES.ADMIN.value);
    expect(routes).not.toContain(ROUTES.ADMIN_PLANS.value);
    expect(routes).not.toContain(ROUTES.ADMIN_SALONS.value);
    expect(routes).not.toContain(ROUTES.ADMIN_SUBSCRIPTION_HISTORY.value);
  });

  it('OWNER navigation includes Dashboard, Appointments, Clients, and Subscription', () => {
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      hasRole(ROLES.OWNER.value, item.allowedRoles)
    );
    const routes = visibleItems.map((item) => item.route);

    expect(routes).toContain(ROUTES.DASHBOARD.value);
    expect(routes).toContain(ROUTES.APPOINTMENTS.value);
    expect(routes).toContain(ROUTES.CLIENTS.value);
    expect(routes).toContain(ROUTES.SUBSCRIPTION.value);

    // Platform-admin-only areas forbidden for OWNER
    expect(routes).not.toContain(ROUTES.ADMIN.value);
    expect(routes).not.toContain(ROUTES.ADMIN_PLANS.value);
    expect(routes).not.toContain(ROUTES.ADMIN_SALONS.value);
    expect(routes).not.toContain(ROUTES.ADMIN_SUBSCRIPTION_HISTORY.value);
  });

  it('SUPER_ADMIN navigation includes Admin Overview, Plans, Salons, and Subscription', () => {
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      hasRole(ROLES.SUPER_ADMIN.value, item.allowedRoles)
    );
    const routes = visibleItems.map((item) => item.route);

    expect(routes).toContain(ROUTES.ADMIN.value);
    expect(routes).toContain(ROUTES.ADMIN_PLANS.value);
    expect(routes).toContain(ROUTES.ADMIN_SALONS.value);
    expect(routes).toContain(ROUTES.ADMIN_SUBSCRIPTION_HISTORY.value);
    expect(routes).toContain(ROUTES.SUBSCRIPTION.value);
  });

  it('getDefaultRouteForRole routes each role correctly', () => {
    expect(getDefaultRouteForRole(ROLES.SUPER_ADMIN.value)).toBe(ROUTES.ADMIN.value);
    expect(getDefaultRouteForRole(ROLES.OWNER.value)).toBe(ROUTES.DASHBOARD.value);
    expect(getDefaultRouteForRole(ROLES.RECEPTIONIST.value)).toBe(ROUTES.DASHBOARD.value);
    expect(getDefaultRouteForRole('UNKNOWN_ROLE')).toBe(ROUTES.LOGIN.value);
  });
});
