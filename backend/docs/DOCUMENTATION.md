# Hospital HRMS — Project Documentation

A full-stack **Hospital Human Resource Management System** (HRMS) for managing hospital
staff, departments, attendance, and leave. This document describes the actual state of
the codebase (backend + frontend) — architecture, modules, API, database, auth flow,
and how to run and extend it.

---

## 1. Overview

| Layer    | Tech stack |
|----------|------------|
| Backend  | Node.js, Express 4, Sequelize 6 ORM, MySQL 8, JWT auth (access + refresh), bcryptjs, Multer (uploads), Nodemailer, Joi (validation), Winston (logging), Helmet + CORS + rate limiter |
| Frontend | React 18 (Vite 5) + TypeScript, Tailwind CSS, shadcn-style UI (Radix primitives + `cva`/`tailwind-merge`), React Router 6, TanStack Query 5, React Hook Form + Zod, Recharts, Axios, lucide-react icons |
| Database | MySQL — 31 Sequelize migrations + seeders |

**Monorepo layout**

```
HRMS/
├── backend/    Express + Sequelize API          (port 5000)
├── frontend/   React SPA                         (port 5173, proxies /api → 5000)
└── README.md   quick-start guide
```

---

## 2. Feature status

### Fully implemented (real DB tables, API routes, and UI)

- **Auth** — login, logout, token refresh, forgot/reset password, `/auth/me`, RBAC middleware
- **Dashboard** — 10 stat cards, attendance trend, department/gender/leave charts, recent activity
- **Employees** — list (search / filter / pagination / CSV export), create, edit, detail view
  (education, experience, emergency contacts, documents), photo + document upload
- **Departments & Designations** — full CRUD
- **Attendance** — check-in / check-out, manual entry (HR/managers), filterable history, monthly report endpoint
- **Leave** — leave types, apply, department approval → HR approval workflow, rejection, cancellation, balances

### Scaffolded (DB schema + models exist; routes/UI are "Coming soon")

Payroll, Recruitment, Performance Reviews, Training, Assets, Notifications, Audit logs,
Permissions, Role permissions. The pages under `frontend/src/pages/` currently render
`ComingSoonPage.tsx`; extend them module-by-module (see §9).

---

## 3. Backend

### 3.1 Architecture

Layered request pipeline, one flow per module:

```
Express route  →  Joi validation middleware  →  controller  →  service  →  Sequelize model
                 (auth + authorize guards)      (thin HTTP)    (business logic)
```

- **Route** (`src/routes/*.js`) — declares the endpoint, method, guards (`auth`, `authorize`),
  validation middleware, and the controller handler.
- **Controller** (`src/controller/*.js`) — parses `req`, calls the service, shapes the JSON response
  using helpers from `src/helpers/response.js`. Thin by design.
- **Service** (`src/services/*.js`) — all business logic, validation of business rules,
  DB queries, and error throwing via `CustomErrorHandler`.
- **Model** (`models/*.js`) — one Sequelize model per table; associations declared inline on the
  child model (e.g. `Employee.belongsTo(Department)`). Both migration schema and runtime models live here.
- **Middleware** (`src/middlewares/`) — `auth` (JWT verify), `authorize` (role guard),
  `asyncHandler` (error forwarding), `rateLimiter`, and `validation/` Joi schemas.
- **Error handling** — services throw `CustomErrorHandler` (typed, with factory methods like
  `notFound()`, `forbidden()`, `validationError()`); the central `src/utils/errorHandler.js`
  normalizes Joi, Custom, and Sequelize errors into the standard envelope.

### 3.2 Directory tree

```
backend/
├── .env / .env.example        DB, JWT, SMTP config (single source of truth)
├── .sequelizerc                points sequelize-cli at config/config.js + root migrations/seeders/models
├── config/
│   ├── config.js               Sequelize CLI config (reads .env)
│   └── database.js             Sequelize instance used by the running app (reads .env)
├── migrations/                31 migration files, one per table
├── seeders/                   roles, departments, designations, leave types, shifts, demo users
├── models/                    31 Sequelize models + inline associations
├── public/uploads/            uploaded photos & documents (served at /uploads)
├── server.js                  entry point — DB connect + listen
└── src/
    ├── app.js                 Express app: CORS, helmet, rate limiter, static /uploads, routes, error handler, 404
    ├── config/
    │   ├── constant.js         re-exports .env vars
    │   ├── multerConfig.js      image (≤5 MB) & document (≤10 MB) upload config
    │   └── winstonLoggerConfig.js  console logger (dev) / daily-rotating file logger (prod)
    ├── constant/index.js       ROLES, role groups, status enums
    ├── controller/             thin HTTP layer per module
    ├── services/               business logic per module + jwtServices + emailServices
    ├── middlewares/
    │   ├── auth.js             verifies JWT access token, attaches req.user
    │   ├── authorize.js        role guard: authorize(...allowedRoles)
    │   ├── asyncHandler.js     wraps async handlers → next(err)
    │   ├── rateLimiter.js      in-memory sliding window (100 req / min / IP)
    │   └── validation/         Joi schemas per module
    ├── helpers/
    │   ├── response.js         standard response envelopes
    │   └── date.js             date helpers (today, date-only, days-between-inclusive)
    ├── routes/                 one router per module; mounted in src/app.js
    └── utils/
        ├── CustomErrorHandler.js   typed application errors
        └── errorHandler.js         central error normalizer
```

