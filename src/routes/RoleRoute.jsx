import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';

/**
 * Backwards compatibility route guard that falls back to permission checks.
 */
const RoleRoute = ({ allowedRoles = [], requiredPermission, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN.value} replace />;
  }

  // If requiredPermission is provided, check permissions
  if (requiredPermission && user.permissions) {
    const hasAccess = user.permissions.includes(requiredPermission);
    if (!hasAccess) {
      return <Navigate to={ROUTES.FORBIDDEN.value} replace />;
    }
  }

  return children;
};

export default RoleRoute;
