import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface EmployeeShiftAssignment {
  id: number;
  employee_id: number;
  shift_id: number;
  effective_date: string;
  day_of_week: number;
  Shift?: {
    id: number;
    name: string;
    start_time?: string;
    end_time?: string;
  };
}
function todayDayOfWeek() {
  return new Date().getDay();
}

function formatTime(value?: string) {
  if (!value) return '';
  const [h, m] = value.split(':');
  if (h === undefined) return value;
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = ((hour + 11) % 12) + 1;
  return `${displayHour}:${m ?? '00'} ${suffix}`;
}

export function ShiftBadge() {
  const [shift, setShift] = useState<EmployeeShiftAssignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const findShift = async () => {
      try {
        setLoading(true);
        const res = await api.get('/shifts/my-shift');
        const assignments: EmployeeShiftAssignment[] = res.data.data || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dow = todayDayOfWeek();

        const active = assignments
          .filter((a) => {
            if (Number(a.day_of_week) !== dow) return false;
            const eff = new Date(a.effective_date);
            return eff <= today;
          })
          .sort(
            (a, b) =>
              new Date(b.effective_date).getTime() -
              new Date(a.effective_date).getTime()
          )[0];

        if (import.meta.env?.DEV) {
          // eslint-disable-next-line no-console
          console.debug('[ShiftBadge] my-shift response:', {
            todayDayOfWeek: dow,
            assignments,
            matched: active,
          });
        }

        setShift(active || null);
      } catch (error) {
        console.error('Failed to fetch shift:', error);
        setShift(null);
      } finally {
        setLoading(false);
      }
    };

    findShift();
  }, []);

  if (loading) {
    return (
      <div className="h-[52px] w-48 shrink-0 animate-pulse rounded-2xl bg-muted" />
    );
  }

  if (!shift) {
    return (
      <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Clock className="h-4 w-4" />
        </span>

        <div className="leading-tight">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Today&apos;s shift
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            No shift scheduled
          </p>
        </div>
      </div>
    );
  }

  const shiftName = shift.Shift?.name || `Shift #${shift.shift_id}`;
  const timeRange =
    shift.Shift?.start_time && shift.Shift?.end_time
      ? `${formatTime(shift.Shift.start_time)} \u2013 ${formatTime(
          shift.Shift.end_time
        )}`
      : null;

  return (
    <div className="flex shrink-0 items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-sm">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Clock className="h-4 w-4" />
      </span>

      <div className="leading-tight">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Today&apos;s shift
        </p>
        <p className="text-sm font-semibold text-foreground">
          {shiftName}
          {timeRange && (
            <span className="ml-1 font-normal text-muted-foreground">
              · {timeRange}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}