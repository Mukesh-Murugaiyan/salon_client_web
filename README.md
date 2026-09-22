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
5. **Client Management (`/clients`) — Ticket 4**:
   - Client directory with search (name, phone, email) and gender filtering.
   - Add/Edit Client dialogs with form validation and duplicate phone detection.
   - Client profile dialog with client notes and timestamps.
   - Delete confirmation with soft-delete semantics.
6. **Staff Management (`/staff`) — Ticket 5**:
   - Staff directory with search (name, phone, specialization) and role/title filter tabs.
   - Add/Edit Staff dialogs with standardized salon job titles (Senior Stylist, Colorist, Barber, etc.) and multi-select specialization tags.
   - Detailed Staff profile modal with service specializations, contact cards, and employment status.
   - One-click Activate / Deactivate status toggle.
   - Soft delete staff member.
   - Strict domain boundary: Staff service providers are independent of user login accounts.
   - Permission-governed controls (`staff:view`, `staff:create`, `staff:update`, `staff:delete`).
7. **Service Management (`/services`) — Ticket 6**:
   - Services directory with search (name, description) and status filter tabs (All, Active, Inactive).
   - Dynamic summary metrics (Total Services, Active, Inactive, Average Price).
   - Add/Edit Service dialogs with positive duration and non-negative price validation.
   - Detailed Service profile modal with duration, price, active state, and audit dates.
   - Duplicate active service name guard per company.
   - One-click Activate / Deactivate status toggle.
   - Soft delete service with confirmation prompt.
   - Zero hardcoded services: 100% database-driven and isolated to the authenticated company.
   - Permission-governed controls (`services:view`, `services:create`, `services:update`, `services:delete`).
8. **Appointment Management (`/appointments`) — Ticket 7**:
   - Interactive salon booking management with calendar-style table and date/staff/status filtering.
   - Dynamic summary metrics (Total Bookings, Confirmed, Completed, Cancelled).
   - Dynamic loading of active Clients, Staff, and Services from server APIs.
   - Add/Edit Appointment dialogs with business hours validation (09:00–20:00) and auto-calculated end times based on selected service durations.
   - Staff overlap conflict detection preventing duplicate active bookings on the same staff member and date.
   - Cancelled appointments do not block staff scheduling.
   - Status transition menu (Confirmed, Pending, Completed, Cancelled).
   - Detailed Appointment overview modal with client, service, staff, and schedule information.
   - Permission-governed controls (`appointments:view`, `appointments:create`, `appointments:update`, `appointments:delete`).
9. **Plan Management (`/plans`, `/admin/plans`) — Ticket 8**:
   - SaaS subscription tier directory with pricing, duration in days, max staff limits, and max appointment limits.
   - Add/Edit Plan dialog with field validation and duplicate name prevention.
   - View Plan details modal.
   - Activate / Deactivate plan toggle.
   - Permission-governed controls (`plans:view`, `plans:create`, `plans:update`, `plans:delete`).
10. **Subscription Management (`/subscription`) — Ticket 8**:
   - Real-time subscription overview: Active plan tier, price, cycle dates, and remaining days.
   - Live Quota Usage progress bars:
     - Staff member utilization (`staffCount / maxStaff`).
     - Appointment bookings utilization (`appointmentsCount / maxAppointments`).
   - Assign Plan, Renew Subscription, and Upgrade Plan modals.
   - Subscription Audit History table displaying plan tier, price, coverage dates, action (`ASSIGN`, `RENEW`, `UPGRADE`), and timestamp.
   - Strict expiration gating: When a subscription expires, gated operational actions (registering staff, booking appointments) are blocked with exact server error feedback.
   - Permission-governed controls (`subscription:view`, `subscription:assign`, `subscription:renew`, `subscription:upgrade`, `subscription:history`).
11. **Attendance & Geo-Fencing Check-In (`/attendance`) — Ticket 9**:
   - Live digital clock and today's check-in status card.
   - Device GPS geolocation integration (`navigator.geolocation.getCurrentPosition`).
   - Proximity validation: Server Haversine formula verifies device coordinates against configured salon coordinates.
   - Instant status feedback:
     - Valid check-in: Success message with timestamp, distance from salon, and Present badge.
     - Out-of-range: Clear error notification (`OUT_OF_RANGE` 403) explaining proximity vs allowed radius.
     - Duplicate prevention: Displays already checked-in state and timestamp, preventing multiple check-ins on the same day.
   - Salon Geo-Fence Configuration Dialog (Admins/Managers):
     - View and configure salon latitude, longitude, and allowed radius in meters.
     - One-click "Use My Current Device Location" button for salon calibration.
   - Company Attendance History Logs (Users with `attendance:view`):
     - Search by employee name/email and filter by date.
     - Displays employee profile, date, check-in time, distance from salon, coordinates, and status.
   - Permission-governed controls (`attendance:check_in`, `attendance:view`, `companies:update`).

---

## 4. Initial Seed Credentials

To log in immediately after clean database seeding:
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Assigned Role**: `Super Admin` (Company: `Demo Company`)
- **Granted Permissions**: Full platform permissions (`users:*`, `roles:*`, `appointments:*`, `clients:*`, `dashboard:*`, etc.)
