import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Palmtree, Plus, Check, X as XIcon, Ban } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { LeaveRequest, LeaveType, Paginated } from '@/types';

const STATUS_VARIANT: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  pending: 'warning',
  dept_approved: 'warning',
  approved: 'success',
  rejected: 'destructive',
  cancelled: 'secondary',
};

const HR_ROLES = ['super_admin', 'hr_manager'];
const DEPT_ROLES = ['department_head', 'super_admin', 'hr_manager'];

export function LeavePage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });

  const { data: types } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => (await api.get<{ data: LeaveType[] }>('/leave/types')).data.data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => (await api.get<{ data: Paginated<LeaveRequest> }>('/leave', { params: { limit: 20 } })).data.data,
  });

  const applyMutation = useMutation({
    mutationFn: async () => api.post('/leave', { ...form, leave_type_id: Number(form.leave_type_id) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      setShowForm(false);
      setForm({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: string }) => api.patch(`/leave/${id}/${action}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
  });

  return (
    <div>
      <PageHeader
        title="Leave management"
        description="Apply for leave and track approvals across departments."
        action={<Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Apply for leave</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <p className="mb-3 font-semibold">New leave request</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Leave type</Label>
                <Select value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}>
                  <option value="">Select…</option>
                  {types?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Start date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End date</Label>
                <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
              </div>
            </div>
            {applyMutation.isError && (
              <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {(applyMutation.error as any)?.response?.data?.message}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button
                onClick={() => applyMutation.mutate()}
                disabled={!form.leave_type_id || !form.start_date || !form.end_date || applyMutation.isPending}
              >
                Submit request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState icon={Palmtree} title="No leave requests yet" description="Apply for leave to see it tracked here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Days</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((req) => (
                  <tr key={req.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">{req.Employee ? `${req.Employee.first_name} ${req.Employee.last_name}` : req.employee_id}</td>
                    <td className="px-4 py-3">{req.LeaveType?.name}</td>
                    <td className="px-4 py-3">{formatDate(req.start_date)} – {formatDate(req.end_date)}</td>
                    <td className="px-4 py-3 font-mono">{req.total_days}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[req.status]}>{req.status.replace('_', ' ')}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {req.status === 'pending' && hasRole(...(DEPT_ROLES as any)) && (
                          <Button variant="ghost" size="icon" title="Department approve" onClick={() => actionMutation.mutate({ id: req.id, action: 'department-approve' })}>
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                        )}
                        {['pending', 'dept_approved'].includes(req.status) && hasRole(...(HR_ROLES as any)) && (
                          <Button variant="ghost" size="icon" title="HR approve" onClick={() => actionMutation.mutate({ id: req.id, action: 'hr-approve' })}>
                            <Check className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {!['approved', 'rejected', 'cancelled'].includes(req.status) && hasRole(...(DEPT_ROLES as any)) && (
                          <Button variant="ghost" size="icon" title="Reject" onClick={() => actionMutation.mutate({ id: req.id, action: 'reject' })}>
                            <XIcon className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {req.status === 'pending' && (
                          <Button variant="ghost" size="icon" title="Cancel" onClick={() => actionMutation.mutate({ id: req.id, action: 'cancel' })}>
                            <Ban className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
