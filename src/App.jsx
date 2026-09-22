import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import PermissionRoute from './routes/PermissionRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Forbidden from './pages/Forbidden/Forbidden';
import UserList from './pages/Users/UserList';
import RoleList from './pages/Roles/RoleList';
import RoleDetail from './pages/Roles/RoleDetail';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import StaffList from './pages/Staff/StaffList';
import ServicesList from './pages/Services/ServicesList';
import Plans from './pages/Plans';
import Salons from './pages/Salons';
import Subscriptions from './pages/Subscriptions';
import { ROUTES } from './constants/routes';

/**
 * Main Application Routing Tree
 * Strictly enforces dynamic database permissions rather than hardcoded roles.
 */
const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path={ROUTES.LOGIN.value} element={<Login />} />

      {/* Protected App Routes enclosed in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dynamic Operational Dashboard */}
        <Route
          path={ROUTES.DASHBOARD.value}
          element={
            <PermissionRoute requiredPermission="dashboard:view">
              <Dashboard />
            </PermissionRoute>
          }
        />

        {/* User Management */}
        <Route
          path={ROUTES.USERS.value}
          element={
            <PermissionRoute requiredPermission="users:view">
              <UserList />
            </PermissionRoute>
          }
        />

        {/* Role Management */}
        <Route
          path={ROUTES.ROLES.value}
          element={
            <PermissionRoute requiredPermission="roles:view">
              <RoleList />
            </PermissionRoute>
          }
        />

        {/* Role Detail & Permission Matrix */}
        <Route
          path={ROUTES.ROLE_DETAIL.value}
          element={
            <PermissionRoute requiredPermission="roles:view">
              <RoleDetail />
            </PermissionRoute>
          }
        />

        {/* Platform Overview */}
        <Route
          path={ROUTES.ADMIN.value}
          element={
            <PermissionRoute requiredPermission="dashboard:view">
              <AdminDashboard />
            </PermissionRoute>
          }
        />

        {/* Appointments */}
        <Route
          path={ROUTES.APPOINTMENTS.value}
          element={
            <PermissionRoute requiredPermission="appointments:view">
              <Appointments />
            </PermissionRoute>
          }
        />

        {/* Clients */}
        <Route
          path={ROUTES.CLIENTS.value}
          element={
            <PermissionRoute requiredPermission="clients:view">
              <Clients />
            </PermissionRoute>
          }
        />

        {/* Staff Management */}
        <Route
          path={ROUTES.STAFF.value}
          element={
            <PermissionRoute requiredPermission="staff:view">
              <StaffList />
            </PermissionRoute>
          }
        />

        {/* Services Management */}
        <Route
          path={ROUTES.SERVICES.value}
          element={
            <PermissionRoute requiredPermission="services:view">
              <ServicesList />
            </PermissionRoute>
          }
        />

        {/* Subscriptions */}
        <Route
          path={ROUTES.SUBSCRIPTION.value}
          element={
            <PermissionRoute requiredPermission="subscription:view">
              <Subscriptions />
            </PermissionRoute>
          }
        />

        {/* Plans Management */}
        <Route
          path={ROUTES.ADMIN_PLANS.value}
          element={
            <PermissionRoute requiredPermission="plans:view">
              <Plans />
            </PermissionRoute>
          }
        />
        <Route
          path={ROUTES.PLANS.value}
          element={
            <PermissionRoute requiredPermission="plans:view">
              <Plans />
            </PermissionRoute>
          }
        />

        {/* Companies / Salons Management */}
        <Route
          path={ROUTES.ADMIN_SALONS.value}
          element={
            <PermissionRoute requiredPermission="companies:view">
              <Salons />
            </PermissionRoute>
          }
        />

        {/* Subscription History */}
        <Route
          path={ROUTES.ADMIN_SUBSCRIPTION_HISTORY.value}
          element={
            <PermissionRoute requiredPermission="subscription:view">
              <Subscriptions />
            </PermissionRoute>
          }
        />

        {/* 403 Forbidden Access Page */}
        <Route path={ROUTES.FORBIDDEN.value} element={<Forbidden />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN.value} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN.value} replace />} />
    </Routes>
  );
};

export default App;
