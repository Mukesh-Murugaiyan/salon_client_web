import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission, can, hasAnyPermission } from '../utils/permission.utils';
import { ROUTES } from '../constants/routes';

/**
 * Dynamic Permission-Based Route Guard
 * Enforces UX route restrictions based on database-loaded permissions.
 *
 * @param {Object} props
 * @param {string} [props.requiredPermission] - e.g. 'users:view'
 * @param {string} [props.module] - e.g. 'users'
 * @param {string} [props.action] - e.g. 'view'
 * @param {Array<string>} [props.anyOf] - Array of permissible permissions
 * @param {React.ReactNode} props.children
 */
const PermissionRoute = ({ requiredPermission, module: moduleName, action: actionName, anyOf, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN.value} replace />;
  }

  let isAllowed = false;

  if (requiredPermission) {
    isAllowed = hasPermission(user, requiredPermission);
  } else if (moduleName && actionName) {
    isAllowed = can(user, moduleName, actionName);
  } else if (Array.isArray(anyOf) && anyOf.length > 0) {
    isAllowed = hasAnyPermission(user, ...anyOf);
  } else {
    // If no permission specified, allow authenticated user
    isAllowed = true;
  }

  if (!isAllowed) {
    return <Navigate to={ROUTES.FORBIDDEN.value} replace />;
  }

  return children;
};

export default PermissionRoute;
