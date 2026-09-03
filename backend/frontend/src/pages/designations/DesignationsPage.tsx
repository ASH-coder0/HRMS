import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { Department, Designation } from '@/types';

export function DesignationsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Designation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', department_id: '', level: '' });

  const { data: designations, isLoading } = useQuery({
    queryKey: ['designations', 'all'],
    queryFn: async () => (await api.get<{ data: Designation[] }>('/designations')).data.data,
  });

  const { data: departments } = useQuery({
    queryKey: ['departments', 'all'],
    queryFn: async () => (await api.get<{ data: Department[] }>('/departments')).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form, department_id: Number(form.department_id) };
      if (editing) return api.put(`/designations/${editing.id}`, payload);
      return api.post('/designations', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/designations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: '', department_id: '', level: '' });
    setShowForm(true);
  }

  function openEdit(d: Designation) {
    setEditing(d);
    setForm({ title: d.title, department_id: String(d.department_id), level: d.level || '' });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  return (
    <div>
      <PageHeader
        title="Designations"
        description="Define job titles and map them to departments."
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add designation</Button>}
      />

      {showForm && (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">{editing ? 'Edit designation' : 'New designation'}</p>
              <button onClick={closeForm}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                  <option value="">Select…</option>
                  {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Level</Label>
                <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Junior / Senior / Manager" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={closeForm}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.title || !form.department_id || saveMutation.isPending}>Save</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !designations?.length ? (
          <EmptyState icon={Briefcase} title="No designations yet" description="Create your first designation to get started." />
        ) : (
          <div className="divide-y divide-border">
            {designations.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{d.title}</p>
                  <p className="text-sm text-muted-foreground">{d.Department?.name} {d.level && `· ${d.level}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
