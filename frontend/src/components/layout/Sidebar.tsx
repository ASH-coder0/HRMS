import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Briefcase, CalendarCheck, Clock,
  Palmtree, Wallet, ChevronsLeft, ChevronsRight, HeartPulse,MessageSquare,
  WalletCardsIcon,
  UserPlus,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users },
  { label: 'Departments', to: '/departments', icon: Building2, roles: ['super_admin', 'hr_manager', 'hospital_admin'] },
    { label: 'Economic year', to: '/economic-year', icon: Calendar, roles: ['super_admin', 'hr_manager', 'hospital_admin'] },
  { label: 'Designations', to: '/designations', icon: Briefcase, roles: ['super_admin', 'hr_manager', 'hospital_admin'] },
  { label: 'Attendance', to: '/attendance', icon: CalendarCheck },
  { label: 'Shifts', to: '/shifts', icon: Clock, roles: ['super_admin', 'hr_manager', 'hospital_admin', 'department_head'] },
  { label: 'Leave', to: '/leave', icon: Palmtree },
  { label: 'Payroll', to: '/payroll', icon: Wallet, roles: ['super_admin', 'hr_manager', 'accountant'] },
    { label: 'Salary Entry', to: '/save-salary', icon: WalletCardsIcon, roles: ['super_admin', 'hr_manager', 'accountant'] },
   { label: 'Recruitment', to: '/recruitment', icon: UserPlus, roles: ['super_admin', 'hr_manager', 'hospital_admin'] },
  // { label: 'Performance', to: '/performance', icon: Award, roles: ['super_admin', 'hr_manager', 'department_head', 'hospital_admin'] },
 { label: 'Training', to: '/training', icon: GraduationCap },
  // { label: 'Assets', to: '/assets', icon: Boxes, roles: ['super_admin', 'hr_manager', 'hospital_admin'] },
  { label: 'Message', to: '/notifications', icon: MessageSquare },
  // { label: 'Reports', to: '/reports', icon: FileBarChart, roles: ['super_admin', 'hr_manager', 'hospital_admin', 'accountant'] },
  // { label: 'Settings', to: '/settings', icon: Settings, roles: ['super_admin', 'hospital_admin'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-screen',
          collapsed ? 'lg:w-[76px]' : 'lg:w-64',
          mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeartPulse className="h-5 w-5" />
          </div>
          {!collapsed && <span className="truncate font-bold tracking-tight">Hospital HRMS</span>}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onToggle}
          className="hidden items-center justify-center gap-2 border-t border-border py-3 text-sm text-muted-foreground hover:bg-muted lg:flex"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <><ChevronsLeft className="h-4 w-4" /> Collapse</>}
        </button>
      </aside>
    </>
  );
}
