# Payroll Feature — Comprehensive Project Report

> Status: **SCAFFOLDED** — Database schema + Sequelize models exist, but there is **no API/service layer yet** and the frontend route renders a `ComingSoonPage`.
> This report documents everything that exists today, how payroll connects to the rest of the HRMS, and a complete implementation blueprint.

---

## 1. Overview

The Payroll module is responsible for computing, generating, and tracking each employee's monthly
salary. It turns an employee's **salary components** (basic + allowances), **attendance overtime**,
**bonuses**, and **deductions** into a single monthly **payslip** record with a running status of
`draft → generated → paid`.

### 1.1 What exists today (actual state)

| Layer | Status | Notes |
|-------|--------|-------|
| DB migrations | ✅ Done | 4 tables: `salary_components`, `payroll`, `deductions`, `bonuses` |
| Sequelize models | ✅ Done | `Payroll`, `SalaryComponent`, `Deduction`, `Bonus` with associations |
| Controller | ⚠️ Empty file | `src/controller/payrollController.js` exists but is 0 lines |
| Service layer | ❌ Missing | `src/services/payrollServices.js` does not exist |
| Validation | ❌ Missing | No `src/middlewares/validation/payrollValidation.js` |
| Routes | ❌ Missing | No `src/routes/payrollRoutes.js`; not mounted in `src/app.js` |
| Frontend page | ❌ Coming soon | `/payroll` route renders `ComingSoonPage` |
| Dashboard integration | ✅ Partial | `getPayrollExpense` + `pendingPayroll` card already wired |
| Seeders | ❌ None | No salary/payroll demo data seeded |

---

## 2. Architecture position

Payroll follows the same layered pipeline as the rest of the app:

```
Express route  →  Joi validation middleware  →  controller  →  service  →  Sequelize model
                 (auth + authorize guards)      (thin HTTP)   (business logic)
```

- **Route** — `src/routes/payrollRoutes.js` (to be created)
- **Controller** — `src/controller/payrollController.js` (exists, empty)
- **Service** — `src/services/payrollServices.js` (to be created)
- **Models** — `models/Payroll.js`, `models/SalaryComponent.js`, `models/Deduction.js`, `models/Bonus.js`
- **Response envelope** — `{ status, message, data? }` via `src/helpers/response.js`
  (`SUCCESS_API_FETCH`, `DATA_SAVED`, `DATA_UPDATED`, `DATA_DELETED`, `DATA_NOT_FOUND`)
- **Errors** — throw `CustomErrorHandler.<factory>()` in services, normalized centrally by `src/utils/errorHandler.js`

---

## 3. Database schema (4 tables)

### 3.1 `salary_components` — migration `20260101000018`

Per-employee, versioned salary definition (one row per pay change, keyed by `effective_date`).

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT | no | auto-inc | PK |
| `employee_id` | INT | no | — | FK → `employees.id` |
| `basic_salary` | DECIMAL(12,2) | no | — | Base pay |
| `housing_allowance` | DECIMAL(12,2) | yes | 0 | |
| `transport_allowance` | DECIMAL(12,2) | yes | 0 | |
| `medical_allowance` | DECIMAL(12,2) | yes | 0 | |
| `other_allowance` | DECIMAL(12,2) | yes | 0 | |
| `effective_date` | DATEONLY | no | — | Date the pay takes effect |
| `createdAt` / `updatedAt` | DATE | no | — | |

No uniqueness constraint — history is allowed. The **latest** row (max `effective_date`)
is the employee's current salary definition.

### 3.2 `payroll` — migration `20260101000019`

One row per **employee per month** (uniqueness enforced via index).

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT | no | auto-inc | PK |
| `employee_id` | INT | no | — | FK → `employees.id` |
| `month` | INT | no | — | 1–12 |
| `year` | INT | no | — | 4-digit |
| `gross_salary` | DECIMAL(12,2) | no | — | basic + all allowances |
| `total_deductions` | DECIMAL(12,2) | yes | 0 | Sum of linked `deductions` |
| `total_bonuses` | DECIMAL(12,2) | yes | 0 | Sum of linked `bonuses` |
| `overtime_amount` | DECIMAL(12,2) | yes | 0 | Computed from attendance overtime |
| `net_salary` | DECIMAL(12,2) | no | — | Final take-home |
| `status` | ENUM('draft','generated','paid') | yes | 'draft' | Lifecycle |
| `payslip_url` | STRING(255) | yes | — | Generated payslip file link |
| `generated_at` | DATE | yes | — | When finalized |
| `createdAt` / `updatedAt` | DATE | no | — | |

