// Application-wide domain constants (roles, statuses, enums).
// Centralised here so controllers/services/validation all reference the same values.

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  HR_MANAGER: 'hr_manager',
  HOSPITAL_ADMIN: 'hospital_admin',
  DEPARTMENT_HEAD: 'department_head',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  PHARMACIST: 'pharmacist',
  LAB_TECHNICIAN: 'lab_technician',
  RECEPTIONIST: 'receptionist',
  ACCOUNTANT: 'accountant',
  EMPLOYEE: 'employee',
};

const ALL_ROLES = Object.values(ROLES);

const MANAGE_EMPLOYEE_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HOSPITAL_ADMIN];
const MANAGE_ATTENDANCE_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER, ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_HEAD];
const HR_ROLES = [ROLES.SUPER_ADMIN, ROLES.HR_MANAGER];
const DEPARTMENT_APPROVAL_ROLES = [ROLES.DEPARTMENT_HEAD, ROLES.SUPER_ADMIN, ROLES.HR_MANAGER];

const EMPLOYEE_STATUS = ['active', 'inactive', 'on_leave', 'terminated'];
const EMPLOYMENT_TYPE = ['full_time', 'part_time', 'contract', 'intern'];
const ATTENDANCE_STATUS = ['present', 'absent', 'half_day', 'late', 'on_leave', 'holiday'];
const LEAVE_REQUEST_STATUS = ['pending', 'dept_approved', 'approved', 'rejected', 'cancelled'];

module.exports = {
  ROLES,
  ALL_ROLES,
  MANAGE_EMPLOYEE_ROLES,
  MANAGE_ATTENDANCE_ROLES,
  HR_ROLES,
  DEPARTMENT_APPROVAL_ROLES,
  EMPLOYEE_STATUS,
  EMPLOYMENT_TYPE,
  ATTENDANCE_STATUS,
  LEAVE_REQUEST_STATUS,
};
