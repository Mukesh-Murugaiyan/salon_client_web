import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Role-Based Route Guard.
 * Restricts client navigation based on authenticated user's role for UX.
 * NOTE: Frontend route guarding does NOT replace backend server-side authorization.
 *
 * @param {Object} props
 * @param {string[]} props.allowedRoles
 * @param {React.ReactNode} props.children
 */
const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleRoute;
