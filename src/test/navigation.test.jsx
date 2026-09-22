import { describe, it, expect } from 'vitest';
import {
  ROLES,
  getAuthorizedNavItems,
  getDefaultDashboardRoute,
} from '../routes/navigation';

describe('Role-Aware Navigation & Authorization Foundation Tests', () => {
  it('RECEPTIONIST navigation strictly excludes Plans, Salons, and Subscription', () => {
    const navItems = getAuthorizedNavItems(ROLES.RECEPTIONIST);
    const paths = navItems.map((item) => item.path);

    expect(paths).toContain('/dashboard');
    expect(paths).toContain('/appointments');
    expect(paths).toContain('/clients');

    // Forbidden areas for RECEPTIONIST
    expect(paths).not.toContain('/plans');
    expect(paths).not.toContain('/salons');
    expect(paths).not.toContain('/subscriptions');
    expect(paths).not.toContain('/admin');
  });

  it('OWNER navigation includes Dashboard, Appointments, Clients, and Subscription', () => {
    const navItems = getAuthorizedNavItems(ROLES.OWNER);
    const paths = navItems.map((item) => item.path);

    expect(paths).toContain('/dashboard');
    expect(paths).toContain('/appointments');
    expect(paths).toContain('/clients');
    expect(paths).toContain('/subscriptions');

    // Platform-admin-only areas forbidden for OWNER
    expect(paths).not.toContain('/plans');
    expect(paths).not.toContain('/salons');
    expect(paths).not.toContain('/admin');
  });

  it('SUPER_ADMIN navigation includes Platform Overview, Plans, Salons, and Subscription', () => {
    const navItems = getAuthorizedNavItems(ROLES.SUPER_ADMIN);
    const paths = navItems.map((item) => item.path);

    expect(paths).toContain('/admin');
    expect(paths).toContain('/plans');
    expect(paths).toContain('/salons');
    expect(paths).toContain('/subscriptions');
  });

  it('Default dashboard redirection routes each role correctly', () => {
    expect(getDefaultDashboardRoute(ROLES.SUPER_ADMIN)).toBe('/admin');
    expect(getDefaultDashboardRoute(ROLES.OWNER)).toBe('/dashboard');
    expect(getDefaultDashboardRoute(ROLES.RECEPTIONIST)).toBe('/dashboard');
    expect(getDefaultDashboardRoute('UNKNOWN')).toBe('/dashboard');
  });
});
