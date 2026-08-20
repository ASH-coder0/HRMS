# Hospital HRMS

A full-stack Hospital Human Resource Management System.

- **Backend**: Node.js, Express, Sequelize, MySQL, JWT auth (access + refresh tokens), RBAC, Multer uploads, Nodemailer.
- **Frontend**: React (Vite) + TypeScript, Tailwind CSS, shadcn-style components, React Router, TanStack Query, React Hook Form + Zod, Recharts, Axios.

## What's fully built vs. scaffolded

To keep this genuinely working end-to-end rather than a shallow shell over 15 modules, the following are **fully implemented** (real DB tables, API, and UI):

- Authentication: login, logout, refresh tokens, forgot/reset password, RBAC middleware
- Dashboard: stat cards + attendance trend, department, gender, leave charts, recent activity
- Employee Management: list (search/filter/pagination/CSV export), create, edit, details (education, experience, emergency contacts, documents), photo/document upload
- Departments & Designations: full CRUD
- Attendance: check-in/check-out, manual entry (HR/managers), filterable history, monthly report endpoint
- Leave Management: leave types, apply, department approval → HR approval workflow, rejection, cancellation, balances

The **database schema covers every table in the original spec** (payroll, recruitment, performance, training, assets, notifications, audit logs, etc.) — see `backend/src/models/`. Their pages currently render a "Coming soon" placeholder (`frontend/src/pages/ComingSoonPage.tsx`) so you can extend them module-by-module using the same pattern as Employees/Attendance/Leave (controller → route → React Query hook → page).

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env   # edit DB credentials, JWT secrets, SMTP if you want real emails
npm install
npm run db:sync        # creates/updates all MySQL tables from the Sequelize models
npm run db:seed        # seeds roles, departments, designations, leave types, shifts, and 2 demo users
npm run dev             # starts the API on http://localhost:5000
```

Demo logins created by the seeder:
- `admin@hospitalhrms.com` / `Admin@12345` (Super Admin)
- `hr@hospitalhrms.com` / `Hr@12345678` (HR Manager)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev             # starts on http://localhost:5173, proxies /api to the backend
```

Open http://localhost:5173 and sign in with a demo login above.

## Project structure

```
backend/
  src/
    config/        Sequelize DB connection
    models/         27 Sequelize models (see below) + associations in index.js
    middleware/      auth (JWT), rbac (role guard), upload (Multer), error handling
    controllers/     business logic per module
    routes/          Express routers per module, mounted in routes/index.js
    utils/           JWT signing, email sending, API response helpers, DB sync script
    seeders/         initial roles/departments/demo users
frontend/
  src/
    components/      layout (Sidebar/Topbar/Layout), ui (button/card/input/…), dashboard, common
    context/          AuthContext (JWT/session), ThemeContext (dark/light)
    lib/              axios client with silent refresh, utils
    pages/            one folder per module
    routes/           React Router route tree with role-gated routes
    types/             shared TypeScript interfaces
```

## Database tables

users, roles, permissions, role_permissions, employees, departments, designations,
attendance, shifts, employee_shifts, leave_types, leave_requests, leave_balances,
payroll, salary_components, deductions, bonuses, performance_reviews, trainings,
employee_trainings, recruitment, interviews, assets, asset_assignments, documents,
employee_education, employee_experience, emergency_contacts, notifications, audit_logs.

## Extending a "coming soon" module (example: Payroll)

1. **Backend**: add `backend/src/controllers/payrollController.js` (the `Payroll`, `SalaryComponent`,
   `Deduction`, `Bonus` models already exist), wire it up in `backend/src/routes/payrollRoutes.js`,
   and mount it in `backend/src/routes/index.js`.
2. **Frontend**: create `frontend/src/pages/payroll/PayrollPage.tsx` following the same shape as
   `AttendancePage.tsx` (TanStack Query for fetching, a form/modal for creating records, a table for listing).
3. Swap the `ComingSoonPage` for your new page in `frontend/src/routes/router.tsx`.

## Notes on security & production readiness

- Passwords are hashed with bcrypt; access tokens are short-lived JWTs, refresh tokens are httpOnly cookies.
- Rate limiting and Helmet are enabled by default in `backend/src/app.js`.
- File uploads are stored locally under `backend/uploads` — swap for S3/Cloud Storage before production.
- Nodemailer will just log emails to the console until you set real SMTP credentials in `.env`.
- Before deploying: change `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, set `NODE_ENV=production`, and put the app behind HTTPS.

## economic-year ✔
## payroll 