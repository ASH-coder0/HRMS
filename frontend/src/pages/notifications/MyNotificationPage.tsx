import { useEffect, useState } from 'react';
import {
  Bell,
  X,
  Calendar,
  User as UserIcon,
  Tag,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  link?: string | null;
  createdAt: string;
  updatedAt?: string;
  featuredImage?: string | null;
  content?: string | null;
  publishStatus?: string;
  author?: string;
  status?: number;
  publishDate?: string;
}

const TYPE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  meeting: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  metting: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  leave: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  payroll: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  alert: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
  system: { bg: 'bg-violet-50', text: 'text-violet-600', dot: 'bg-violet-500' },
};

const DEFAULT_TYPE_STYLE = {
  bg: 'bg-primary/10',
  text: 'text-primary',
  dot: 'bg-primary',
};

function typeStyle(type?: string) {
  if (!type) return DEFAULT_TYPE_STYLE;
  return TYPE_STYLES[type.toLowerCase()] || DEFAULT_TYPE_STYLE;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const MyNotificationPage = () => {
const { user } = useAuth();

const userId = user?.id ?? null;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);

 useEffect(() => {
  if (!userId) return;

  const findNotification = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/notifications/user/${userId}`);

      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  findNotification();
}, [userId]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n))
    );

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const openNotification = (notification: Notification) => {
    setSelected(notification);
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const closeDrawer = () => setSelected(null);

  return (
    <div className="min-h-full bg-gradient-to-b from-muted/60 to-transparent">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Notifications
                </h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${
                        unreadCount > 1 ? 's' : ''
                      }`
                    : 'You\u2019re all caught up'}
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-destructive px-2 text-xs font-bold text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-card shadow-sm"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Nothing here yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              New notifications will show up in this list.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((notification) => {
              const style = typeStyle(notification.type);
              const unread = !notification.is_read;

              return (
                <button
                  key={notification.id}
                  onClick={() => openNotification(notification)}
                  className={`group flex w-full items-start gap-3.5 rounded-2xl border bg-card px-4 py-4 text-left shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-md sm:px-5 ${
                    unread
                      ? 'border-primary/20 ring-primary/10'
                      : 'border-border'
                  }`}
                >
                  {notification.featuredImage ? (
                    <img
                      src={notification.featuredImage}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${style.bg}`}
                    >
                      <Bell className={`h-5 w-5 ${style.text}`} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-sm ${
                          unread
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground/90'
                        }`}
                      >
                        {notification.title}
                      </p>
                      {unread && (
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                        />
                      )}
                    </div>

                    {notification.message && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {notification.type && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${style.bg} ${style.text}`}
                          >
                            <Tag className="h-3 w-3" />
                            {notification.type}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Full notice drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-[2px]">
          <div
            className="absolute inset-0"
            onClick={closeDrawer}
          />

          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-in slide-in-from-right relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-card shadow-2xl duration-200 sm:rounded-l-3xl"
          >
            {(() => {
              const style = typeStyle(selected.type);
              return selected.featuredImage ? (
                <div className="relative h-56 w-full shrink-0">
                  <img
                    src={selected.featuredImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/40" />

                  <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); closeDrawer(); }}
                      className="rounded-full bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50 sm:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); closeDrawer(); }}
                      className="ml-auto rounded-full bg-black/30 p-2 text-white backdrop-blur hover:bg-black/50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 px-6 pb-5">
                    {selected.type && (
                      <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold capitalize text-foreground">
                        <Tag className="h-3 w-3" />
                        {selected.type}
                      </span>
                    )}
                    <h2 className="text-xl font-semibold leading-snug text-white drop-shadow-sm">
                      {selected.title}
                    </h2>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative shrink-0 overflow-hidden px-6 pb-6 pt-5 ${style.bg}`}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/40 blur-2xl" />

                  <div className="relative z-10 mb-8 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); closeDrawer(); }}
                      className="rounded-full p-2 text-foreground/60 hover:bg-black/5 sm:hidden"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <span className="hidden text-xs font-medium uppercase tracking-wide text-foreground/50 sm:block">
                      Notification
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); closeDrawer(); }}
                      className="rounded-full p-2 text-foreground/60 hover:bg-black/5"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div
                    className={`relative mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ${style.text}`}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>

                  {selected.type && (
                    <span
                      className={`mb-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold capitalize ${style.text}`}
                    >
                      <Tag className="h-3 w-3" />
                      {selected.type}
                    </span>
                  )}

                  <h2 className="text-xl font-semibold leading-snug text-foreground">
                    {selected.title}
                  </h2>
                </div>
              );
            })()}

            <div className="flex-1 px-6 py-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border pb-4 text-xs text-muted-foreground">
                {selected.author && (
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-3.5 w-3.5" />
                    {selected.author}
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(selected.publishDate || selected.createdAt)}
                </span>
              </div>

              <div className="mt-5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                {selected.content || selected.message}
              </div>

              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
                >
                  Open related link
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotificationPage;