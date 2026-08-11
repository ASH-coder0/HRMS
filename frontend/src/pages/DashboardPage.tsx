import { useQuery } from '@tanstack/react-query';
import {
  Users, UserCheck, UserX, CalendarClock, Cake, Palmtree,
  ClipboardList, Wallet, UserPlus, GraduationCap,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/common/PageHeader';
import type { DashboardCards } from '@/types';
import { formatDate } from '@/lib/utils';

const COLORS = ['hsl(211,88%,42%)', 'hsl(174,68%,36%)', 'hsl(38,90%,48%)', 'hsl(358,72%,51%)', 'hsl(152,55%,38%)'];

export function DashboardPage() {
  const cardsQuery = useQuery({
    queryKey: ['dashboard', 'cards'],
    queryFn: async () => (await api.get<{ data: DashboardCards }>('/dashboard/cards')).data.data,
  });

  const trendQuery = useQuery({
    queryKey: ['dashboard', 'attendance-trend'],
    queryFn: async () => (await api.get('/dashboard/attendance-trend')).data.data,
  });

  const deptQuery = useQuery({
    queryKey: ['dashboard', 'department-distribution'],
    queryFn: async () => (await api.get('/dashboard/department-distribution')).data.data,
  });

  const genderQuery = useQuery({
    queryKey: ['dashboard', 'gender-distribution'],
    queryFn: async () => (await api.get('/dashboard/gender-distribution')).data.data,
  });

  const leaveStatsQuery = useQuery({
    queryKey: ['dashboard', 'leave-statistics'],
    queryFn: async () => (await api.get('/dashboard/leave-statistics')).data.data,
  });

  const activityQuery = useQuery({
    queryKey: ['dashboard', 'recent-activity'],
    queryFn: async () => (await api.get('/dashboard/recent-activity')).data.data,
  });

  const c = cardsQuery.data;

  return (
    <div>
      <PageHeader title="Dashboard" description="A snapshot of your hospital's workforce, today." />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cardsQuery.isLoading || !c ? (
          Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Total Employees" value={c.totalEmployees} icon={Users} accent="primary" />
            <StatCard label="Active Employees" value={c.activeEmployees} icon={UserCheck} accent="success" />
            <StatCard label="Present Today" value={c.presentToday} icon={UserCheck} accent="accent" />
            <StatCard label="Absent Today" value={c.absentToday} icon={UserX} accent="destructive" />
            <StatCard label="On Leave" value={c.onLeaveToday} icon={CalendarClock} accent="warning" />
            <StatCard label="Upcoming Birthdays" value={c.upcomingBirthdays} icon={Cake} accent="accent" />
            <StatCard label="Pending Leave Requests" value={c.pendingLeaveRequests} icon={Palmtree} accent="warning" />
            <StatCard label="Pending Payroll" value={c.pendingPayroll} icon={Wallet} accent="primary" />
            <StatCard label="Open Recruitment" value={c.openRecruitment} icon={UserPlus} accent="accent" />
            <StatCard label="Training Sessions" value={c.upcomingTrainingSessions} icon={GraduationCap} accent="success" />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {trendQuery.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendQuery.data || []}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(211,88%,42%)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(211,88%,42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="hsl(211,88%,42%)" fill="url(#colorPresent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="w-full min-w-0">
  <CardHeader>
    <CardTitle>Department-wise employees</CardTitle>
  </CardHeader>

  <CardContent className="h-[320px] w-full min-w-0 px-2 sm:h-80 sm:px-6">
    {deptQuery.isLoading ? (
      <Skeleton className="h-full w-full" />
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={deptQuery.data || []}
            dataKey="count"
            nameKey="department"
            cx="50%"
            cy="45%"
            innerRadius="35%"
            outerRadius="65%"
            paddingAngle={2}
          >
            {(deptQuery.data || []).map((_: any, i: number) => (
              <Cell
                key={`cell-${i}`}
                fill={COLORS[i % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            wrapperStyle={{
              width: "100%",
              fontSize: "12px",
              lineHeight: "20px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    )}
  </CardContent>
</Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Gender distribution</CardTitle></CardHeader>
          <CardContent className="h-64">
            {genderQuery.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderQuery.data || []} dataKey="count" nameKey="gender" cx="50%" cy="50%" outerRadius={80}>
                    {(genderQuery.data || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leave statistics</CardTitle></CardHeader>
          <CardContent className="h-64">
            {leaveStatsQuery.isLoading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveStatsQuery.data || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(174,68%,36%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent activity</CardTitle></CardHeader>
          <CardContent className="max-h-64 space-y-3 overflow-y-auto">
            {activityQuery.isLoading || !activityQuery.data ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <>
                {activityQuery.data.newHires.map((h: any) => (
                  <div key={`hire-${h.id}`} className="flex items-start gap-2 text-sm">
                    <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p><strong>{h.first_name} {h.last_name}</strong> joined the team · {formatDate(h.createdAt)}</p>
                  </div>
                ))}
                {activityQuery.data.recentLeaves.map((l: any) => (
                  <div key={`leave-${l.id}`} className="flex items-start gap-2 text-sm">
                    <Palmtree className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <p>Leave approved for <strong>{l.Employee?.first_name} {l.Employee?.last_name}</strong></p>
                  </div>
                ))}
                {activityQuery.data.newHires.length === 0 && activityQuery.data.recentLeaves.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No recent activity yet.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
