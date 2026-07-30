export type Role =
  | 'super_admin' | 'hr_manager' | 'hospital_admin' | 'department_head' | 'doctor'
  | 'nurse' | 'pharmacist' | 'lab_technician' | 'receptionist' | 'accountant' | 'employee';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
  employeeId: number | null;
}

export interface Department {
  id: number;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
}

export interface Designation {
  id: number;
  title: string;
  department_id: number;
  level?: string;
  is_active: boolean;
  Department?: Department;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  date_of_joining: string;
  department_id: number;
  designation_id: number;
  role_id: number;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  address?: string;
  blood_group?: string;
  profile_photo_url?: string;
  medical_license_no?: string;
  medical_license_expiry?: string;
  Department?: Department;
  Designation?: Designation;
  Role?: { id: number; name: Role };
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: 'present' | 'absent' | 'half_day' | 'late' | 'on_leave' | 'holiday';
  is_manual_entry: boolean;
  overtime_minutes: number;
  late_minutes: number;
  remarks?: string;
  Employee?: Employee;
}

export interface LeaveType {
  id: number;
  name: string;
  default_days_per_year: number;
  is_paid: boolean;
}

export interface LeaveBalance {
  id: number;
  employee_id: number;
  leave_type_id: number;
  year: number;
  allocated_days: number;
  used_days: number;
  carried_forward_days: number;
  LeaveType?: LeaveType;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason?: string;
  status: 'pending' | 'dept_approved' | 'approved' | 'rejected' | 'cancelled';
  rejection_reason?: string;
  Employee?: Employee;
  LeaveType?: LeaveType;
  createdAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardCards {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  upcomingBirthdays: number;
  pendingLeaveRequests: number;
  pendingPayroll: number;
  openRecruitment: number;
  upcomingTrainingSessions: number;
}
