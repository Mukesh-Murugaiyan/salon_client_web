# Salon ERP Web Portal

[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Material UI](https://img.shields.io/badge/MUI-v6.4-007fff?style=flat-square&logo=mui)](https://mui.com/)
[![React Router](https://img.shields.io/badge/React_Router-v6.29-ca4245?style=flat-square&logo=react-router)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5a29e4?style=flat-square&logo=axios)](https://axios-http.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-729b1a?style=flat-square&logo=vitest)](https://vitest.dev/)

An enterprise-grade, multi-tenant administrative web portal for the Salon ERP & CRM platform. Built with **React 18**, **Vite**, and **Material UI (MUI v6)**, the application delivers dynamic database-driven Role-Based Access Control (RBAC), real-time subscription quota tracking, intelligent geolocation calibration with failovers, and reusable UI components.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Key Features & Capabilities](#key-features--capabilities)
- [Module & Route Directory](#module--route-directory)
- [Security & Dynamic RBAC](#security--dynamic-rbac)
- [Enterprise Component System](#enterprise-component-system)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Installation & Scripts](#installation--scripts)
- [Evaluator Test Credentials](#evaluator-test-credentials)
- [Automated Testing Suite](#automated-testing-suite)
- [Production & Deployment](#production--deployment)

---

## System Architecture

```text
                               ┌─────────────────────────┐
                               │   Vite Dev / Prod Host  │
                               │  http://localhost:5173  │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │       App.jsx Root      │
                               └────────────┬────────────┘
                                            │
                 ┌──────────────────────────┴──────────────────────────┐
                 ▼                                                     ▼
   ┌───────────────────────────┐                         ┌───────────────────────────┐
   │    AuthContext Provider   │                         │   ThemeProvider (MUI v6)  │
   │ - Session & Token State   │                         │ - Curated Palette & Tokens│
   │ - Permissions Hydration   │                         │ - Responsive Breakpoints  │
   │ - Centralized Logout      │                         │ - Clean Elevation Styles  │
   └─────────────┬─────────────┘                         └─────────────┬─────────────┘
                 │                                                     │
                 └──────────────────────────┬──────────────────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │      BrowserRouter      │
                               └────────────┬────────────┘
                                            │
          ┌─────────────────────────────────┴─────────────────────────────────┐
          ▼                                                                   ▼
 ┌──────────────────┐                                              ┌──────────────────┐
 │   Public Route   │                                              │  Protected Route │
 │ - /login         │                                              │ - DashboardLayout│
 │ - Quick-Fill     │                                              │ - Responsive Bar │
 └──────────────────┘                                              └────────┬─────────┘
                                                                            │
                      ┌─────────────────────────────────────────────────────┴─────────────────────────────────────┐
                      ▼                                                     ▼                                     ▼
       ┌──────────────────────────────┐                      ┌──────────────────────────────┐      ┌──────────────────────────────┐
       │    PermissionRoute Guard     │                      │    Reusable Common System    │      │    Domain Feature Views      │
       │ - Checks `can(module, action)│                      │ - AppModal (Sticky Header)   │      │ - Salons & Geofence Setup    │
       │ - Dynamic sidebar filtering  │                      │ - DataTable (Universal)     │      │ - Users & Roles Matrix       │
       │ - 403 Forbidden redirection  │                      │ - DebouncedSearchInput       │      │ - Appointments & Attendance  │
       └──────────────────────────────┘                      │ - SummaryCard / State Banners│      │ - Plans, Subs & Services     │
                                                             └──────────────────────────────┘      └──────────────────────────────┘
```

---

## Key Features & Capabilities

- 🛡️ **Dynamic Database-Driven RBAC**: UI rendering and URL routing are strictly governed by granular permission arrays (`module:action`) retrieved from the database, eliminating rigid hardcoded role checks.
- 🎛️ **Granular Role Permission Matrix (`/roles/:id`)**: Full visual matrix with sticky headers and bulk toggles ("Select All", "Clear All", "Select Row", "Clear Row") allowing real-time capability assignment across 10 modules.
- 📍 **Resilient Dual-Tier Geolocation Calibration**: Desktop and browser-friendly location detection that first tries browser Wi-Fi/network positioning and automatically falls back to an IP geolocation service (`ipwho.is`) to reliably configure salon geofences.
- 💳 **Live Subscription Quota Tracking**: Visual progress bars and capacity indicators for staff and appointment quotas, coupled with graceful server error handling when tier limits or expirations are reached.
- ⚡ **Optimized Server-Side Search**: Consolidated search inputs debounced at 300ms, routing queries straight to backend indexes for fast server-side pagination and filtering.
- 🇮🇳 **Standardized Indian Rupee Currency**: Standardized currency formatting (`₹`) across all service prices, billing plans, and subscription charges.

---

## Module & Route Directory

| Route | View Component | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `/login` | `Login.jsx` | *Public* | Authentication portal with evaluator quick-fill chips. |
| `/dashboard` | `Dashboard.jsx` | `dashboard:view` | Operational overview: appointment status, active staff, metrics. |
| `/admin` | `AdminDashboard.jsx` | `dashboard:view` | System-wide admin dashboard and operational stats. |
| `/admin/salons` | `Salons.jsx` | `salons:view` | Salon management, geofence radius, and GPS coordinate calibration. |
| `/users` | `UserList.jsx` | `users:view` | User accounts, salon assignments, and role associations. |
| `/roles` | `RoleList.jsx` | `roles:view` | Role listings with user counts and action triggers. |
| `/roles/:id` | `RoleDetail.jsx` | `roles:view` | Interactive 10×5 Role & Permission Matrix editor. |
| `/appointments` | `Appointments.jsx` | `appointments:view` | Appointment bookings, status transitions, staff assignments. |
| `/attendance` | `Attendance.jsx` | `attendance:view` | Employee geofence check-ins, timestamps, and status logs. |
| `/clients` | `Clients.jsx` | `clients:view` | Customer catalog, contact details, and appointment histories. |
| `/staff` | `StaffList.jsx` | `staff:view` | Staff directory, role assignments, specialties, and contact info. |
| `/services` | `ServicesList.jsx` | `services:view` | Service catalog, category classification, pricing (₹), and duration. |
| `/subscription` | `Subscriptions.jsx` | `subscription:view` | Real-time salon subscription quota tracking, plan upgrades & renewals. |
| `/plans` | `Plans.jsx` | `plans:view` | Available subscription tiers, pricing, and feature limits. |
| `/admin/plans` | `Plans.jsx` | `plans:view` | Administrator plan catalog and tier configuration. |
| `/admin/subscription-history`| `Subscriptions.jsx` | `subscription:view` | Historical log of salon plan assignments and renewals. |
| `/403` | `Forbidden.jsx` | *Protected* | Dedicated unauthorized access screen. |

---

## Security & Dynamic RBAC

### 1. Permissions Hydration (`AuthContext`)
Upon successful login or page reload, the client hydrates the authenticated user profile and their associated permissions array via `/api/v1/auth/me`.

### 2. The `usePermission` Hook
UI elements dynamically hide or show based on individual module-action permissions:

```jsx
import { usePermission } from '../hooks/usePermission';

const AppointmentActions = () => {
  const { can } = usePermission();

  return (
    <>
      {can('appointments', 'create') && (
        <Button variant="contained" onClick={handleOpenCreate}>
          New Booking
        </Button>
      )}
      {can('appointments', 'delete') && (
        <IconButton color="error" onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      )}
    </>
  );
};
```

### 3. Route Guarding (`PermissionRoute`)
Prevents unauthorized direct URL access. If an employee attempts to navigate to `/roles` without `roles:view`, they are automatically redirected to `/403`:

```jsx
<Route
  path={ROUTES.ROLES.value}
  element={
    <PermissionRoute requiredPermission="roles:view">
      <RoleList />
    </PermissionRoute>
  }
/>
```

### 4. HTTP Interceptors (`httpClient`)
- **Bearer Token Injection**: Automatically appends `Authorization: Bearer <token>` to all outgoing requests.
- **401 Interceptor**: Clears local session storage and resets state when a token expires or is rejected.

---

## Enterprise Component System

All screens utilize standardized reusable components located in `src/components/common/`:

| Component | File Path | Highlights |
| :--- | :--- | :--- |
| **`AppModal`** | `src/components/common/AppModal.jsx` | Standardized dialog wrapper featuring a sticky header, close button (X), responsive body scrolling, and unified action footer. |
| **`DataTable`** | `src/components/common/DataTable.jsx` | Universal data table renderer with column configurations, empty state rendering, and sleek hover effects. |
| **`DebouncedSearchInput`** | `src/components/common/DebouncedSearchInput.jsx` | 300ms debounce input wrapper eliminating client lag and coordinating queries directly with the backend API. |
| **`SummaryCard`** | `src/components/common/SummaryCard.jsx` | Metric visualizer cards with icon slots, accent colors, and percentage trend indicators. |
| **`LoadingState`** | `src/components/common/LoadingState.jsx` | Centered loading spinner with custom label for async operations. |
| **`ErrorState`** | `src/components/common/ErrorState.jsx` | Clean error card with retry button callback support. |
| **`EmptyState`** | `src/components/common/EmptyState.jsx` | Informative empty screen with customizable illustration icon and call-to-action button. |

---

## Project Directory Structure

```text
salon_client_web/
├── .env.example             # Template for local environment variables
├── index.html               # Main HTML entry point
├── package.json             # Dependencies and project scripts
├── vercel.json              # Single-page application (SPA) routing configuration
├── vite.config.js           # Vite build and test runner configuration
└── src/
    ├── main.jsx             # React DOM root entry point
    ├── App.jsx              # Main routing tree and route guards
    ├── theme.js             # Material UI custom theme tokens & palette
    ├── api/                 # Domain-specific API service modules
    │   ├── appointmentsApi.js
    │   ├── attendanceApi.js
    │   ├── authApi.js
    │   ├── clientApi.js
    │   ├── plansApi.js
    │   ├── roleApi.js
    │   ├── salonsApi.js
    │   ├── servicesApi.js
    │   ├── staffApi.js
    │   ├── subscriptionApi.js
    │   └── userApi.js
    ├── components/
    │   ├── common/          # Reusable UI system (AppModal, DataTable, Search)
    │   └── layout/          # Application shell (Header, Sidebar, PageContainer)
    ├── config/              # Centralized configuration (ApiConfig, Navigation)
    ├── constants/           # Route definitions and system constants
    ├── context/             # React context providers (AuthContext)
    ├── hooks/               # Custom hooks (usePermission, useDebounce)
    ├── layouts/             # Dashboard shell layout wrapper
    ├── pages/               # Feature domain pages (Salons, Roles, Appointments, etc.)
    ├── routes/              # Route protection guards (ProtectedRoute, PermissionRoute)
    ├── services/            # Axios instance and shared client services
    ├── test/                # Vitest and React Testing Library suites
    └── utils/               # Formatting, date/time, and storage helpers
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Backend API**: Running on port `5001` (`salon_server`)

### Environment Configuration
Copy the `.env.example` file to create your local `.env`:

```bash
cp .env.example .env
```

Ensure the base API URL points to your running backend instance:
```env
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

### Installation & Scripts

```bash
# 1. Install dependencies
npm install

# 2. Run local development server (starts on http://localhost:5173)
npm run dev

# 3. Execute automated test suite
npm test

# 4. Build optimized production bundle
npm run build

# 5. Preview production build locally
npm run preview
```

---

## Evaluator Test Credentials

Dynamic users are seeded in the database. You can click the **quick-fill chips** on the `/login` screen to instantly populate these credentials:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@salon.com` | `Password01*` | Full system governance, salon onboarding, subscription tier management, dynamic permission matrix. |
| **Salon Owner** | `owner@salona.com` | `Password01*` | Salon operations, staff rosters, client records, appointment management, subscription renewal. |
| **Receptionist** | `receptionist@salona.com` | `Password01*` | Front-desk scheduling, client check-in, attendance verification, daily agenda. |

---

## Automated Testing Suite

The application is thoroughly verified using **Vitest** and **React Testing Library** (16 tests across 4 test suites):

```bash
npm test
```

### Test Suite Coverage

```text
✓ src/test/permissions.test.jsx (3 tests)
  - Grants access when exact permission is present in user array
  - Rejects access when permission is missing
  - Gracefully handles empty or unauthenticated user states

✓ src/test/storage.test.jsx (3 tests)
  - Validates persistent token and profile storage
  - Verifies local session cleanup on logout
  - Handles parsing anomalies securely

✓ src/test/navigation.test.jsx (5 tests)
  - Renders authorized navigation links according to permissions
  - Excludes forbidden menu items dynamically
  - Preserves public access paths
  - Handles super admin role overrides
  - Resolves next available permitted screen when dashboard:view is disabled

✓ src/test/Login.test.jsx (5 tests)
  - Renders application branding, email, password inputs, and submit button
  - Enforces button disabling until input fields are populated
  - Displays descriptive error alert on invalid credentials (401)
  - Displays account disabled alert when deactivated (403)
  - Interacts cleanly with quick-fill login chips
```

---

## Production & Deployment

### Production Build
Running `npm run build` generates a minified, tree-shaken static bundle in the `dist/` directory ready for deployment on static hosts (Vercel, Netlify, AWS S3 / CloudFront, Nginx).

### Single Page Application (SPA) Routing
Because the application relies on client-side routing (`BrowserRouter`), all route requests must be rewritten to `index.html`.

- **Vercel** (`vercel.json` included in repository):
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **Nginx Configuration**:
  ```nginx
  location / {
    try_files $uri $uri/ /index.html;
  }
  ```