**Indexes:** `UNIQUE (employee_id, month, year)` — one payroll run per employee per month.

### 3.3 `deductions` — migration `20260101000020`

Itemized deductions attached to a payroll record.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT | no | auto-inc | PK |
| `payroll_id` | INT | no | — | FK → `payroll.id` |
| `type` | STRING(50) | no | — | e.g. `tax`, `insurance`, `loan`, `late_deduction` |
| `amount` | DECIMAL(12,2) | no | — | |
| `remarks` | STRING(255) | yes | — | |
| `createdAt` / `updatedAt` | DATE | no | — | |

### 3.4 `bonuses` — migration `20260101000021`

Itemized bonuses attached to a payroll record.

| Column | Type | Null | Default | Notes |
|--------|------|------|---------|-------|
| `id` | INT | no | auto-inc | PK |
| `payroll_id` | INT | no | — | FK → `payroll.id` |
| `type` | STRING(50) | no | — | e.g. `performance`, `festival`, `overtime` |
| `amount` | DECIMAL(12,2) | no | — | |
| `remarks` | STRING(255) | yes | — | |
| `createdAt` / `updatedAt` | DATE | no | — | |

---

## 4. Model definitions & associations

All models live in `backend/models/` and are registered against the Sequelize instance in
`config/database.js`. Associations are declared inline on the model files.

```
Employee  (1) ──< (N) SalaryComponent      models/SalaryComponent.js
                  SalaryComponent.belongsTo(Employee, { foreignKey: 'employee_id' })

Employee  (1) ──< (N) Payroll              models/Payroll.js
                  Payroll.belongsTo(Employee, { foreignKey: 'employee_id' })

Payroll   (1) ──< (N) Deduction            models/Deduction.js
                  Deduction.belongsTo(Payroll, { foreignKey: 'payroll_id' })

Payroll   (1) ──< (N) Bonus                models/Bonus.js
                  Bonus.belongsTo(Payroll, { foreignKey: 'payroll_id' })
```

Note: the reverse `hasMany` / `hasOne` sides are **not** declared. If you need eager loading
like `Payroll.findAll({ include: [{ model: Deduction }] })`, add matching
`Payroll.hasMany(Deduction, ...)` and `Payroll.hasMany(Bonus, ...)` (and optionally
`Employee.hasOne(SalaryComponent)` / `Employee.hasMany(Payroll)`) to the model files.
The current belongs-to associations are enough to use the models in queries, but the
reverse side is the cleanest place to wire full includes.

---

## 5. Connections to the rest of the system

### 5.1 Employee module
- `salary_components.employee_id` and `payroll.employee_id` reference `employees.id`.
- Payroll is generated **per employee**; the employee's `status` (`active` / `terminated` /
  `on_leave`) and `department_id` filter who gets paid and enable per-department reports.
- Employee's `designation_id` / `role_id` may drive salary structure (e.g. doctor vs nurse pay bands).

### 5.2 Attendance module (overtime)
- `attendance.overtime_minutes` is captured on **check-out** when hours worked exceed 8
  (`src/services/attendanceServices.js:39`).
- A payroll run can convert `SUM(overtime_minutes)` for a month into
  `overtime_amount` via an hourly rate derived from the employee's gross/basic salary.
- `attendance.monthly-report` (`GET /api/attendance/monthly-report?month=&year=`) already returns
  the status summary + records needed to sanity-check a payroll run.

### 5.3 Dashboard module (already wired)
- `GET /api/dashboard/payroll-expense` — `dashboardServices.getPayrollExpense()`
  (`src/services/dashboardServices.js:65`) sums `net_salary` grouped by `month, year`.
- `pendingPayroll` card — `Payroll.count({ where: { status: 'draft' } })`
  (`src/services/dashboardServices.js:24`), shown as the "Pending Payroll" stat card on the
  frontend dashboard (`frontend/src/pages/DashboardPage.tsx:73`).
- These endpoints already query the `payroll` table, so once records are written, the charts
  light up automatically.

### 5.4 Auth / RBAC
- Roles that should access payroll: `super_admin`, `hr_manager`, `accountant`
  (already the sidebar roles for the Payroll nav item — `frontend/src/components/layout/Sidebar.tsx:26`).
