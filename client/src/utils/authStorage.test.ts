import { describe, it, expect, beforeEach } from 'vitest';
import { saveAuth, getToken, getUser, clearAuth, isAuthenticated } from './authStorage';
import type { AuthUser } from '../api/authApi';

describe('Client authStorage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockUser: AuthUser = {
    id: 1,
    full_name: 'Eyosi Mak',
    email: 'eyosi@injibaramarket.com',
    role: 'seller',
  };

  it('should save and retrieve token and user profile', () => {
    saveAuth('mock-jwt-token-123', mockUser);

    expect(getToken()).toBe('mock-jwt-token-123');
    expect(getUser()).toEqual(mockUser);
    expect(isAuthenticated()).toBe(true);
  });

  it('should clear authentication data completely on logout', () => {
    saveAuth('mock-jwt-token-123', mockUser);
    expect(isAuthenticated()).toBe(true);

    clearAuth();

    expect(getToken()).toBeNull();
    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it('should return null if user data in storage is malformed JSON', () => {
    localStorage.setItem('injibara_market_token', 'valid-token');
    localStorage.setItem('injibara_market_user', 'invalid-non-json');

    expect(getUser()).toBeNull();
    expect(isAuthenticated()).toBe(true); // Token is still valid
  });
});
