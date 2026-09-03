import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

import { RegisterPage } from '@/pages/auth/RegisterPage'
import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EmployeeListPage } from '@/pages/employees/EmployeeListPage';
import { EmployeeFormPage } from '@/pages/employees/EmployeeFormPage';
import { EmployeeDetailsPage } from '@/pages/employees/EmployeeDetailsPage';
import { DepartmentsPage } from '@/pages/departments/DepartmentsPage';
import { DesignationsPage } from '@/pages/designations/DesignationsPage';
import { AttendancePage } from '@/pages/attendance/AttendancePage';
import { LeavePage } from '@/pages/leave/LeavePage';
import {NotificationPage} from '@/pages/notifications/NotificationPage'
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import Shifts from '@/pages/shifts/shifts';
import Profile from '@/pages/Profile';
import Payroll from '@/pages/payroll/Payroll';
import PayrollDetails from '@/pages/payroll/PayrollDetails';
import SaveSalary from '@/pages/payroll/SaveSalary';
import Recruitment from '@/pages/recruitment/Recruitment';
import Traning from '@/pages/traning/Traning';
import EconomicYear from '@/pages/year/EconomicYear'
import MyNotificationPage from '@/pages/notifications/MyNotificationPage';
import MessageSetting from '@/pages/sms/MessageSetting'

const MANAGE_ROLES = ['super_admin', 'hr_manager', 'hospital_admin'];

export const router = createBrowserRouter([
  { path: '/register', element: <RegisterPage />},
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        children: [
          {
            element: <Layout />,
            children: [
              { path: '/', element: <Navigate to="/dashboard" replace /> },
              { path: '/dashboard', element: <DashboardPage /> },

              { path: '/employees', element: <EmployeeListPage /> },
              { path: '/employees/:id', element: <EmployeeDetailsPage /> },

              { path: '/attendance', element: <AttendancePage /> },
              { path: '/leave', element: <LeavePage /> },
              { path: '/shifts', element: <Shifts /> },
              { path: '/payroll', element: <Payroll /> },
             { path: '/message', element: <MessageSetting /> },
              { path: '/payroll-details', element: <PayrollDetails /> },
              { path: '/save-salary', element: <SaveSalary/> },
              { path: '/recruitment', element: <Recruitment /> },
              { path: '/economic-year', element: <EconomicYear/> },
              { path: '/performance', element: <ComingSoonPage title="Performance Management" /> },
              { path: '/training', element: <Traning /> },
              { path: '/assets', element: <ComingSoonPage title="Asset Management" /> },
              { path: '/notifications', element: <NotificationPage/> },
              { path: '/reports', element: <ComingSoonPage title="Reports" /> },
              { path: '/settings', element: <ComingSoonPage title="Settings" /> },
              { path: '/profile', element: <Profile /> },
              { path: 'my-notification', element: <MyNotificationPage /> },

              {
                element: <ProtectedRoute allowedRoles={[...MANAGE_ROLES]} />,
                children: [
                  { path: '/employees/new', element: <EmployeeFormPage /> },
                  { path: '/employees/:id/edit', element: <EmployeeFormPage /> },
                  { path: '/departments', element: <DepartmentsPage /> },
                  { path: '/designations', element: <DesignationsPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);