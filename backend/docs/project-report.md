# Hospital HRMS - Comprehensive Project Report

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [System Architecture](#3-system-architecture)
4. [Tech Stack](#4-tech-stack)
5. [Database Design](#5-database-design)
6. [Module Breakdown](#6-module-breakdown)
7. [API Design](#7-api-design)
8. [Frontend Design](#8-frontend-design)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Security Measures](#10-security-measures)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Current Status & Future Scope](#12-current-status--future-scope)

---

## 1. Executive Summary

The **Hospital HRMS (Human Resource Management System)** is a full-stack web application designed to digitize and streamline human resource operations for hospitals and healthcare institutions. Built with a Nepal-specific payroll and economic year system, the platform covers the complete employee lifecycle — from recruitment and onboarding to attendance, leave, payroll, training, and offboarding.

The system follows a **role-based access control (RBAC)** model with 11 distinct roles (Super Admin, HR Manager, Hospital Admin, Department Head, Doctor, Nurse, Pharmacist, Lab Technician, Receptionist, Accountant, Employee), ensuring granular permission management across all modules.

---

## 2. Project Overview

### 2.1 Purpose

Healthcare institutions manage large, diverse workforces spanning multiple departments, shifts, and specialized roles. Traditional paper-based or fragmented systems lead to inefficiencies in:

- Tracking attendance and shift rotations across 24/7 operations
- Managing multi-level leave approval workflows
- Processing payroll with Nepal-specific allowances and deductions
- Maintaining compliance with medical licensing and training requirements
- Coordinating recruitment for healthcare-specific positions

This HRMS provides a centralized, web-based solution to address all these challenges.

### 2.2 Scope

| Area | Coverage |
|------|----------|
| Employee Lifecycle | Onboarding, profile management, document storage, offboarding |
| Attendance | Self check-in/out, manual HR entry, overtime tracking, late detection |
| Leave Management | Multi-level approval (Department Head -> HR), leave balances, 12+ leave types |
| Payroll | Salary components, allowances, deductions, bonuses, Nepalese Rupee calculations |
| Recruitment | Job postings, candidate tracking, resume uploads, interview scheduling |
| Training | Program creation, employee enrollment, compliance tracking, certificates |
| Shifts | Shift definitions, employee assignments, day-of-week scheduling |
| Notifications | System-wide and user-specific notifications with read/unread tracking |
| Dashboard | Real-time analytics with charts and KPIs |

### 2.3 Target Users

- Hospital administrators and HR departments
- Department heads managing team schedules
- All hospital staff (doctors, nurses, pharmacists, lab technicians, receptionists, accountants)

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT TIER                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  React 18 + TypeScript (Vite)                       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐│ │
│  │  │ UI Layer │ │ State    │ │ API Layer            ││ │
│  │  │ (Pages,  │ │ (React   │ │ (Axios + Interceptors││ │
│  │  │ Components│ │  Query,  │ │  + Token Refresh)    ││ │
│  │  │ Radix UI)│ │ Context) │ │                      ││ │
│  │  └──────────┘ └──────────┘ └──────────────────────┘│ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│                    HTTP/REST (JSON)                        │
│                           │                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                  SERVER TIER                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  Express.js (Node.js)                           │ │ │
│  │  │  ┌───────────┐ ┌──────────┐ ┌────────────────┐ │ │ │
│  │  │  │ Middleware │ │Routes    │ │ Controllers    │ │ │ │
│  │  │  │ (Auth,    │ │(13 groups│ │ (15 files)     │ │ │ │
│  │  │  │  RBAC,    │ │  /api/*) │ │                │ │ │ │
│  │  │  │  Validate,│ └──────────┘ └────────────────┘ │ │ │
│  │  │  │  RateLimit│        │                          │ │ │
│  │  │  └───────────┘        ▼                          │ │ │
│  │  │              ┌────────────────┐                  │ │ │
│  │  │              │  Services      │                  │ │ │
│  │  │              │  (16 files)    │                  │ │ │
│  │  │              │  Business Logic│                  │ │ │
│  │  │              └────────────────┘                  │ │ │
│  │  │                      │                           │ │ │
│  │  │              ┌────────────────┐                  │ │ │
│  │  │              │  Sequelize ORM │                  │ │ │
│  │  │              │  (34 Models)   │                  │ │ │
│  │  │              └────────────────┘                  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
│                           │                               │
│                           ▼                               │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   DATA TIER                         │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │  MySQL 8.x (Port 3307)                         │ │ │
│  │  │  39 tables via Sequelize migrations             │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Backend Architecture (Layered MVC)

```
Request → Rate Limiter → Auth Middleware → RBAC Middleware → Validation → Controller → Service → Model → Database
                                              │
                                    ┌─────────┴─────────┐
                                    │   Error Handler    │
                                    │   (Global + Custom) │
                                    └───────────────────┘
```

**Layers:**

| Layer | Location | Responsibility |
|-------|----------|---------------|
| **Routes** | `src/routes/` (14 files) | Define HTTP endpoints and map to controllers |
| **Middlewares** | `src/middlewares/` | Authentication, RBAC, validation (Joi), rate limiting, async error wrapping |
| **Controllers** | `src/controller/` (15 files) | Parse request, call services, format response |
| **Services** | `src/services/` (16 files) | Business logic, data transformations, inter-model operations |
| **Models** | `models/` (34 files) | Sequelize model definitions with associations and hooks |
| **Helpers** | `src/helpers/` | Response formatting, date utilities |
| **Utils** | `src/utils/` | Custom error classes, global error handler |

### 3.3 Frontend Architecture

```
main.tsx
  └── App.tsx
        ├── QueryClientProvider (TanStack React Query)
        │     ├── ThemeProvider (Dark/Light mode)
        │     │     └── AuthProvider (Auth state + Economic Year)
        │     │           └── RouterProvider (React Router v6)
        │     │                 └── Routes
        │     │                       ├── Public Routes (Login, Register, Forgot/Reset Password)
        │     │                       └── Protected Routes (ProtectedRoute wrapper)
        │     │                             └── Layout (Sidebar + Topbar + Outlet)
        │     │                                   └── Page Components
        │     │                                         └── Forms, Tables, Charts (Recharts)
```

**Key Frontend Patterns:**

- **Component Library**: Custom shadcn/ui-style primitives built on Radix UI
- **State Management**: TanStack React Query for server state, React Context for auth/theme/economic-year
- **Form Management**: React Hook Form + Zod validation
- **API Layer**: Centralized Axios instance with automatic silent token refresh via interceptors
- **Styling**: Tailwind CSS with CSS custom properties for design tokens (HSL color system)
- **Path Aliasing**: `@/` resolves to `./src/` via Vite config

---

## 4. Tech Stack

### 4.1 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Runtime | Server runtime environment |
| Express.js | ^4.21.2 | HTTP framework with routing, middleware |
| Sequelize | ^6.37.8 | SQL ORM for model definitions, migrations, associations |
| MySQL2 | ^3.22.6 | MySQL database driver |
| jsonwebtoken | ^9.0.2 | JWT access + refresh token generation/verification |
| bcryptjs | ^2.4.3 | Password hashing (salt rounds: 10) |
| Joi | ^17.11.1 | Request body/query/params validation |
| Multer | ^1.4.5-lts.1 | Multipart file upload handling |
| Helmet | ^7.1.0 | Security HTTP headers |
| CORS | ^2.8.5 | Cross-origin request handling |
| Nodemailer | ^6.9.13 | Email delivery (password reset) |
| Winston | ^3.11.0 | Structured logging with daily rotate |
| dotenv | ^16.6.1 | Environment variable management |
| Nodemon | ^3.0.2 | Development auto-restart |

### 4.2 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.3.1 | UI component framework |
| TypeScript | ^5.5.3 | Static type checking |
| Vite | ^5.3.3 | Build tool and dev server |
| React Router DOM | ^6.24.1 | Client-side routing |
| TanStack React Query | ^5.51.1 | Server state management, caching, optimistic updates |
| Axios | ^1.7.2 | HTTP client with interceptors |
| Tailwind CSS | ^3.4.6 | Utility-first CSS framework |
| Radix UI | Various | Headless, accessible UI primitives |
| React Hook Form | ^7.52.1 | Form state and validation |
| Zod | ^3.23.8 | TypeScript-first schema validation |
| Recharts | ^2.12.7 | Dashboard data visualization |
| Lucide React | ^0.400.0 | Icon library |
| class-variance-authority | ^0.7.0 | Variant-based component styling |
| react-toastify | ^11.1.0 | Toast notifications |

### 4.3 Database

| Technology | Purpose |
|------------|---------|
| MySQL 8.x | Primary relational database (port 3307) |

---

## 5. Database Design

### 5.1 Entity Relationship Overview

The database contains **39 tables** (managed via Sequelize migrations) across the following domain groups:

#### Core HR

```
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│   departments │────<│  designations   │────<│   employees  │
│              │     │                │     │              │
│ id           │     │ id             │     │ id           │
│ name         │     │ title          │     │ employee_code│
│ code         │     │ department_id  │     │ first_name   │
│ head_emp_id  │     │ level          │     │ last_name    │
│ description  │     │ is_active      │     │ email        │
│ is_active    │     └────────────────┘     │ phone        │
└──────────────┘                            │ gender       │
                                            │ dob          │
                                            │ joining_date │
                                            │ dept_id (FK) │
                                            │ desig_id (FK)│
                                            │ role_id (FK) │
                                            │ emp_type     │
                                            │ status       │
                                            │ profile_photo│
                                            │ medical_info │
                                            └──────┬───────┘
                                                   │
                    ┌──────────────────────────────┤
                    │              │                │
              ┌─────┴──────┐ ┌────┴────────┐ ┌────┴──────────┐
              │   users     │ │ employee_   │ │ employee_     │
              │             │ │ education   │ │ experience    │
              │ id          │ │             │ │               │
              │ email       │ │ id          │ │ id            │
              │ password    │ │ employee_id │ │ employee_id   │
              │ role_id     │ │ degree      │ │ organization  │
              │ employee_id │ │ institution │ │ designation   │
              │ is_active   │ │ year        │ │ start/end_date│
              └─────────────┘ └─────────────┘ └───────────────┘
```

#### Attendance & Shifts

```
┌──────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   attendance      │     │    shifts        │     │ employee_shifts │
│                   │     │                  │     │                 │
│ id                │     │ id               │     │ id              │
│ employee_id (FK)  │     │ name             │     │ employee_id (FK)│
│ date              │     │ start_time       │     │ shift_id (FK)   │
│ check_in          │     │ end_time         │     │ effective_date  │
│ check_out         │     │ is_night_shift   │     │ day_of_week     │
│ status            │     └──────────────────┘     └─────────────────┘
│ is_manual_entry   │
│ overtime_minutes  │
│ late_minutes      │
└──────────────────┘
```

#### Leave Management

```
┌───────────────┐     ┌─────────────────┐     ┌────────────────┐
│  leave_types   │     │ leave_requests   │     │ leave_balances │
│                │     │                  │     │                │
│ id             │     │ id               │     │ id             │
│ name           │     │ employee_id (FK) │     │ employee_id(FK)│
│ default_days   │     │ leave_type_id(FK)│     │ leave_type_id  │
│ is_paid        │     │ start_date       │     │ year           │
└───────────────┘     │ end_date         │     │ allocated_days │
                      │ total_days       │     │ used_days      │
                      │ reason           │     │ carried_fwd    │
                      │ status           │     └────────────────┘
                      │ dept_approver_id │
                      │ hr_approver_id   │
                      │ rejection_reason │
                      └──────────────────┘
```

#### Payroll

```
┌────────────────────┐     ┌─────────────┐     ┌────────────┐
│  salary_components  │     │   payroll    │     │ deductions │
│                     │     │             │     │            │
│ id                  │     │ id          │     │ id         │
│ employee_id (FK)    │     │ employee_id │     │ payroll_id │
│ basic_salary        │     │ month/year  │     │ type       │
│ housing_allowance   │     │ gross       │     │ amount     │
│ transport_allowance │     │ deductions  │     │ remarks    │
│ medical_allowance   │     │ net_salary  │     └────────────┘
│ other_allowance     │     │ status      │
│ basic_multiplier    │     └─────────────┘
│ food_enabled/allow  │           │
│ accom_enabled/allow │     ┌─────┴──────┐
│ ot_enabled/rate     │     │  bonuses    │
│ effective_date      │     │            │
│ end_date            │     │ id         │
└─────────────────────┘     │ payroll_id │
                            │ type       │
                            │ amount     │
                            │ remarks    │
                            └────────────┘
```

#### Recruitment & Training

```
┌──────────────────┐     ┌────────────────┐     ┌───────────────────┐
│   recruitment     │     │   interviews   │     │    trainings      │
│                   │     │                │     │                   │
│ id                │     │ id             │     │ id                │
│ job_title         │     │ recruitment_id │     │ title             │
│ dept_id (FK)      │     │ scheduled_at   │     │ description       │
│ desig_id (FK)     │     │ interviewer_id │     │ trainer           │
│ openings          │     │ round          │     │ start/end_date    │
│ status            │     │ mode           │     │ location          │
│ candidate_name    │     │ result         │     │ capacity          │
│ candidate_email   │     │ feedback       │     └─────────┬─────────┘
│ resume_url        │     └────────────────┘               │
│ offer_letter_url  │                               ┌──────┴──────────┐
└──────────────────┘                               │ employee_       │
                                                   │ trainings       │
                                                   │                 │
                                                   │ id              │
                                                   │ employee_id     │
                                                   │ training_id     │
                                                   │ completion_stat │
                                                   │ certificate_url │
                                                   └─────────────────┘
```

#### Supporting Tables

| Table | Purpose |
|-------|---------|
| `roles` | 11 system roles with descriptions |
| `permissions` | Module-action permission pairs |
| `role_permissions` | Many-to-many role-permission mapping |
| `refresh_tokens` | Active JWT refresh tokens |
| `documents` | Employee document records (with file URLs) |
| `emergency_contacts` | Employee emergency contact info |
| `assets` | Hospital asset inventory |
| `asset_assignments` | Asset-to-employee assignment tracking |
| `notifications` | System and user notifications |
| `audit_logs` | Action audit trail |
| `economic_years` | Nepal-specific fiscal year periods |

### 5.2 Key Relationships

| Relationship | Type | Description |
|-------------|------|-------------|
| Department → Designations | 1:N | Each designation belongs to one department |
| Employee → Department | N:1 | Employee belongs to one department |
| Employee → Designation | N:1 | Employee holds one designation |
| Employee → Role | N:1 | Employee assigned one role |
| Employee → User | 1:1 | Each employee has one login account |
| Employee → Education | 1:N | Multiple education records |
| Employee → Experience | 1:N | Multiple work experience records |
| Employee → Documents | 1:N | Multiple document uploads |
| Employee → Attendance | 1:N | Daily attendance records |
| Employee → LeaveRequests | 1:N | Leave application history |
| Employee → Salaries | 1:N | Salary history (effective dated) |
| Employee → Shifts | N:N (via employee_shifts) | Shift assignments |
| Employee → Training | N:N (via employee_trainings) | Training enrollments |
| LeaveRequest → LeaveType | N:1 | Categorized by leave type |
| Payroll → Employee | N:1 | Monthly payroll records |
| Payroll → Deductions | 1:N | Multiple deductions per payroll |
| Payroll → Bonuses | 1:N | Multiple bonuses per payroll |
| Recruitment → Interviews | 1:N | Interview rounds per candidate |
| User → Notifications | 1:N | User-specific notifications |
| User → AuditLogs | 1:N | User actions logged |

---

## 6. Module Breakdown

### 6.1 Authentication Module

| Aspect | Detail |
|--------|--------|
| **Endpoints** | Register, Login, Logout, Refresh, Forgot Password, Reset Password, Change Password, Get Me |
| **Token Strategy** | Short-lived access token (15 min) + long-lived refresh token (7 days) |
| **Password Security** | bcrypt hashing (10 salt rounds), beforeSave hook |
| **Token Refresh** | Automatic silent refresh via Axios interceptors with singleton promise |
| **Password Reset** | Token-based flow with email delivery via Nodemailer |
| **Status** | **COMPLETE** |

### 6.2 Employee Management Module

| Aspect | Detail |
|--------|--------|
| **Operations** | Full CRUD with search, filter, pagination, CSV export |
| **Profile Photo** | Multer-based upload, 5MB limit, images only |
| **Documents** | File upload (10MB), typed documents (license, certificate, etc.) |
| **Emergency Contacts** | CRUD for employee emergency contacts |
| **Education** | Education history management |
| **Experience** | Work experience history management |
| **Search** | By name, employee code, department, designation, status |
| **Status** | **COMPLETE** |

### 6.3 Attendance Module

| Aspect | Detail |
|--------|--------|
| **Check-in/Out** | Self-service with timestamp recording |
| **Manual Entry** | HR/Admin can add attendance for any employee |
| **Overtime** | Automatic calculation from check-out time |
| **Late Tracking** | Minutes late computed against shift start time |
| **Monthly Report** | Aggregated attendance statistics per employee |
| **Status** | **COMPLETE** |

### 6.4 Leave Management Module

| Aspect | Detail |
|--------|--------|
| **Leave Types** | 12 configurable types (sick, casual, maternity, paternity, annual, bereavement, etc.) |
| **Balances** | Allocated, used, carried-forward tracking per type per year |
| **Approval Workflow** | Two-level: Department Head approval → HR Manager approval |
| **Self-Service** | Apply, cancel (if pending), view history |
| **Status** | **COMPLETE** |

### 6.5 Payroll Module

| Aspect | Detail |
|--------|--------|
| **Salary Components** | Basic salary, housing, transport, medical, other allowances |
| **Advanced** | Basic salary multiplier, food allowance, accommodation allowance, OT rate |
| **Deductions** | Configurable per payroll run |
| **Bonuses** | Configurable per payroll run |
| **Currency** | Nepalese Rupees (Rs.) |
| **Status** | **PARTIAL** (salary setup complete; payroll generation minimal) |

### 6.6 Recruitment Module

| Aspect | Detail |
|--------|--------|
| **Job Postings** | Create with department, designation, openings count |
| **Candidates** | Name, email, phone, resume upload (PDF/DOC/DOCX) |
| **Status Tracking** | Applied → Shortlisted → Interviewing → Offered → Hired/Rejected |
| **Interviews** | Schedule with round, mode (in-person/video/phone), result, feedback |
| **Status** | **COMPLETE** |

### 6.7 Training Module

| Aspect | Detail |
|--------|--------|
| **Programs** | Title, description, trainer, dates, location, capacity |
| **Enrollment** | Bulk enroll employees, track completion status |
| **Compliance** | Summary view of training compliance across employees |
| **Certificates** | Certificate URL tracking per enrollment |
| **Status** | **COMPLETE** |

### 6.8 Shift Management Module

| Aspect | Detail |
|--------|--------|
| **Shifts** | Define name, start/end time, night shift flag |
| **Assignments** | Assign shifts to employees with effective date and day-of-week |
| **My Shift** | Employees can view their current shift |
| **Status** | **COMPLETE** |

### 6.9 Notification Module

| Aspect | Detail |
|--------|--------|
| **Types** | System-wide, user-specific, bulk creation |
| **Read Tracking** | Per-notification read status, mark all read |
| **Unread Count** | API endpoint for badge display |
| **Publishing** | Draft/published status with publish dates |
| **Status** | **COMPLETE** |

### 6.10 Dashboard Module

| Aspect | Detail |
|--------|--------|
| **Stat Cards** | Total employees, active employees, pending leaves, attendance rate |
| **Charts** | Attendance trend (area), department distribution (pie), gender distribution (pie), leave statistics (bar), payroll expense (bar), monthly recruitment (bar) |
| **Activity Feed** | Recent hires and approved leaves |
| **Status** | **COMPLETE** |

### 6.11 Economic Year Module

| Aspect | Detail |
|--------|--------|
| **Concept** | Nepal-specific fiscal year (e.g., 2083/2084 BS) |
| **Enforcement** | EconomicYearContext redirects to setup if no valid year exists |
| **Status** | **COMPLETE** |

### 6.12 Scaffolded Modules (Coming Soon)

| Module | Status | Notes |
|--------|--------|-------|
| Performance Management | Scaffolded | Model (`PerformanceReview`) exists; UI is placeholder |
| Asset Management | Scaffolded | Models (`Asset`, `AssetAssignment`) exist; UI is placeholder |
| Reports | Planned | No implementation yet |
| Settings | Planned | No implementation yet |
| Profile | Basic | Basic page exists; needs enhancement |

---

## 7. API Design

### 7.1 Base URL & Conventions

- **Base URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json` (2MB limit)
- **Authentication**: `Authorization: Bearer <token>` header
- **Response Format**: Standardized JSON responses with `status`, `message`, and `data` fields
- **Error Format**: `{ status: false, message: "Error description" }`
- **Pagination**: Query params `page` and `limit` with meta response `{ currentPage, totalPages, totalItems }`

### 7.2 Endpoint Summary

| Module | Endpoints | Methods |
|--------|-----------|---------|
| Auth | `/api/auth/*` (8 routes) | POST, GET |
| Employees | `/api/employees/*` (11 routes) | GET, POST, PUT, DELETE |
| Departments | `/api/departments/*` (5 routes) | GET, POST, PUT, DELETE |
| Designations | `/api/designations/*` (4 routes) | GET, POST, PUT, DELETE |
| Attendance | `/api/attendance/*` (5 routes) | POST, GET |
| Leave | `/api/leave/*` (10 routes) | GET, POST, PATCH |
| Dashboard | `/api/dashboard/*` (8 routes) | GET |
| Shifts | `/api/shifts/*` (10 routes) | GET, POST, PUT, DELETE |
| Salary | `/api/salary/*` (3 routes) | POST, GET |
| Recruitment | `/api/recruitment/*` (5 routes) | GET, POST, PUT, DELETE |
| Training | `/api/training/*` (10 routes) | GET, POST, PUT, DELETE |
| Notifications | `/api/notifications/*` (12 routes) | GET, POST, PUT, PATCH, DELETE |
| Economic Year | `/api/year/*` (4 routes) | POST, GET |
| Health | `/api/health` (1 route) | GET |

**Total: ~96 API endpoints across 14 route groups**

### 7.3 Validation

All mutating endpoints use Joi validation middleware for:
- Request body schema validation
- Query parameter validation
- URL parameter validation
- Custom error messages on validation failure

---

## 8. Frontend Design

### 8.1 Page Inventory

| Route | Page | Access |
|-------|------|--------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/reset-password` | ResetPasswordPage | Public |
| `/dashboard` | DashboardPage | All authenticated |
| `/employees` | EmployeeListPage | All authenticated |
| `/employees/new` | EmployeeFormPage | MANAGE_ROLES only |
| `/employees/:id` | EmployeeDetailsPage | All authenticated |
| `/employees/:id/edit` | EmployeeFormPage | MANAGE_ROLES only |
| `/attendance` | AttendancePage | All authenticated |
| `/leave` | LeavePage | All authenticated |
| `/shifts` | ShiftsPage | All authenticated |
| `/payroll` | PayrollPage | All authenticated |
| `/save-salary` | SaveSalaryPage | HR_ROLES only |
| `/recruitment` | RecruitmentPage | HR_ROLES only |
| `/training` | TrainingPage | All authenticated |
| `/notifications` | NotificationPage | All authenticated |
| `/my-notification` | MyNotificationPage | All authenticated |
| `/economic-year` | EconomicYearPage | All authenticated |
| `/departments` | DepartmentsPage | MANAGE_ROLES only |
| `/designations` | DesignationsPage | MANAGE_ROLES only |
| `/profile` | ProfilePage | All authenticated |
| `/performance` | ComingSoonPage | All authenticated |
| `/assets` | ComingSoonPage | All authenticated |
| `/reports` | ComingSoonPage | All authenticated |
| `/settings` | ComingSoonPage | All authenticated |

### 8.2 Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌─────────────────────────────────────┐│
│ │          │ │            TOPBAR                    ││
│ │          │ │  [Breadcrumbs] [Search] [🔔] [👤]   ││
│ │ SIDEBAR  │ ├─────────────────────────────────────┤│
│ │          │ │                                     ││
│ │ 📊 Dash  │ │                                     ││
│ │ 👥 Emp   │ │         PAGE CONTENT                ││
│ │ 📅 Att   │ │         (Outlet)                    ││
│ │ 📋 Leave │ │                                     ││
│ │ 🔄 Shift │ │                                     ││
│ │ 💰 Pay   │ │                                     ││
│ │ 🎯 Recr  │ │                                     ││
│ │ 📚 Train │ │                                     ││
│ │ 🔔 Notif │ │                                     ││
│ │          │ │                                     ││
│ └──────────┘ └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

**Features:**
- **Collapsible Sidebar**: Narrows to icon-only mode; role-filtered navigation items
- **Topbar**: Global search, notification bell with unread badge, theme toggle (dark/light), user profile dropdown
- **Responsive**: Mobile-friendly sidebar toggle

### 8.3 Design System

| Aspect | Implementation |
|--------|---------------|
| **CSS Framework** | Tailwind CSS 3.4 with CSS custom properties |
| **Component Library** | Custom shadcn/ui-style primitives (Button, Card, Input, Select, Label, Badge, Skeleton, Textarea) |
| **UI Primitives** | Radix UI (Dialog, DropdownMenu, Select, Tabs, Toast, Switch, Avatar, Label) |
| **Typography** | Plus Jakarta Sans (body), JetBrains Mono (code) |
| **Colors** | HSL-based design tokens with dark/light mode support |
| **Shadows** | Custom `shadow-soft` utility |
| **Animations** | tailwindcss-animate for transitions |

### 8.4 State Management Strategy

| State Type | Solution | Examples |
|------------|----------|----------|
| Server State | TanStack React Query | API data, caching, refetching, optimistic updates |
| Auth State | React Context (AuthContext) | User object, tokens, login/logout functions |
| Theme State | React Context (ThemeContext) | Dark/light mode preference |
| Economic Year | React Context (EconomicYearContext) | Current fiscal year, enforcement gate |
| Form State | React Hook Form + Zod | Complex multi-field forms |
| UI State | Local component state (useState) | Modals, toggles, search inputs |

---

## 9. Authentication & Authorization

### 9.1 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────>│ Validate │────>│ Generate │────>│ Store    │
│  Request │     │ Password │     │ Tokens   │     │ Tokens   │
│          │     │ (bcrypt) │     │ (JWT)    │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                          │
                    ┌─────────────────────┤
                    ▼                     ▼
              ┌──────────┐         ┌──────────┐
              │ Access   │         │ Refresh  │
              │ Token    │         │ Token    │
              │ (15 min) │         │ (7 days) │
              └──────────┘         └──────────┘
```

### 9.2 Token Refresh Flow

```
API Request → 401 Response → Axios Interceptor → POST /api/auth/refresh
                                                        │
                                                  ┌─────┴─────┐
                                                  ▼           ▼
                                              Success      Failure
                                                  │           │
                                                  ▼           ▼
                                          Retry Original   Redirect
                                          Request          to /login
```

**Concurrency Protection**: A singleton promise pattern ensures only one refresh request is in-flight at a time, preventing race conditions.

### 9.3 Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **super_admin** | Full system access, all CRUD operations |
| **hr_manager** | Employee management, attendance, leave approval, payroll, recruitment, training |
| **hospital_admin** | Employee management, department/designation management |
| **department_head** | Department attendance management, leave department-approval, training enrollment |
| **doctor** | Self-service (attendance, leave, training) |
| **nurse** | Self-service (attendance, leave, training) |
| **pharmacist** | Self-service (attendance, leave, training) |
| **lab_technician** | Self-service (attendance, leave, training) |
| **receptionist** | Self-service (attendance, leave, training) |
| **accountant** | Self-service (attendance, leave, training) |
| **employee** | Self-service (attendance, leave, training) |

**Permission Groups:**

| Group | Roles | Purpose |
|-------|-------|---------|
| `MANAGE_EMPLOYEE_ROLES` | super_admin, hr_manager, hospital_admin | Employee CRUD access |
| `MANAGE_ATTENDANCE_ROLES` | super_admin, hr_manager, hospital_admin, department_head | Manual attendance entry |
| `HR_ROLES` | super_admin, hr_manager | Payroll, recruitment, salary management |
| `DEPARTMENT_APPROVAL_ROLES` | department_head, super_admin, hr_manager | Leave department-level approval |

### 9.4 Frontend Route Guards

```
Unauthenticated → ProtectedRoute → Redirect to /login
Authenticated + No Role Match → ProtectedRoute → Redirect to /unauthorized
Authenticated + Role Match → Render Page Content
```

The `Sidebar` component also filters navigation items based on the user's role, hiding irrelevant menu entries.

---

## 10. Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Transport** | Security Headers | Helmet.js (X-Content-Type, X-Frame, HSTS, etc.) |
| **Transport** | CORS | Whitelist of specific allowed origins |
| **Rate Limiting** | DDoS/Brute-force Protection | 100 requests/minute per IP (in-memory Map) |
| **Authentication** | Password Hashing | bcrypt with 10 salt rounds |
| **Authentication** | JWT Expiry | Access: 15 min, Refresh: 7 days |
| **Authentication** | Refresh Token Revocation | Server-side DB tracking; invalidated on logout |
| **Authorization** | RBAC Middleware | Per-endpoint role checks |
| **Validation** | Input Validation | Joi schemas on all mutating endpoints |
| **Validation** | Body Size Limit | 2MB JSON body limit |
| **Files** | Upload Restrictions | File type and size limits via Multer |
| **Errors** | Information Leakage Prevention | Generic error messages in production mode |
| **Logging** | Audit Trail | Winston logging with daily rotation |

---

## 11. Deployment Architecture

### 11.1 Development Setup

```
┌─────────────────────────────┐
│     Development Machine     │
│                             │
│  Frontend (Vite)    :5173   │──── proxy /api/* ────┐
│                             │                       │
│  Backend (Express)   :5000   │<─────────────────────┘
│                             │
│  MySQL              :3307   │
│                             │
└─────────────────────────────┘
```

- **Frontend**: `npm run dev` → Vite dev server on port 5173
- **Backend**: `npm run dev` → Nodemon on port 5000
- **Database**: MySQL on port 3307 (non-standard)
- **Proxy**: Vite proxies `/api` and `/uploads` to backend

### 11.2 Production Considerations

| Area | Current State | Recommendation |
|------|--------------|----------------|
| **Containerization** | None | Add Dockerfile + docker-compose.yml |
| **CI/CD** | None | Add GitHub Actions / GitLab CI pipeline |
| **File Storage** | Local filesystem | Migrate to AWS S3 / Cloud Storage |
| **Email** | Console logging | Configure real SMTP (Gmail/SendGrid/Mailgun) |
| **Rate Limiter** | In-memory (Map) | Use Redis-backed rate limiting |
| **SSL/TLS** | Not configured | Use Nginx reverse proxy with Let's Encrypt |
| **Environment** | Development defaults | Set `NODE_ENV=production`, rotate secrets |
| **Database** | Single instance | Configure replication / backups |
| **Logging** | File-based | Ship to ELK / Datadog / CloudWatch |
| **Monitoring** | None | Add health checks, APM, error tracking (Sentry) |

### 11.3 Build Commands

```bash
# Backend
npm run dev          # Development with Nodemon
npm start            # Production with Node.js

# Frontend
npm run dev          # Vite development server
npm run build        # TypeScript compilation + Vite production build
npm run preview      # Preview production build locally

# Database
npx sequelize-cli db:migrate         # Run migrations
npx sequelize-cli db:seed:all        # Run seeders
npx sequelize-cli db:migrate:undo    # Rollback last migration
```

---

## 12. Current Status & Future Scope

### 12.1 Module Completion Status

| Module | Backend | Frontend | Overall |
|--------|---------|----------|---------|
| Authentication | Complete | Complete | **Complete** |
| Dashboard | Complete | Complete | **Complete** |
| Employee Management | Complete | Complete | **Complete** |
| Departments | Complete | Complete | **Complete** |
| Designations | Complete | Complete | **Complete** |
| Attendance | Complete | Complete | **Complete** |
| Leave Management | Complete | Complete | **Complete** |
| Shift Management | Complete | Complete | **Complete** |
| Salary/Compensation | Complete | Complete | **Complete** |
| Recruitment | Complete | Complete | **Complete** |
| Training | Complete | Complete | **Complete** |
| Notifications | Complete | Complete | **Complete** |
| Economic Year | Complete | Complete | **Complete** |
| Payroll Generation | Partial | Minimal | **Partial** |
| Performance Management | Model only | Placeholder | **Scaffolded** |
| Asset Management | Models only | Placeholder | **Scaffolded** |
| Reports | None | Placeholder | **Planned** |
| Settings | None | Placeholder | **Planned** |
| Profile | Basic | Basic | **Partial** |

### 12.2 Known Issues

1. **Typos in Filenames**: "Recuriment" (should be "Recruitment"), "Traning" (should be "Training") in some service/page files
2. **Duplicate Salary Models**: Both `Salary.js` and `SalaryComponent.js` map to the `salary_components` table
3. **Zero Test Coverage**: No unit, integration, or end-to-end tests exist
4. **In-Memory Rate Limiter**: Resets on server restart; not suitable for multi-instance deployments
5. **Local File Storage**: Uploaded files are stored on the local filesystem

### 12.3 Future Enhancements

| Priority | Enhancement | Description |
|----------|-------------|-------------|
| High | **Payroll Generation** | Complete monthly payroll processing with automated calculations |
| High | **Testing** | Add unit tests (Jest), integration tests, E2E tests (Cypress/Playwright) |
| High | **Dockerization** | Docker + docker-compose for consistent dev/prod environments |
| Medium | **Performance Reviews** | Complete the performance management module with KPIs and ratings |
| Medium | **Asset Management** | Implement full asset tracking and assignment workflows |
| Medium | **Reports Module** | Generate downloadable PDF/Excel reports for payroll, attendance, etc. |
| Medium | **Redis Caching** | Cache frequently accessed data, rate limiter backing |
| Medium | **Real-time Updates** | WebSocket/SSE for live notifications and dashboard updates |
| Low | **Mobile App** | React Native companion app for employee self-service |
| Low | **Multi-language** | Internationalization (i18n) for Nepali and English |
| Low | **Audit Dashboard** | Visual audit log viewer for admin compliance tracking |

---

*Report generated for the Hospital HRMS project. For questions or contributions, refer to the project repository.*
