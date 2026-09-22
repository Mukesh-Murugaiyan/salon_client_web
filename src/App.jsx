import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Appointments from './pages/Appointments';
import Clients from './pages/Clients';
import Plans from './pages/Plans';
import Salons from './pages/Salons';
import Subscriptions from './pages/Subscriptions';
import Unauthorized from './pages/Unauthorized';
import { ROLES } from './routes/navigation';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected App Routes enclosed in DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Default landing dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Super Admin Platform Console */}
        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <AdminPanel />
            </RoleRoute>
          }
        />

        {/* Appointments (Owner & Receptionist & SuperAdmin) */}
        <Route
          path="/appointments"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.RECEPTIONIST]}>
              <Appointments />
            </RoleRoute>
          }
        />

        {/* Clients (Owner & Receptionist & SuperAdmin) */}
        <Route
          path="/clients"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OWNER, ROLES.RECEPTIONIST]}>
              <Clients />
            </RoleRoute>
          }
        />

        {/* Plans (SUPER_ADMIN only) */}
        <Route
          path="/plans"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <Plans />
            </RoleRoute>
          }
        />

        {/* Salons (SUPER_ADMIN only) */}
        <Route
          path="/salons"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <Salons />
            </RoleRoute>
          }
        />

        {/* Subscriptions (SUPER_ADMIN & OWNER; RECEPTIONIST is forbidden) */}
        <Route
          path="/subscriptions"
          element={
            <RoleRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.OWNER]}>
              <Subscriptions />
            </RoleRoute>
          }
        />

        {/* 403 Forbidden Access Page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
