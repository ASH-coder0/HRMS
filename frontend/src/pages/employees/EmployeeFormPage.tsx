import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Department, Designation } from '@/types';

const schema = z.object({
  employee_code: z.string().min(1, 'Required'),
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  date_of_birth: z.string().optional(),
  date_of_joining: z.string().min(1, 'Required'),
  department_id: z.coerce.number().min(1, 'Select a department'),
  designation_id: z.coerce.number().min(1, 'Select a designation'),
  role_id: z.coerce.number().min(1, 'Select a role'),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  address: z.string().optional(),
  blood_group: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { employment_type: 'full_time', status: 'active' },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get<{ data: Department[] }>('/departments')).data.data,
  });

  const { data: designations } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => (await api.get<{ data: Designation[] }>('/designations')).data.data,
  });

  const { data: existing } = useQuery({
    queryKey: ['employees', id],
    queryFn: async () => (await api.get(`/employees/${id}`)).data.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (isEdit) return api.put(`/employees/${id}`, values);
      return api.post('/employees', values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/employees');
    },
  });

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit employee' : 'Add employee'} description="Keep employee records accurate and up to date." />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Employee code</Label>
              <Input {...register('employee_code')} placeholder="EMP-0003" />
              {errors.employee_code && <p className="text-xs text-destructive">{errors.employee_code.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select {...register('employment_type')}>
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input {...register('first_name')} />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input {...register('last_name')} />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input {...register('phone')} />
            </div>

            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select {...register('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date of birth</Label>
              <Input type="date" {...register('date_of_birth')} />
            </div>

            <div className="space-y-1.5">
              <Label>Date of joining</Label>
              <Input type="date" {...register('date_of_joining')} />
              {errors.date_of_joining && <p className="text-xs text-destructive">{errors.date_of_joining.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On leave</option>
                <option value="terminated">Terminated</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select {...register('department_id')}>
                <option value="">Select…</option>
                {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
              {errors.department_id && <p className="text-xs text-destructive">{errors.department_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Select {...register('designation_id')}>
                <option value="">Select…</option>
                {designations?.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </Select>
              {errors.designation_id && <p className="text-xs text-destructive">{errors.designation_id.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>System role</Label>
              <Select {...register('role_id')}>
                <option value="">Select…</option>
                <option value="1">Super Admin</option>
                <option value="2">HR Manager</option>
                <option value="3">Hospital Administrator</option>
                <option value="4">Department Head</option>
                <option value="5">Doctor</option>
                <option value="6">Nurse</option>
                <option value="7">Pharmacist</option>
                <option value="8">Lab Technician</option>
                <option value="9">Receptionist</option>
                <option value="10">Accountant</option>
                <option value="11">Employee</option>
              </Select>
              {errors.role_id && <p className="text-xs text-destructive">{errors.role_id.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Blood group</Label>
              <Input {...register('blood_group')} placeholder="O+" />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Address</Label>
              <Input {...register('address')} />
            </div>

            {mutation.isError && (
              <p className="md:col-span-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {(mutation.error as any)?.response?.data?.message || 'Something went wrong. Please try again.'}
              </p>
            )}

            <div className="flex justify-end gap-3 md:col-span-2">
              <Button type="button" variant="outline" onClick={() => navigate('/employees')}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