### 3.3 Roles & authorization

Roles are seeded with **fixed IDs 1–11** (`seeders/20260102000000-seed-roles.js`):

| ID | Role               |
|----|--------------------|
| 1  | `super_admin`      |
| 2  | `hr_manager`       |
| 3  | `hospital_admin`   |
| 4  | `department_head`  |
| 5  | `doctor`           |
| 6  | `nurse`            |
| 7  | `pharmacist`       |
| 8  | `lab_technician`   |
| 9  | `receptionist`     |
| 10 | `accountant`       |
| 11 | `employee`         |

Role **groups** (`src/constant/index.js`) centralize guard logic:

| Group | Members |
|-------|---------|
| `MANAGE_EMPLOYEE_ROLES`      | super_admin, hr_manager, hospital_admin |
| `MANAGE_ATTENDANCE_ROLES`    | + department_head |
| `HR_ROLES`                   | super_admin, hr_manager |
| `DEPARTMENT_APPROVAL_ROLES`  | department_head, super_admin, hr_manager |

Guards are applied as `authorize(...MANAGE_EMPLOYEE_ROLES)` inside the route definitions.

### 3.4 Authentication flow (JWT, no cookies)

1. `POST /api/auth/login` → verifies bcrypt password, returns `{ access_token, refresh_token, userInfo }`.
   Refresh tokens are **persisted** in the `refresh_tokens` table so they can be revoked.
2. The client stores the refresh token (frontend uses `localStorage` key `hrms_refresh_token`)
   and sends the access token as `Authorization: Bearer <token>`.
3. `POST /api/auth/refresh` with `{ refresh_token }` → validates the stored token, rotates it
   (old row destroyed, new pair issued), returns a fresh pair.
4. `POST /api/auth/logout` → deletes the refresh token row server-side.
5. `POST /api/auth/forgot-password` → issues a 1-hour reset link (hashed token stored on the user,
   plain token in the emailed URL). `POST /api/auth/reset-password` consumes it and invalidates
   all refresh tokens for that user.

Access token payload: `{ user_id, email, role, employee_id }`.

### 3.5 API reference

All responses use the envelope `{ status: boolean, message: string, data?: any }`.
Errors flow through the same shape via `errorHandler.js`. All routes except `/api/health`,
`/api/auth/login`, `/api/auth/refresh`, `/api/auth/forgot-password`, and `/api/auth/reset-password`
require a valid Bearer token.

#### Auth — `/api/auth`

| Method | Path             | Guard | Description |
|--------|------------------|-------|-------------|
| POST   | `/login`          | —     | Log in, returns access + refresh tokens |
| POST   | `/refresh`        | —     | Rotate refresh token, returns new pair |
| POST   | `/logout`         | auth  | Revoke refresh token |
| POST   | `/forgot-password`| —     | Email a reset link (silent if email unknown) |
| POST   | `/reset-password` | —     | Set new password with emailed token |
| GET    | `/me`             | auth  | Current user profile (+ role) |

#### Employees — `/api/employees`

| Method | Path                    | Guard | Description |
|--------|-------------------------|-------|-------------|
| GET    | `/`                     | auth  | List (search, `department_id`, `status`, `page`, `limit`), paginated |
| GET    | `/:id`                  | auth  | Detail incl. department, designation, role, contacts, documents, education, experience |
| POST   | `/`                     | manage-employee | Create employee (Joi validated, unique email) |
| PUT    | `/:id`                  | manage-employee | Update employee |
| DELETE | `/:id`                  | HR    | Delete employee |
| POST   | `/:id/photo`            | manage-employee | Upload profile photo (image, ≤5 MB) |
| POST   | `/:id/documents`        | manage-employee | Upload document (images/PDF/doc/docx, ≤10 MB) |
| POST   | `/:id/emergency-contacts` | manage-employee | Add emergency contact |
| POST   | `/:id/education`        | manage-employee | Add education record |
| POST   | `/:id/experience`       | manage-employee | Add experience record |

