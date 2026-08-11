import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, CheckCheck, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { Paginated } from '@/types';

export interface NotificationRecord {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  featuredImage?: string | null;
  is_read: boolean;
  link?: string | null;
  publishStatus: 'draft' | 'published';
  author?: string | null;
  status: number;
  publishDate?: string | null;
  createdAt: string;
  user?: { id: number; name: string; email: string };
}

const PUBLISH_VARIANT: Record<string, 'success' | 'secondary'> = {
  published: 'success',
  draft: 'secondary',
};

const MANAGE_ROLES = ['super_admin', 'hr_manager', 'hospital_admin', 'department_head'];

const EMPTY_FORM = {
  user_id: '',
  type: '',
  title: '',
  message: '',
  featuredImage: '',
  link: '',
  publishStatus: 'published' as 'draft' | 'published',
  author: '',
  status: 1,
};

export function NotificationPage() {
  const { user, hasRole } = useAuth();
  const canManage = hasRole(...(MANAGE_ROLES as any));
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [readFilter, setReadFilter] = useState('');
  const [publishFilter, setPublishFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Admins see everyone's notifications, regular users see only their own
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', { page, type, readFilter, publishFilter, canManage, userId: user?.id }],
    queryFn: async () => {
      if (canManage) {
        return (await api.get<{ data: NotificationRecord[]; pagination: Paginated<NotificationRecord>['pagination'] }>(
          '/notifications',
          {
            params: {
              page,
              limit: 10,
              type: type || undefined,
              is_read: readFilter || undefined,
              publishStatus: publishFilter || undefined,
            },
          }
        )).data;
      }
      return (await api.get<{ data: NotificationRecord[]; pagination: Paginated<NotificationRecord>['pagination'] }>(
        `/notifications/user/${user?.id}`,
        { params: { page, limit: 10, is_read: readFilter || undefined } }
      )).data;
    },
    enabled: !!user?.id,
  });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const createMutation = useMutation({
    mutationFn: async () => api.post('/notifications', form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => api.put(`/notifications/${editingId}`, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.patch(`/notifications/user/${user?.id}/read-all`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const openEdit = (n: NotificationRecord) => {
    setForm({
      user_id: String(n.user_id),
      type: n.type,
      title: n.title,
      message: n.message,
      featuredImage: n.featuredImage ?? '',
      link: n.link ?? '',
      publishStatus: n.publishStatus,
      author: n.author ?? '',
      status: n.status,
    });
    setEditingId(n.id);
    setShowForm(true);
  };

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const saving = createMutation.isPending || updateMutation.isPending;
  const formError = (createMutation.error || updateMutation.error) as any;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={canManage ? 'Manage and send notifications to users.' : 'Stay up to date with your notifications.'}
        action={
          <div className="flex gap-2">
            {!canManage && (
              <Button variant="outline" onClick={() => markAllReadMutation.mutate()} disabled={markAllReadMutation.isPending}>
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            )}
            {canManage && (
              <Button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}>
                <Plus className="h-4 w-4" /> New notification
              </Button>
            )}
          </div>
        }
      />

      {canManage && showForm && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">{editingId ? 'Edit notification' : 'New message'}</p>
              <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>

            {formError && (
              <p className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {formError?.response?.data?.message}
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Message to Recipient user ID</Label>
                <Input value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Input placeholder="e.g. system, leave, payroll" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Author</Label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <Label>Message</Label>
                <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Link (optional)</Label>
                <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Featured image URL (optional)</Label>
                <Input value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Publish status</Label>
                <Select value={form.publishStatus} onChange={(e) => setForm({ ...form, publishStatus: e.target.value as any })}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                onClick={() => (editingId ? updateMutation.mutate() : createMutation.mutate())}
                disabled={!form.user_id || !form.title || !form.message || saving}
              >
                {editingId ? 'Save changes' : 'Send notification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Select className="w-48" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            <option value="system">System</option>
            <option value="leave">Leave</option>
            <option value="payroll">Payroll</option>
            <option value="attendance">Attendance</option>
          </Select>
          <Select className="w-40" value={readFilter} onChange={(e) => { setReadFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </Select>
          {canManage && (
            <Select className="w-40" value={publishFilter} onChange={(e) => { setPublishFilter(e.target.value); setPage(1); }}>
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !items.length ? (
          <EmptyState icon={Bell} title="No notifications" description="Notifications will appear here." />
        ) : canManage ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Recipient</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Read</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{n.title}</td>
                    <td className="px-4 py-3">{n.type}</td>
                    <td className="px-4 py-3">{n.user ? n.user.name : n.user_id}</td>
                    <td className="px-4 py-3"><Badge variant={PUBLISH_VARIANT[n.publishStatus]}>{n.publishStatus}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge variant={n.is_read ? 'success' : 'secondary'}>{n.is_read ? 'Read' : 'Unread'}</Badge>
                    </td>
                    <td className="px-4 py-3">{formatDate(n.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(n)} title="Edit">
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this notification?')) deleteMutation.mutate(n.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.is_read ? 'bg-primary/5' : ''}`}>
                <div className="mt-1">
                  {!n.is_read && <span className="block h-2 w-2 rounded-full bg-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    <Badge variant="secondary" className="text-xs">{n.type}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                </div>
                {!n.is_read && (
                  <button
                    onClick={() => markReadMutation.mutate(n.id)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}