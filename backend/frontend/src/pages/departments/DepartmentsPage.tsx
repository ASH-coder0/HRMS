import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Department } from '@/types';

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Department | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: async () => (await api.get<{ data: Department[] }>('/departments')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/departments/${editing.id}`, form);
      return api.post('/departments', form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', code: '', description: '' });
    setShowForm(true);
  }

  function openEdit(dept: Department) {
    setEditing(dept);
    setForm({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        description="Organize your hospital into clinical and administrative departments."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add department</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">{editing ? 'Edit department' : 'New department'}</p>
              <button onClick={closeForm}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !data?.length ? (
          <EmptyState icon={Building2} title="No departments yet" description="Create your first department to get started." />
        ) : (
          <div className="divide-y divide-border">
            {data.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{dept.name} {dept.code && <span className="ml-1 font-mono text-xs text-muted-foreground">({dept.code})</span>}</p>
                  {dept.description && <p className="text-sm text-muted-foreground">{dept.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={dept.is_active ? 'success' : 'secondary'}>{dept.is_active ? 'Active' : 'Inactive'}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(dept)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(dept.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
