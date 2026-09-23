# Salon ERP Web Portal — Production-Grade React Architecture

A modern, responsive web application built with **React 18, Vite, and Material UI (MUI)** for the multi-tenant Salon ERP / CRM platform. The web portal features **dynamic database-driven RBAC**, **reusable enterprise UI components**, **server-side debounced search**, **resilient GPS/Wi-Fi geolocation calibration**, and **real-time subscription quota tracking**.

---

## 1. System Architecture & Component Design

```text
                               ┌─────────────────────────┐
                               │   Vite Dev / Prod Host  │
                               │   (http://localhost:5173│
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │       App.jsx Root      │
                               └────────────┬────────────┘
                                            │
                ┌───────────────────────────┴───────────────────────────┐
                ▼                                                       ▼
  ┌───────────────────────────┐                           ┌───────────────────────────┐
  │   AuthContext Provider    │                           │   ThemeContext Provider   │
  │ - Token & Profile State   │                           │ - Material UI Custom Theme│
  │ - Permissions Hydration   │                           │ - Clean Layout & Tokens   │
  └─────────────┬─────────────┘                           └─────────────┬─────────────┘
                │                                                       │
                └───────────────────────────┬───────────────────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │      BrowserRouter      │
                               └────────────┬────────────┘
                                            │
         ┌──────────────────────────────────┴──────────────────────────────────┐
         ▼                                                                     ▼
┌──────────────────┐                                                ┌──────────────────┐
│   Public Route   │                                                │  Protected Route │
│  - /login        │                                                │ - PageContainer  │
│  - Quick Chips   │                                                │ - Dynamic Sidebar│
└──────────────────┘                                                └────────┬─────────┘
                                                                             │
                      ┌──────────────────────────────────────────────────────┴──────────────────────────────────────┐
                      ▼                                                      ▼                                      ▼
       ┌──────────────────────────────┐                       ┌──────────────────────────────┐       ┌──────────────────────────────┐
       │     PermissionRoute Guard    │                       │     Reusable UI Components   │       │     Domain Pages & Modals    │
       │ - Evaluates `can(mod, act)`  │                       │ - AppModal (Sticky Header)   │       │ - Salons & Geofence Settings │
       │ - Restricts route navigation │                       │ - DataTable (Universal)      │       │ - Users & Roles Matrix       │
       │ - Redirects to /unauthorized │                       │ - DebouncedSearchInput       │       │ - Clients, Staff, Services   │
       └──────────────────────────────┘                       └──────────────────────────────┘       │ - Appointments & Calendar    │
                                                                                                     │ - Plans, Subs & Attendance   │
                                                                                                     └──────────────────────────────┘
```

---

## 2. Architectural Deep Dive: How the Web Portal Works with Backend & Mobile

### 1. Dynamic Database-Driven RBAC (`usePermission`)
The web application does **not** rely on hardcoded role strings like `admin` or `receptionist` to control UI access:
- **Permission Hydration**: On login or page refresh, `/api/v1/auth/me` returns the user's populated permissions array (e.g. `["appointments:create", "appointments:view", "roles:update"]`).
- **`usePermission()` Hook**: Components call `can(module, action)` to conditionally render action buttons, tabs, or table action columns:
  ```jsx
  const { can } = usePermission();
  {can('appointments', 'create') && (
    <Button variant="contained" onClick={handleOpenCreate}>Book Appointment</Button>
  )}
  ```
- **Dynamic Navigation Sidebar**: The sidebar filters menu links against active user permissions. If an employee lacks `roles:view`, the "Roles & Permissions" link is completely hidden from their navigation.
- **`PermissionRoute` Guard**: Directly protects URL navigation. Attempting to enter `/roles` directly without `roles:view` permission safely redirects the user.

### 2. Interactive Role & Permission Matrix (`/roles/:id`)
- **Granular Matrix**: Displays modules (`users`, `roles`, `clients`, `staff`, `services`, `appointments`, `plans`, `subscription`, `attendance`, `dashboard`) across actions (`view`, `create`, `update`, `delete`, `check_in`).
- **Interactive Toggles**: Includes row-level toggles ("Select Row", "Clear Row") and global toggles ("Select All", "Clear All").
- **Sticky Matrix Header**: The action header remains sticky during long scrolls for seamless evaluation.
- **Live Persistence**: Saves directly to MongoDB via `PUT /api/v1/roles/:id/permissions` and immediately refreshes the role's assigned capabilities.