- Reuse guard groups from `src/constant/index.js`. There is no payroll-specific group yet;
  recommended additions:
  ```js
  const PAYROLL_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.ACCOUNTANT];
  const PAYROLL_MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER];
  ```

### 5.5 Notifications
- Notification `type` enum already includes `payroll` on the frontend
  (`frontend/src/pages/notifications/NotificationPage.tsx:259` and
  `MyNotificationPage.tsx:37`), and the backend `notifications` table has a `type` column.
- After payroll generation/paid status you can emit a `payroll` notification
  (via `notificationServices`) to each affected employee.

### 5.6 Frontend integration points
- **Sidebar**: `{ label: 'Payroll', to: '/payroll', icon: Wallet, roles: ['super_admin','hr_manager','accountant'] }` — already present.
- **Router**: `{ path: '/payroll', element: <ComingSoonPage title="Payroll" /> }` — swap for the real page.
- **Types**: add `SalaryComponent`, `PayrollRecord`, `Deduction`, `Bonus`, `Payslip`
  interfaces to `frontend/src/types/index.ts`.
- **Dashboard**: `pendingPayroll` already consumed.

---

## 6. Business rules & formulas

### 6.1 Salary components → gross

```
gross_salary = basic_salary
             + housing_allowance
             + transport_allowance
             + medical_allowance
             + other_allowance
```
The active component set is the row with the **latest** `effective_date ≤ payroll month end`
for the employee.

### 6.2 Net pay

```
net_salary = gross_salary
           + total_bonuses        (sum of linked bonuses.amount)
           + overtime_amount      (converted from attendance overtime_minutes)
           − total_deductions     (sum of linked deductions.amount)
```

### 6.3 Overtime conversion (recommended)

```
hours = SUM(attendance.overtime_minutes) / 60      -- for the employee in the month
hourly_rate = gross_salary / (working_days_in_month × 8)
overtime_amount = hours × hourly_rate
```
The exact rate policy (×1.5, ×2 on holidays, etc.) should be decided and centralized.

### 6.4 Payroll lifecycle

```
draft ──────► generated ──────► paid
   │               │                │
  edit/           freeze +         mark paid,
  adjust          payslip_url,     (optional) notify employee
                  generated_at
```

- `draft` — being assembled; bonuses/deductions can still be attached, totals recomputed.
- `generated` — finalized and visible; totals locked (`payslip_url` + `generated_at` set).
- `paid` — disbursed; no further edits.
- Unique `(employee_id, month, year)` prevents duplicate runs for the same period.

---

## 7. Recommended API design (to build)

Base path `/api/payroll` (mount in `src/app.js`: `app.use('/api/payroll', payrollRoutes)`).

### Salary components — `src/routes/payrollRoutes.js`

| Method | Path | Guard | Service fn | Description |
|--------|------|-------|-----------|-------------|
| GET | `/salary-components/:employeeId` | auth | `getSalaryComponents` | List pay history for an employee |
| POST | `/salary-components` | payroll-manage | `createSalaryComponent` | Set salary (new effective date) |
| PUT | `/salary-components/:id` | payroll-manage | `updateSalaryComponent` | Amend a component record |

### Payroll runs

| Method | Path | Guard | Service fn | Description |
|--------|------|-------|-----------|-------------|
| GET | `/` | payroll | `getAll` | List runs (filter by `employee_id`, `department_id`, `month`, `year`, `status`, paginated) |
| GET | `/:id` | payroll | `getById` | Run detail incl. employee, deductions, bonuses |
| GET | `/employee/:employeeId` | auth | `getByEmployee` | Employee's own payslips |
| POST | `/generate` | payroll-manage | `generate` | Generate payroll for a month/year (batch, all active employees) |
| POST | `/:id/bonuses` | payroll-manage | `addBonus` | Attach a bonus, recompute totals |
| POST | `/:id/deductions` | payroll-manage | `addDeduction` | Attach a deduction, recompute totals |
| PATCH | `/:id/status` | payroll-manage | `updateStatus` | `generated` / `paid` transition |
| DELETE | `/:id` | payroll-manage | `remove` | Delete a draft run |

### Example `generate` service flow

1. Validate `month` + `year`.
2. Load all `active` employees.
3. For each: resolve latest `SalaryComponent` (≤ month end), compute `gross_salary`.
4. Sum `attendance.overtime_minutes` for the month → `overtime_amount`.
5. `findOrCreate` payroll row keyed on `(employee_id, month, year)` → status `draft`.
6. Return summary `{ total_employees, total_gross, total_net, skipped }`.

