# Salon ERP — Web Client Application
## Ticket 3: Dynamic Company, Role, User & Permission Management

Modern React client built with Material UI (MUI), Vite, and Axios for the multi-tenant Salon ERP SaaS platform. Under **Ticket 3**, the web client features a 100% database-driven dynamic RBAC architecture.

---

## 1. Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server (Vite on http://localhost:5173)
npm run dev

# Production build
npm run build
```

---

## 2. Dynamic Permission Architecture

### Hierarchy
```text
Company
   ↓
 Role
   ↓
 User
   ↓
Role Permissions
   ↓
UI Navigation & Page Access
```

### Core Components & Hooks:
- **`usePermission()` Hook (`src/hooks/usePermission.js`)**:
  Exposes `can(module, action)` and `hasPermission(permissionString)` for conditional UI rendering (action buttons, tabs, tables).
- **`PermissionRoute` Guard (`src/routes/PermissionRoute.jsx`)**:
  Protects frontend routes based on dynamic database permissions (e.g. `users:view`, `roles:view`, `dashboard:view`).
- **Dynamic Sidebar Navigation (`src/components/layout/Sidebar.jsx`)**:
  Filters navigation items dynamically against the logged-in user's assigned permissions.

---

## 3. Key Pages & Features

1. **User Management (`/users`)**:
   - Lists company users with assigned roles, account status, and registration date.
   - Modal to create and edit users with dynamic Role dropdown fetched from `/api/v1/roles`.
   - Account status toggle (activate/deactivate).
2. **Role Management (`/roles`)**:
   - Lists company roles with description, status, and live user counts.
   - Modal to create and edit roles.
   - Direct navigation to interactive Permission Matrix.
3. **Role Detail & Permission Matrix (`/roles/:id`)**:
   - Interactive matrix table with checkboxes for each action (`view`, `create`, `update`, `delete`) across modules (`users`, `roles`, `appointments`, `clients`, `subscription`, `dashboard`, `plans`, `companies`).
   - Module-level row toggles ("Select Row", "Clear Row") and global toggles ("Select All", "Clear All").
   - Instant persistence to MongoDB via `PUT /api/v1/roles/:id/permissions`.
   - Dedicated tab listing all users assigned to this role.
4. **Permission-Driven Operational Dashboard (`/dashboard`)**:
   - Live metrics (Today's appointments, confirmed bookings, active clients, company users).
   - Module quick links rendered dynamically based on authorized permissions.

---

## 4. Initial Seed Credentials

To log in immediately after clean database seeding:
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Assigned Role**: `Super Admin` (Company: `Demo Company`)
- **Granted Permissions**: Full platform permissions (`users:*`, `roles:*`, `appointments:*`, `clients:*`, `dashboard:*`, etc.)
