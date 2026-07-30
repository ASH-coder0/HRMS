import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, LogIn, LogOut, Plus, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { AttendanceRecord, Paginated } from '@/types';

const STATUS_VARIANT: Record<string, 'success' | 'destructive' | 'warning' | 'secondary'> = {
  present: 'success',
  absent: 'destructive',
  late: 'warning',
  half_day: 'warning',
  on_leave: 'secondary',
  holiday: 'secondary',
};

const MANAGE_ROLES = ['super_admin', 'hr_manager', 'hospital_admin', 'department_head'];

export function AttendancePage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ employee_id: '', date: '', status: 'present', remarks: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', { page, status }],
    queryFn: async () => (await api.get<{ data: Paginated<AttendanceRecord> }>('/attendance', {
      params: { page, limit: 10, status: status || undefined },
    })).data.data,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => api.post('/attendance/check-in'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => api.post('/attendance/check-out'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
  });

  const manualMutation = useMutation({
    mutationFn: async () => api.post('/attendance/manual', manualForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setShowManual(false);
    },
  });

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track daily check-ins, check-outs, and attendance history."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => checkInMutation.mutate()} disabled={checkInMutation.isPending}>
              <LogIn className="h-4 w-4" /> Check in
            </Button>
            <Button variant="outline" onClick={() => checkOutMutation.mutate()} disabled={checkOutMutation.isPending}>
              <LogOut className="h-4 w-4" /> Check out
            </Button>
            {hasRole(...(MANAGE_ROLES as any)) && (
              <Button onClick={() => setShowManual(true)}><Plus className="h-4 w-4" /> Manual entry</Button>
            )}
          </div>
        }
      />

      {(checkInMutation.isError || checkOutMutation.isError) && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {((checkInMutation.error || checkOutMutation.error) as any)?.response?.data?.message}
        </p>
      )}

      {showManual && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Manual attendance entry</p>
              <button onClick={() => setShowManual(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input value={manualForm.employee_id} onChange={(e) => setManualForm({ ...manualForm, employee_id: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={manualForm.status} onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half day</option>
                  <option value="late">Late</option>
                  <option value="on_leave">On leave</option>
                  <option value="holiday">Holiday</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Remarks</Label>
                <Input value={manualForm.remarks} onChange={(e) => setManualForm({ ...manualForm, remarks: e.target.value })} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowManual(false)}>Cancel</Button>
              <Button onClick={() => manualMutation.mutate()} disabled={!manualForm.employee_id || !manualForm.date || manualMutation.isPending}>Save entry</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Select className="w-48" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half day</option>
            <option value="on_leave">On leave</option>
            <option value="holiday">Holiday</option>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !data?.items.length ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" description="Records will appear here once employees check in." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Check in</th>
                  <th className="px-4 py-3 font-medium">Check out</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((rec) => (
                  <tr key={rec.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">{rec.Employee ? `${rec.Employee.first_name} ${rec.Employee.last_name}` : rec.employee_id}</td>
                    <td className="px-4 py-3">{formatDate(rec.date)}</td>
                    <td className="px-4 py-3">{rec.check_in ? new Date(rec.check_in).toLocaleTimeString() : '—'}</td>
                    <td className="px-4 py-3">{rec.check_out ? new Date(rec.check_out).toLocaleTimeString() : '—'}</td>
                    <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[rec.status]}>{rec.status.replace('_', ' ')}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />}
      </Card>
    </div>
  );
}