#### Departments — `/api/departments`

| Method | Path    | Guard | Description |
|--------|---------|-------|-------------|
| GET    | `/`     | auth  | List (search, `is_active`) |
| GET    | `/:id`  | auth  | Get one |
| POST   | `/`     | manage-employee | Create (unique name) |
| PUT    | `/:id`  | manage-employee | Update |
| DELETE | `/:id`  | HR    | Delete (blocked if employees assigned) |

#### Designations — `/api/designations`

| Method | Path    | Guard | Description |
|--------|---------|-------|-------------|
| GET    | `/`     | auth  | List (optional `department_id`) |
| POST   | `/`     | manage-employee | Create |
| PUT    | `/:id`  | manage-employee | Update |
| DELETE | `/:id`  | HR    | Delete |

#### Attendance — `/api/attendance`

| Method | Path            | Guard | Description |
|--------|-----------------|-------|-------------|
| POST   | `/check-in`     | auth  | Check in for today (marks `late` after 09:15) |
| POST   | `/check-out`    | auth  | Check out, computes overtime over 8 h |
| POST   | `/manual`       | manage-attendance | Manual entry (find-or-update by employee + date) |
| GET    | `/`             | auth  | List (`employee_id`, `department_id`, `start_date`, `end_date`, `status`, `page`, `limit`) |
| GET    | `/monthly-report` | auth | Status summary + records for a `month` + `year` |

#### Leave — `/api/leave`

