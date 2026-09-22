import { describe, it, expect, beforeEach } from 'vitest';
import storage from '../utils/storage';

describe('Storage Abstraction Utility Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores and retrieves JWT token securely', () => {
    expect(storage.getToken()).toBeNull();
    storage.setToken('sample.test.jwt.token');
    expect(storage.getToken()).toBe('sample.test.jwt.token');
  });

  it('removes token on logout', () => {
    storage.setToken('sample.token');
    expect(storage.getToken()).toBe('sample.token');
    storage.removeToken();
    expect(storage.getToken()).toBeNull();
  });

  it('clears token when setToken is called with falsy value', () => {
    storage.setToken('sample.token');
    storage.setToken(null);
    expect(storage.getToken()).toBeNull();
  });
});
