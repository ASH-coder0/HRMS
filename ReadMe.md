## Hospital HRMS Backend

Layered Express + Sequelize + MySQL API: `routes -> validation -> controller -> service -> model`.

## Sequelize commands

1. **npx sequelize db:migrate** — runs all migration files and creates the tables in MySQL.
2. **npx sequelize db:seed:all** — inserts roles, departments, designations, leave types, shifts, and 2 demo users.
3. **npx sequelize-cli migration:generate --name filename** — creates a new migration file.
4. **npx sequelize-cli seed:generate --name filename** — creates a new seeder file.
5. **npm run dev** — runs the application with nodemon.
6. DB credentials live in **one place**: `.env`. Both the running app (`config/database.js`) and the
   Sequelize CLI (`config/config.js`, wired up via `.sequelizerc`) read from it — no need to duplicate
   credentials in two config files.

## Verified end-to-end

This exact codebase was migrated, seeded, and exercised against a real database (all 31 migrations +
6 seeders run clean) with live requests through the actual Express app: health check, login
(right/wrong password), `/auth/me`, `/auth/refresh`, employee list/create (with Joi validation errors),
department list, attendance check-in, leave types, dashboard cards, an unauthorized request (401), and
a blocked business-rule delete (400). Swap `config/database.js` to point at your real MySQL instance and
it behaves identically — the app has no other database-specific code paths.

## Project structure

```
backend/
  .env / .env.example         DB, JWT, SMTP config (single source of truth)
  .sequelizerc                 tells sequelize-cli to use config/config.js and root migrations/seeders/models
  config/
    config.js                  Sequelize CLI config, reads from .env
    database.js                 Sequelize instance used by the running app, reads from .env
  migrations/                  one file per table (31 total)
  seeders/                     roles, departments, designations, leave types, shifts, 2 demo users
  models/                      one Sequelize model per table; associations declared inline (child -> parent)
  public/uploads/              uploaded photos & documents served at /uploads
  server.js                    entry point: connects DB, starts Express
  src/
    app.js                     Express app: cors, helmet, rate limiter, routes, error handler, 404
    config/
      constant.js               re-exports .env vars
      multerConfig.js            image/document upload storage config
      winstonLoggerConfig.js     console logger in dev, daily rotating file logger in production
    constant/index.js           ROLES, status enums, and role-group constants shared across the app
    controller/                 thin HTTP layer: parse req -> call service -> shape response
    services/                   business logic, one file per module + jwtServices + emailServices
    middlewares/
      auth.js                    verifies the JWT access token, attaches req.user
      authorize.js                role guard, e.g. authorize(ROLES.HR_MANAGER)
      asyncHandler.js              wraps async route handlers, forwards errors to next()
      rateLimiter.js                simple in-memory sliding-window limiter
      validation/                  one Joi schema file per module
    helpers/
      response.js                  SUCCESS_API_FETCH / DATA_SAVED / DATA_UPDATED / DATA_DELETED envelopes
      date.js                       date helpers used across services
    utils/
      CustomErrorHandler.js         typed application error with static factory methods (notFound, forbidden, ...)
      errorHandler.js                central Express error handler (Joi + CustomErrorHandler + Sequelize errors)
    routes/                       one Express router per module, mounted under /api/<module> in app.js
```

## What's fully wired up vs. scaffolded

**Fully implemented** (routes, validation, controller, service, and UI in the frontend):
- Auth: login, logout, refresh (refresh token returned in the JSON body and re-sent by the client — no cookies),
  forgot/reset password, `/me`
- Employees: full CRUD, search/filter/pagination, photo & document upload, emergency contacts, education, experience
- Departments & Designations: full CRUD
- Attendance: check-in/check-out, manual entry, filterable history, monthly report
- Leave: types, apply, department approval -> HR approval workflow, rejection, cancellation, balances
- Dashboard: all stat cards + attendance/department/gender/leave/recruitment chart data + recent activity

**Schema exists, not wired to routes yet** (models + migrations only — same pattern as everything above,
just extend `services/` -> `controller/` -> `routes/` -> a frontend page):
payroll, salary_components, deductions, bonuses, recruitment, interviews, performance_reviews,
trainings, employee_trainings, assets, asset_assignments, notifications, audit_logs, permissions,
role_permissions.

## Getting started

```bash
cp .env.example .env      # edit DB credentials, JWT secrets, SMTP if you want real emails
npm install
npx sequelize db:migrate
npx sequelize db:seed:all
npm run dev                # http://localhost:5000
```

Demo logins seeded by `20260102000005-seed-demo-employees-and-users.js`:
- `admin@hospitalhrms.com` / `Admin@12345` (Super Admin)
- `hr@hospitalhrms.com` / `Hr@12345678` (HR Manager)

## Response shape

Every endpoint responds with `{ status: boolean, message: string, data?: any }`. Validation and
application errors go through the same shape via `src/utils/errorHandler.js`.

## Auth flow (important: no cookies)

Unlike a cookie-based session, **the refresh token is returned in the login response body** and stored
by the client (e.g. `localStorage`). The client must send it back explicitly:
- `POST /api/auth/refresh` with `{ "refresh_token": "..." }` in the body → returns a new access + refresh token
- `POST /api/auth/logout` with `{ "refresh_token": "..." }` in the body (and a valid `Authorization` header)
  → invalidates that refresh token server-side (stored in the `refresh_tokens` table)

## Extending a scaffolded module (example: Payroll)

1. Add `src/services/payrollServices.js` (the `Payroll`, `SalaryComponent`, `Deduction`, `Bonus` models
   already exist in `models/`).
2. Add `src/controller/payrollController.js` calling that service, following `attendanceController.js` as a template.
3. Add `src/middlewares/validation/payrollValidation.js` with a Joi schema.
4. Add `src/routes/payrollRoutes.js`, mount it in `src/routes/index.js` and `src/app.js`.
5. On the frontend, add `pages/payroll/PayrollPage.tsx` following `AttendancePage.tsx`, and swap out the
   `ComingSoonPage` for it in `routes/router.tsx`.
