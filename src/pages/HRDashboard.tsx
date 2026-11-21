import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, UserPlus, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const COLORS = [
  'hsl(172, 65%, 36%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(215, 25%, 45%)',
];

const statusDot: Record<string, string> = {
  new: 'bg-blue-500',
  screening: 'bg-yellow-500',
  interview: 'bg-violet-500',
  offer: 'bg-emerald-500',
  hired: 'bg-green-500',
  rejected: 'bg-red-500',
};

export default function HRDashboard() {
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });

  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates(),
  });

  const { data: interviews = [], isLoading: loadingInterviews } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.getInterviews(),
  });

  const { data: onboardingTasks = [], isLoading: loadingOnboarding } = useQuery({
    queryKey: ['onboarding'],
    queryFn: () => api.getOnboardingTasks(),
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => api.getEmployees(),
  });

  const isLoading = loadingAnalytics || loadingCandidates || loadingInterviews || loadingOnboarding || loadingEmployees;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const upcomingInterviews = interviews
    .filter((i: any) => i.status === 'scheduled')
    .slice(0, 4);

  const activePendingTasks = onboardingTasks.filter((t: any) => t.status !== 'completed');
  const completedInterviewsThisMonth = interviews.filter((i: any) => {
    if (i.status !== 'completed') return false;
    const d = new Date(i.scheduledAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const onboardingEmployees = employees.filter((e: any) => e.status === 'onboarding');
  const onboardingProgress = onboardingEmployees.map((emp: any) => {
    const empTasks = onboardingTasks.filter((t: any) => t.employeeId === emp.id);
    const completed = empTasks.filter((t: any) => t.status === 'completed').length;
    return {
      name: emp.name,
      position: emp.position,
      completed,
      total: empTasks.length,
      progress: empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 0,
    };
  });

  const pieData = analytics.departmentMetrics
    .filter((d) => d.headcount > 0)
    .map((d) => ({ name: d.name, value: d.headcount }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">HR Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time HR metrics and pipeline overview</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Employees', value: analytics.totalEmployees, icon: <Users className="h-5 w-5 text-primary" />, bg: 'bg-primary/10' },
          { label: 'New Hires (30d)', value: analytics.newHires, icon: <UserPlus className="h-5 w-5 text-green-600" />, bg: 'bg-green-500/10' },
          { label: 'Completed Interviews', value: completedInterviewsThisMonth, icon: <CheckCircle className="h-5 w-5 text-violet-600" />, bg: 'bg-violet-500/10' },
          { label: 'Pending Onboarding', value: activePendingTasks.length, icon: <Clock className="h-5 w-5 text-orange-600" />, bg: 'bg-orange-500/10' },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <div className={`p-2 rounded-xl shrink-0 ${s.bg}`}>{s.icon}</div>
              </div>
              <p className="text-5xl font-bold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Hiring Trend</CardTitle>
            <CardDescription className="text-xs">Hires vs Departures — last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.hiringTrend} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="hires" stroke="hsl(172, 65%, 36%)" strokeWidth={2} name="Hires" dot={false} />
                <Line type="monotone" dataKey="departures" stroke="hsl(0, 84%, 60%)" strokeWidth={2} name="Departures" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Workforce by Department</CardTitle>
            <CardDescription className="text-xs">Headcount distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {pieData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">No employee data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Candidates</CardTitle>
            <CardDescription className="text-xs">Latest pipeline activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {recentCandidates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No candidates yet</p>
            ) : (
              <div className="divide-y divide-border">
                {recentCandidates.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-3 first:pt-0">
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.position}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[c.status] ?? 'bg-gray-400'}`} />
                      <span className="text-xs text-muted-foreground capitalize">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
            <CardDescription className="text-xs">Scheduled and pending</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {upcomingInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No interviews scheduled</p>
            ) : (
              <div className="divide-y divide-border">
                {upcomingInterviews.map((i: any) => (
                  <div key={i.id} className="flex items-center justify-between py-3 first:pt-0">
                    <div>
                      <p className="text-sm font-medium">{i.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{i.position}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize text-xs">{i.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {onboardingProgress.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Onboarding Progress</CardTitle>
            <CardDescription className="text-xs">Employees currently onboarding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {onboardingProgress.map((emp) => (
                <div key={emp.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.position}</p>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{emp.completed}/{emp.total} tasks</span>
                  </div>
                  <Progress value={emp.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">Headcount by Department</CardTitle>
          <CardDescription className="text-xs">Staff vs open positions</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {analytics.departmentMetrics.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.departmentMetrics} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="headcount" name="Headcount" fill="hsl(172, 65%, 36%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="openPositions" name="Open Positions" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