### Example Joi validation (`src/middlewares/validation/payrollValidation.js`)

```js
const generate = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
});
const bonus = Joi.object({
  type: Joi.string().max(50).required(),
  amount: Joi.number().positive().precision(2).required(),
  remarks: Joi.string().max(255).allow('', null),
});
const deduction = bonus; // same shape
const salaryComponent = Joi.object({
  employee_id: Joi.number().integer().required(),
  basic_salary: Joi.number().positive().precision(2).required(),
  housing_allowance: Joi.number().min(0).precision(2).default(0),
  transport_allowance: Joi.number().min(0).precision(2).default(0),
  medical_allowance: Joi.number().min(0).precision(2).default(0),
  other_allowance: Joi.number().min(0).precision(2).default(0),
  effective_date: Joi.date().iso().required(),
});
```

---

## 8. Implementation checklist

Backend:
1. [ ] `src/constant/index.js` — add `PAYROLL_ROLES` / `PAYROLL_MANAGE_ROLES` (or reuse `HR_ROLES` + `ACCOUNTANT`).
2. [ ] Add reverse associations in `models/Payroll.js` (`hasMany Deduction`, `hasMany Bonus`)
      and optionally `models/Employee.js` (`hasOne SalaryComponent`, `hasMany Payroll`).
3. [ ] Create `src/services/payrollServices.js` with the functions in §7.
4. [ ] Fill `src/controller/payrollController.js` (thin handlers using `asyncHandler` + response helpers).
5. [ ] Create `src/middlewares/validation/payrollValidation.js`.
6. [ ] Create `src/routes/payrollRoutes.js`; export it from `src/routes/index.js`.
7. [ ] Mount in `src/app.js`: `app.use('/api/payroll', payrollRoutes)`.

Frontend:
8. [ ] Add `Payroll`/`SalaryComponent`/`Deduction`/`Bonus` types to `src/types/index.ts`.
9. [ ] Create `src/pages/payroll/PayrollPage.tsx` (list + generate + status actions) and
      `src/pages/payroll/PayslipPage.tsx` (detail) following `AttendancePage.tsx`.
10. [ ] Swap `<ComingSoonPage title="Payroll" />` in `src/routes/router.tsx` for the real page.
11. [ ] (Optional) Send `payroll` notifications via `notificationServices` on generate/paid.

Data:
12. [ ] (Optional) Seeder for `salary_components` and a sample `payroll` run for demo employees.

---

## 9. Files touched (reference map)

| File | Role |
|------|------|
| `backend/migrations/20260101000018-create-salary_components.js` | Table |
| `backend/migrations/20260101000019-create-payroll.js` | Table |
| `backend/migrations/20260101000020-create-deductions.js` | Table |
| `backend/migrations/20260101000021-create-bonuses.js` | Table |
| `backend/models/SalaryComponent.js` | Model |
| `backend/models/Payroll.js` | Model |
| `backend/models/Deduction.js` | Model |
| `backend/models/Bonus.js` | Model |
| `backend/src/controller/payrollController.js` | Controller (empty, to fill) |
| `backend/src/services/dashboardServices.js` | `getPayrollExpense`, `pendingPayroll` |
| `backend/src/routes/dashboardRoutes.js` | `/payroll-expense` |
| `backend/src/constant/index.js` | Role groups (add payroll group) |
| `frontend/src/components/layout/Sidebar.tsx` | Nav item (present) |
| `frontend/src/routes/router.tsx` | `/payroll` route (ComingSoon) |
| `frontend/src/types/index.ts` | Types (to add) |
| `frontend/src/pages/DashboardPage.tsx` | Pending Payroll card |

---

## 10. Security & compliance notes

- **Authorization**: generation and money-mutation endpoints must be restricted
  (`super_admin`, `hr_manager`, and — read-only — `accountant`). Employees should only
  read **their own** payslips (`req.user.employee_id`).
- **Immutable after generation**: `paid`/`generated` rows should reject edits; any correction
  should be a new deduction/bonus row so the audit trail is preserved.
- **Audit**: money changes are prime candidates for the existing `audit_logs` table.
- **Precision**: all money is `DECIMAL(12,2)`; avoid JS float accumulation — round after each sum.
- **Payslips**: `payslip_url` should point to a protected (auth-gated) resource, not a public
  static upload, in production.
