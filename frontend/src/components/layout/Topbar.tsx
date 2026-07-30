import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, LogOut, ChevronRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { initials } from '@/lib/utils';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  hr_manager: 'HR Manager',
  hospital_admin: 'Hospital Administrator',
  department_head: 'Department Head',
  doctor: 'Doctor',
  nurse: 'Nurse',
  pharmacist: 'Pharmacist',
  lab_technician: 'Lab Technician',
  receptionist: 'Receptionist',
  accountant: 'Accountant',
  employee: 'Employee',
};

export function Topbar({ onOpenMobileSidebar }: TopbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const crumbs = location.pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <button className="rounded-lg p-2 hover:bg-muted lg:hidden" onClick={onOpenMobileSidebar}>
        <Menu className="h-5 w-5" />
      </button>

      <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
        <Link to="/dashboard" className="hover:text-foreground">Home</Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />
            <span className={i === crumbs.length - 1 ? 'font-medium capitalize text-foreground' : 'capitalize'}>
              {crumb.replace(/-/g, ' ')}
            </span>
          </span>
        ))}
      </nav>

      <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search employees, requests…"
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <button onClick={toggleTheme} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Toggle theme">
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="relative">
        <button onClick={() => setNotifOpen((o) => !o)} className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-soft">
            <p className="px-2 py-1.5 text-sm font-semibold">Notifications</p>
            <div className="max-h-64 overflow-y-auto">
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={() => setUserMenuOpen((o) => !o)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initials(user?.email?.split('@')[0], '')}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight">{user?.email}</p>
            <p className="text-xs leading-tight text-muted-foreground">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-soft">
            <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted" onClick={() => setUserMenuOpen(false)}>
              <UserIcon className="h-4 w-4" /> My profile
            </Link>
            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
