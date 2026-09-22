# Salon ERP — Web Client Application
## Ticket 1: Authentication & Role-Based Navigation Foundation

Modern React client built with Material UI (MUI), Vite, and Axios for the multi-tenant Salon ERP SaaS platform.

---

## 1. Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev

# Run automated tests
npm test

# Production build
npm run build
```

---

## 2. Architecture & Modules

- **API Client (`src/services/httpClient.js`)**:
  - Centralized Axios instance with base URL from `VITE_API_BASE_URL`.
  - Automatically attaches `Authorization: Bearer <token>` to outgoing requests.
  - Automatically clears local token and triggers re-authentication on `401 Unauthorized`.
- **Token Storage (`src/utils/storage.js`)**:
  - Encapsulates token retrieval, storage, and clearance behind an isolated abstraction.
- **Auth Context (`src/context/AuthContext.jsx`)**:
  - Automatically restores user session on mount via `GET /api/auth/me`.
  - Exposes `user`, `token`, `isAuthenticated`, `isLoading`, `login`, and `logout`.
- **Routing & Route Protection**:
  - `src/routes/ProtectedRoute.jsx`: Redirects unauthenticated users to `/login`.
  - `src/routes/RoleRoute.jsx`: Restricts route navigation by role.
  - `src/routes/navigation.js`: Centralized role-aware navigation configuration and default dashboard router.
- **Layout & Shell (`src/layouts/DashboardLayout.jsx`)**:
  - Responsive AppBar and navigation Drawer with role-specific menu items and tenant context badge.

---

## 3. Demo Credentials

Quick login buttons are available directly on the login card for convenience during testing:
- **SUPER_ADMIN**: `admin@saloncrm.com` / `Admin@123` (Redirects to `/admin`)
- **OWNER**: `owner@saloncrm.com` / `Owner@123` (Redirects to `/dashboard`)
- **RECEPTIONIST**: `receptionist@saloncrm.com` / `Receptionist@123` (Redirects to `/dashboard`)
