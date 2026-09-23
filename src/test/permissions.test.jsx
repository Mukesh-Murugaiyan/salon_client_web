import { describe, it, expect } from 'vitest';
import { hasPermission, can, hasAnyPermission } from '../utils/permission.utils';

describe('Frontend Permission Utility Tests', () => {
  const user = {
    permissions: ['users:view', 'users:create', 'appointments:view'],
  };

  it('hasPermission correctly checks permission existence case-insensitively', () => {
    expect(hasPermission(user, 'users:view')).toBe(true);
    expect(hasPermission(user, 'USERS:VIEW')).toBe(true);
    expect(hasPermission(user, 'users:delete')).toBe(false);
    expect(hasPermission(null, 'users:view')).toBe(false);
    expect(hasPermission({}, 'users:view')).toBe(false);
  });

  it('can helper correctly checks module and action', () => {
    expect(can(user, 'users', 'create')).toBe(true);
    expect(can(user, 'appointments', 'view')).toBe(true);
    expect(can(user, 'appointments', 'delete')).toBe(false);
    expect(can(user, '', 'view')).toBe(false);
  });

  it('hasAnyPermission returns true if user has at least one of the permissions', () => {
    expect(hasAnyPermission(user, 'users:delete', 'users:view')).toBe(true);
    expect(hasAnyPermission(user, ['users:delete', 'appointments:create'])).toBe(false);
    expect(hasAnyPermission(null, 'users:view')).toBe(false);
  });
});
