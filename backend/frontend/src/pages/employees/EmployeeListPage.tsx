import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Download, FileSpreadsheet, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { initials } from '@/lib/utils';
import type { Employee, Paginated } from '@/types';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  inactive: 'secondary',
  on_leave: 'warning',
  terminated: 'destructive',
};

export function EmployeeListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', { search, status, page }],
    queryFn: async () => {
      const res = await api.get<{ data: Paginated<Employee> }>('/employees', {
        params: { search: search || undefined, status: status || undefined, page, limit: 10 },
      });
      return res.data.data;
    },
  });

  function exportCsv() {
    if (!data?.items.length) return;
    const header = ['Code', 'Name', 'Email', 'Department', 'Designation', 'Status'];
    const rows = data.items.map((e) => [
      e.employee_code, `${e.first_name} ${e.last_name}`, e.email,
      e.Department?.name || '', e.Designation?.title || '', e.status,
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        description="Manage every staff record across your hospital."
        action={
          <Link to="/employees/new">
            <Button><Plus className="h-4 w-4" /> Add employee</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or code…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On leave</option>
            <option value="terminated">Terminated</option>
          </Select>
          <Button variant="outline" onClick={exportCsv}><FileSpreadsheet className="h-4 w-4" /> Export CSV</Button>
          <Button variant="outline"><Download className="h-4 w-4" /> Export PDF</Button>
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !data?.items.length ? (
          <EmptyState icon={Users} title="No employees found" description="Try adjusting your filters, or add your first employee." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Employee</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Designation</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((emp) => (
                  <tr key={emp.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <Link to={`/employees/${emp.id}`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(emp.first_name, emp.last_name)}
                        </div>
                        <div>
                          <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{emp.employee_code}</td>
                    <td className="px-4 py-3">{emp.Department?.name || '—'}</td>
                    <td className="px-4 py-3">{emp.Designation?.title || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[emp.status] || 'secondary'}>{emp.status.replace('_', ' ')}</Badge>
                    </td>
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
