import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storage from '../utils/storage';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(storage.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session on application mount
  const initializeAuth = useCallback(async () => {
    const savedToken = storage.getToken();
    if (!savedToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      // Validate token with backend /api/auth/me instead of blindly trusting localStorage
      const data = await authApi.getMe();
      setUser(data.user);
      setTokenState(savedToken);
    } catch (err) {
      console.warn('[AuthContext] Session restoration failed, clearing stale token.');
      storage.removeToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Performs login, persists token, updates context state.
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    storage.setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data.user;
  };

  /**
   * Logs out user, discards token from storage, clears context state.
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Gracefully handle logout failure if network is down
      console.warn('[AuthContext] Backend logout notification failed:', err);
    } finally {
      storage.removeToken();
      setTokenState(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser: initializeAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