### 3. Enterprise Reusable UI Component Architecture
To ensure high maintainability and consistent user experience, repetitive modal, table, and search logic has been consolidated:
- **`AppModal` (`src/components/common/AppModal.jsx`)**:
  - Reusable wrapper for all dialogs across the app (Create Salon, Add Staff, Reschedule Appointment, Plan Assignment).
  - Features a **sticky header**, top-right **Close (X) icon**, standardized action button bar, and clean scrolling container.
- **`DataTable` (`src/components/common/DataTable.jsx`)**:
  - Unified table renderer with custom column definitions, empty states, and responsive styling.
- **`DebouncedSearchInput` (`src/components/common/DebouncedSearchInput.jsx`)**:
  - Replaces fragmented client-side filtering with a reusable 300ms debounced input.
  - Dispatches search values to the backend server to perform query matching at the database level.

### 4. Salon Calibration & Resilient Geolocation (`Salons.jsx`)
- **Dual-Tier Geolocation**: On desktop laptops and macOS environments where hardware GPS chips are absent, calling `getCurrentPosition` with `enableHighAccuracy: true` triggers `Position update is unavailable`.
- **Automatic Fallback Strategy**:
  1. First attempts browser geolocation with `{ enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }` to retrieve Wi-Fi / network position.
  2. If the OS location service is disabled, times out, or errors, it automatically falls back to an IP geolocation service (`ipwho.is`) to instantly populate coordinates.
  3. Displays a loading spinner inside the "Use My Current Device Location" button for immediate visual feedback.

### 5. Subscription Gating & Live Quota Visuals (`/subscription`)
- **Live Utilization Progress Bars**:
  - Staff quota: Visualizes `staffCount / maxStaff`.
  - Appointment quota: Visualizes `appointmentsCount / maxAppointments`.
- **Server Gating Visuals**: When a salon subscription expires, attempts to create staff or book appointments display clear server-provided error banners without crashing.
- **Plan Modals**: Modals for Plan Assignment, Renewal, and Tier Upgrade with immutable audit trail display.

### 6. Currency Standardization
- All prices, salon service rates, and subscription tier costs are formatted uniformly with the Indian Rupee symbol (**₹**).

---

## 3. Evaluator Test Credentials (Pre-Configured)

> **NOTE**: Dynamic users are pre-configured in the database. Use the quick-fill chips on the Login screen to test each role instantly:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@salon.com` | `Password01*` | System-wide admin, salon onboarding, subscription plans, dynamic permission matrix. |
| **Owner** | `owner@ecity.com` | `Password01*` | Salon operations, staff management, client catalog, appointment scheduling, subscription renewals. |
| **Receptionist** | `receptionist@ecity.com` | `Password01*` | Front-desk scheduling, client records, GPS attendance check-in, today's appointments. |

---

## 4. Setup & Running the Web Portal

### Prerequisites
- Node.js (v18+)
- Backend service running on port `5001` (`salon_server`)

### Installation & Execution
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
# Portal opens at http://localhost:5173

# Production build & preview
npm run build
npm run preview
```

---

## 5. Automated Test Suite (15 Tests)

Execute the automated test suite powered by Vitest and React Testing Library:
```bash
npm test -- --run
```

### Verified Test Suites:
1. `src/test/Login.test.jsx` (5 tests):
   - Renders application branding, email input, password input, and submit button.
   - Disables submit button on empty inputs; enables upon input entry.
   - Shows server error alert on invalid credentials (`401 INVALID_CREDENTIALS`).
   - Shows friendly error alert on disabled accounts (`403 ACCOUNT_DISABLED`).
2. `src/test/permissions.test.jsx` (3 tests):
   - Grants access when exact permission is present in user array.
   - Rejects access when permission is missing.
   - Gracefully handles empty or unauthenticated user states.
3. `src/test/navigation.test.jsx` (4 tests):
   - Renders allowed navigation links based on user permissions.
   - Hides restricted routes when permissions are absent.
4. `src/test/storage.test.jsx` (3 tests):
   - Validates secure storage and clearing of auth tokens and profiles.
