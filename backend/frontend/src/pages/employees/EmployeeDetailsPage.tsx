import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Pencil, Mail, Phone, MapPin, Droplet, ShieldCheck, FileText, GraduationCap, Briefcase, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, initials } from '@/lib/utils';

export function EmployeeDetailsPage() {
  const { id } = useParams();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employees', id],
    queryFn: async () => (await api.get(`/employees/${id}`)).data.data,
  });

  if (isLoading || !employee) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${employee.first_name} ${employee.last_name}`}
        description={employee.Designation?.title ? `${employee.Designation.title} · ${employee.Department?.name}` : ''}
        action={
          <Link to={`/employees/${id}/edit`}>
            <Button variant="outline"><Pencil className="h-4 w-4" /> Edit</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              {initials(employee.first_name, employee.last_name)}
            </div>
            <p className="mt-3 font-semibold">{employee.first_name} {employee.last_name}</p>
            <p className="font-mono text-xs text-muted-foreground">{employee.employee_code}</p>
            <Badge className="mt-2" variant={employee.status === 'active' ? 'success' : 'secondary'}>{employee.status}</Badge>

            <div className="mt-5 w-full space-y-2 text-left text-sm">
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {employee.email}</div>
              {employee.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {employee.phone}</div>}
              {employee.address && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {employee.address}</div>}
              {employee.blood_group && <div className="flex items-center gap-2 text-muted-foreground"><Droplet className="h-4 w-4" /> {employee.blood_group}</div>}
              {employee.medical_license_no && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4" /> License {employee.medical_license_no} · exp. {formatDate(employee.medical_license_expiry)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Employment details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-muted-foreground">Department</p><p className="font-medium">{employee.Department?.name || '—'}</p></div>
              <div><p className="text-muted-foreground">Designation</p><p className="font-medium">{employee.Designation?.title || '—'}</p></div>
              <div><p className="text-muted-foreground">Employment type</p><p className="font-medium capitalize">{employee.employment_type.replace('_', ' ')}</p></div>
              <div><p className="text-muted-foreground">Date of joining</p><p className="font-medium">{formatDate(employee.date_of_joining)}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Emergency contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {employee.emergencyContacts?.length ? employee.emergencyContacts.map((c: any) => (
                <div key={c.id} className="flex justify-between rounded-lg border border-border p-3">
                  <div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.relationship}</p></div>
                  <p className="text-muted-foreground">{c.phone}</p>
                </div>
              )) : <p className="text-muted-foreground">No emergency contacts on file.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {employee.education?.length ? employee.education.map((e: any) => (
                <div key={e.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{e.degree}</p>
                  <p className="text-xs text-muted-foreground">{e.institution} · {e.year_completed}</p>
                </div>
              )) : <p className="text-muted-foreground">No education records on file.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Experience</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {employee.experience?.length ? employee.experience.map((e: any) => (
                <div key={e.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{e.designation} · {e.organization}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.start_date)} – {formatDate(e.end_date)}</p>
                </div>
              )) : <p className="text-muted-foreground">No prior experience records on file.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {employee.documents?.length ? employee.documents.map((d: any) => (
                <a key={d.id} href={d.file_url} target="_blank" rel="noreferrer" className="flex justify-between rounded-lg border border-border p-3 hover:bg-muted">
                  <p className="font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{d.doc_type.replace('_', ' ')}</p>
                </a>
              )) : <p className="text-muted-foreground">No documents uploaded yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