| Method | Path                      | Guard | Description |
|--------|---------------------------|-------|-------------|
| GET    | `/types`                  | auth  | List leave types |
| POST   | `/types`                  | HR    | Create leave type |
| GET    | `/balances/:employeeId?`  | auth  | Leave balances (defaults to caller's employee) |
| POST   | `/`                       | auth  | Apply for leave (checks balance) |
| GET    | `/`                       | auth  | List (`employee_id`, `department_id`, `status`, paginated) |
| PATCH  | `/:id/department-approve` | department-approval | Set `dept_approved` |
| PATCH  | `/:id/hr-approve`         | HR    | Set `approved` + consume balance days |
| PATCH  | `/:id/reject`             | department-approval | Reject with reason |
| PATCH  | `/:id/cancel`             | auth  | Self-cancel (not allowed once approved) |

#### Dashboard — `/api/dashboard`

| Method | Path                       | Guard | Description |
|--------|----------------------------|-------|-------------|
| GET    | `/cards`                   | auth  | 10 stat counts (employees, today's presence, pending leave/payroll/recruitment/training, birthdays) |
| GET    | `/attendance-trend`        | auth  | Attendance counts grouped by date+status (last 14 days) |
| GET    | `/department-distribution` | auth  | Employee count per department |
| GET    | `/payroll-expense`         | auth  | Sum of net salary per month+year |
| GET    | `/gender-distribution`     | auth  | Employee count per gender |
| GET    | `/monthly-recruitment`     | auth  | Recruitment count per month+year |
| GET    | `/leave-statistics`        | auth  | Leave requests per status |
| GET    | `/recent-activity`         | auth  | New hires, approved leaves, recent attendance |

#### Misc

| Method | Path          | Description |
|--------|---------------|-------------|
| GET    | `/api/health` | Health check (no auth) |
| GET    | `/uploads/*`  | Static files served from `backend/public/uploads` |

### 3.6 Business rules worth knowing

- **Attendance check-in** before 09:15 ⇒ `present`, after ⇒ `late`; a second check-in for the day is rejected.
- **Check-out** requires a prior check-in; overtime minutes = hours beyond 8.
- **Manual attendance** uses find-or-create keyed on `(employee_id, date)`.
- **Leave application** validates remaining balance (`allocated + carried_forward − used`) and rejects if insufficient.
- **Leave workflow**: `pending → dept_approved → approved`. HR approval deducts days from the balance.
- **Leave cancellation** is blocked once approved.
- **Department delete** is blocked while employees are assigned.
- **Password reset links** expire after 1 hour; `forgot-password` always responds the same (no user enumeration).
- **Multer** limits: images ≤5 MB, documents ≤10 MB, stored locally under `public/uploads`.

---

## 4. Database

31 tables, created by `migrations/` and modeled by `models/`.

**Core / auth**
`roles`, `permissions`, `role_permissions`, `users`, `refresh_tokens`

**Employees**
`employees`, `departments`, `designations`, `emergency_contacts`, `documents`,
`employee_education`, `employee_experience`

**Attendance & shifts**
`attendance`, `shifts`, `employee_shifts`

**Leave**
`leave_types`, `leave_requests`, `leave_balances`

**Payroll**
`salary_components`, `payroll`, `deductions`, `bonuses`

**HR modules (scaffolded)**
`recruitment`, `interviews`, `performance_reviews`, `trainings`, `employee_trainings`,
`assets`, `asset_assignments`, `notifications`, `audit_logs`

Key enums used across tables:

- Employee status: `active | inactive | on_leave | terminated`
- Employment type: `full_time | part_time | contract | intern`
- Attendance status: `present | absent | half_day | late | on_leave | holiday`
- Leave status: `pending | dept_approved | approved | rejected | cancelled`

---

## 5. Frontend

### 5.1 Architecture

React SPA built with Vite, all logic split into:

- **Routing** — `src/routes/router.tsx` uses `createBrowserRouter`. Public routes (login, forgot/reset
  password), then a `ProtectedRoute` wrapper, a `Layout` (Sidebar + Topbar + `<Outlet />`), and a
  role-gated sub-tree (`/employees/new`, `/employees/:id/edit`, `/departments`, `/designations`)
  restricted to `super_admin | hr_manager | hospital_admin`.
- **Data fetching** — TanStack Query. Pages define `useQuery`/`useMutation` hooks that call the
  axios instance `api` (base URL `/api`), invalidating query keys on mutation success.
- **Auth state** — `AuthContext` holds the current user, `login`/`logout`, and `hasRole(...roles)`.
  On app boot it refreshes the token and fetches `/auth/me` if a refresh token exists.
- **HTTP client** — `src/lib/api.ts`: axios instance, in-memory access token, refresh token in
  `localStorage`, and a response interceptor that silently refreshes once on 401 and retries the
  original request, redirecting to `/login` on failure.
- **Forms** — React Hook Form + Zod resolver (used in `EmployeeFormPage`).
- **Theming** — `ThemeContext` toggles a `dark` class on `<html>`; preference persisted in `localStorage`.
- **Styling** — Tailwind with a shadcn-style design system (`components/ui/*`), CSS variables in `styles/globals.css`.

### 5.2 Directory tree

```
frontend/
├── index.html, vite.config.ts      Vite dev server + proxy /api & /uploads → :5000
├── tailwind.config.ts, postcss.config.js
└── src/
    ├── main.tsx / App.tsx           Providers: QueryClient → Theme → Auth → Router
    ├── components/
    │   ├── layout/       Layout, Sidebar (role-filtered nav), Topbar (breadcrumbs, theme, logout)
    │   ├── common/       PageHeader, EmptyState, Pagination, ProtectedRoute
    │   ├── dashboard/    StatCard
    │   └── ui/           button, card, input, label, select, badge, skeleton (shadcn-style)
    ├── context/          AuthContext, ThemeContext
    ├── lib/              api.ts (axios + silent refresh), utils.ts (cn, formatDate, initials, …)
    ├── pages/            auth/, employees/, departments/, designations/, attendance/, leave/, dashboard, ComingSoon, NotFound
    ├── routes/router.tsx role-gated route tree
    ├── styles/globals.css
    └── types/index.ts    shared TypeScript interfaces (Role, Employee, Attendance, Leave, Dashboard, …)
```

### 5.3 Routes

| Path | Page | Access |
|------|------|--------|
| `/login`, `/forgot-password`, `/reset-password` | Auth pages | public |
| `/dashboard` | DashboardPage | any authenticated user |
| `/employees` | EmployeeListPage | any authenticated user |
| `/employees/:id` | EmployeeDetailsPage | any authenticated user |
| `/employees/new`, `/employees/:id/edit` | EmployeeFormPage | super_admin, hr_manager, hospital_admin |
| `/departments`, `/designations` | CRUD pages | super_admin, hr_manager, hospital_admin |
| `/attendance` | AttendancePage | any authenticated user |
| `/leave` | LeavePage | any authenticated user |
| `/shifts`, `/payroll`, `/recruitment`, `/performance`, `/training`, `/assets`, `/notifications`, `/reports`, `/settings`, `/profile` | ComingSoonPage | any authenticated user (role hints in sidebar) |
| `*` | NotFoundPage | — |

Note: `src/pages/shifts/shifts.tsx` is an empty placeholder file; the `/shifts` route uses
`ComingSoonPage` instead.

---

## 6. Configuration & environment

Create `.env` from `.env.example` (single source of truth for the running app, the Sequelize CLI,
and the Vite proxy target):

```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=Hospital
DB_PORT=3307

JWT_SECRET=THISISACCESSSECRET
JWT_EXPIRY=15m
REFRESH_SECRET=THISISREFRESHSECRET
REFRESH_EXPIRY=7d

REACT_APP_URL=http://localhost:5173
REACT_ADMIN_APP_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="Hospital HRMS <no-reply@hospitalhrms.com>"
```

- If `SMTP_USER` is empty, emails are **logged to the console** instead of sent.
- The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`.

---

## 7. Getting started

### Backend

```bash
cd backend
cp .env.example .env      # edit DB credentials, JWT secrets, SMTP
npm install
npx sequelize db:migrate  # or npm run sequelize:migrate
npx sequelize db:seed:all # or npm run sequelize:seed
npm run dev               # http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### Demo accounts (seeded)

- `admin@hospitalhrms.com` / `Admin@12345` — Super Admin
- `hr@hospitalhrms.com` / `Hr@12345678` — HR Manager

### Useful scripts

| Backend | Frontend |
|---------|----------|
| `npm run dev` — nodemon | `npm run dev` — Vite dev server |
| `npm start` — node | `npm run build` — `tsc -b && vite build` |
| `npm run sequelize:migrate` | `npm run lint` — ESLint |
| `npm run sequelize:migrate:undo` | `npm run preview` |
| `npm run sequelize:seed` | |

> There are extra seeder files (`20260712071042-demo-employees-and-users.js`,
> `20260730091306-demo-employees-and-users.js`) alongside the original six. They are near-duplicate
> demo-user seeders; the canonical set is the `2026010200000X-*` files.

---

## 8. Code conventions

- **Response envelope** — every endpoint returns `{ status, message, data? }` (see
  `src/helpers/response.js` for `SUCCESS_API_FETCH`, `DATA_SAVED`, `DATA_UPDATED`, `DATA_DELETED`, `LOGOUT`, `PASSWORD_UPDATED`).
- **Errors** — throw `CustomErrorHandler.<factory>(message)` in services; Joi errors and Sequelize
  errors are normalized centrally in `src/utils/errorHandler.js`.
- **Layering** — controllers must not contain business logic; services must not shape HTTP responses.
- **Enums** — statuses/roles are centralized in `backend/src/constant/index.js` and referenced by
  services, controllers, validation, and seeders.
- **Frontend** — pages use TanStack Query for data and shared `components/ui/*` primitives; typed
  contracts live in `src/types/index.ts`.

---

## 9. Extending a scaffolded module (example: Payroll)

1. **Backend service** — add `src/services/payrollServices.js` (`Payroll`, `SalaryComponent`,
   `Deduction`, `Bonus` models already exist).
2. **Backend controller** — add `src/controller/payrollController.js` following
   `attendanceController.js` as a template.
3. **Validation** — add `src/middlewares/validation/payrollValidation.js` with a Joi schema.
4. **Routes** — add `src/routes/payrollRoutes.js`, export it from `src/routes/index.js`,
   and mount it in `src/app.js` (`app.use('/api/payroll', payrollRoutes)`).
5. **Frontend page** — create `pages/payroll/PayrollPage.tsx` following `AttendancePage.tsx`
   (query + mutation + table), then swap the `ComingSoonPage` for it in `src/routes/router.tsx`
   and add a nav item in `components/layout/Sidebar.tsx`.

---

## 10. Security & production readiness

- Passwords hashed with **bcrypt** (auto-hash on save via model hook).
- **JWT access tokens** (15 min default) + **rotating refresh tokens** stored server-side
  (`refresh_tokens`) so they can be revoked on logout.
- **Helmet**, **CORS** (explicit origin allow-list), and a per-IP **rate limiter**
  (100 req/min) enabled in `app.js`.
- Joi validation on all mutating endpoints; RBAC guards on restricted routes.
- `forgot-password` never reveals whether an email is registered.
- **Uploads** are stored locally under `backend/public/uploads` — swap for S3/Cloud Storage before production.
- **Before deploying**: change `JWT_SECRET`/`REFRESH_SECRET`, set `NODE_ENV=production`
  (enables file-based logging, disables verbose error messages), and serve behind HTTPS.
- The frontend stores the refresh token in `localStorage` (XSS surface) — consider an
  httpOnly cookie strategy or `httpOnly` + `secure` storage for stricter production hardening.
