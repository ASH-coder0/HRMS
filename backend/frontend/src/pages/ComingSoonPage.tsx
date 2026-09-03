import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Construction className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">This module is scaffolded, not fully wired up yet</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              The database models and API routes exist on the backend — extend the routes and add a page here
              following the same pattern as Employees, Attendance, or Leave.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
