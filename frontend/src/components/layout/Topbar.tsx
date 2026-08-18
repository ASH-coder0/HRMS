import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { initials } from '@/lib/utils';
import { api } from '@/lib/api';
import DefaultImage from '@/assests/profile.jpg';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  link?: string | null;
  createdAt: string;
}

interface EmployeeProfile {
  first_name?: string;
  last_name?: string;
  profile_photo_url?: string | null;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);

  const crumbs = location.pathname.split('/').filter(Boolean);
  const userId = user?.id;

  const employeeCode = user?.employeeCode;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/employees/me');
        setEmployee(res.data?.data || null);
      } catch (error) {
        console.error('Failed to fetch employee profile:', error);
        setEmployee(null);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!employeeCode) return;

    const findNotification = async () => {
      try {
        const res = await api.get(
          `/notifications/user/${userId}`
        );

        setNotifications(res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      }
    };

    findNotification();
  }, [employeeCode]);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.is_read
  );

  const unreadCount = unreadNotifications.length;

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_read: 1 } : n
      )
    );

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifOpen(false);

    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  // Resolve where a notification should navigate to.
  // Falls back to /my-notification if no link was set on the backend.
  const getNotificationLink = (notification: Notification) => {
    return notification.link && notification.link.trim() !== ''
      ? notification.link
      : '/my-notification';
  };

  const fullName =
    `${employee?.first_name || ''} ${employee?.last_name || ''}`.trim();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      <button
        className="rounded-lg p-2 hover:bg-muted lg:hidden"
        onClick={onOpenMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </button>

      <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
        <Link to="/dashboard" className="hover:text-foreground">
          Home
        </Link>

        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5" />

            <span
              className={
                i === crumbs.length - 1
                  ? 'font-medium capitalize text-foreground'
                  : 'capitalize'
              }
            >
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

      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setNotifOpen((o) => !o)}
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-soft sm:w-96">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {employeeCode && (
                <span className="text-xs text-muted-foreground">
                  {employeeCode}
                </span>
              )}
            </div>

            <div className="max-h-80 divide-y divide-border overflow-y-auto">
              {unreadNotifications.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  You're all caught up.
                </p>
              ) : (
                unreadNotifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={getNotificationLink(notification)}
                    onClick={() =>
                      handleNotificationClick(notification)
                    }
                    className="group flex items-start gap-3 bg-primary/5 px-4 py-3 transition-colors hover:bg-muted"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {notification.title}
                      </p>

                      {notification.message && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <Link
                to="/my-notification"
                onClick={() => setNotifOpen(false)}
                className="flex items-center justify-center gap-1 border-t border-border py-2.5 text-sm font-medium text-primary hover:bg-muted"
              >
                View all notifications
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* User */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted"
        >
          {employee?.profile_photo_url ? (
            <img
              src={employee.profile_photo_url}
              alt={fullName || 'Profile'}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <img
              src={DefaultImage}
              alt={fullName || 'Profile'}
              className="h-8 w-8 rounded-full object-cover"
            />
          )}

          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight">
              {fullName || user?.email}
            </p>

            <p className="text-xs leading-tight text-muted-foreground">
              {user ? ROLE_LABELS[user.role] : ''}
            </p>
          </div>
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-soft">
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setUserMenuOpen(false)}
            >
              <UserIcon className="h-4 w-4" />
              My profile
            </Link>

            <button
              onClick={() => logout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}