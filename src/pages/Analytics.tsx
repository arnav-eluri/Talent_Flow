import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '@/lib/api';
import { Users, Clock, UserPlus, Percent, Loader2 } from 'lucide-react';

const COLORS = [
  'hsl(172, 65%, 36%)',
  'hsl(199, 89%, 48%)',
  'hsl(262, 83%, 58%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
  'hsl(215, 25%, 45%)',
];

export default function Analytics() {
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>Failed to load analytics. Please try again.</p>
      </div>
    );
  }

  const deptData = analyticsData.departmentMetrics.map((d) => ({
    name: d.name,
    headcount: d.headcount,
    openPositions: d.openPositions,
  }));

  const pieData = analyticsData.departmentMetrics
    .filter((d) => d.headcount > 0)
    .map((d) => ({ name: d.name, value: d.headcount }));

  const metrics = [
    {
      label: 'Total Workforce',
      value: analyticsData.totalEmployees,
      icon: <Users className="h-5 w-5 text-primary" />,
      bg: 'bg-primary/10',
      sub: 'Active employees',
    },
    {
      label: 'New Hires (30d)',
      value: analyticsData.newHires,
      icon: <UserPlus className="h-5 w-5 text-success" />,
      bg: 'bg-success/10',
      sub: 'Started in last 30 days',
    },
    {
      label: 'Avg. Time to Hire',
      value: analyticsData.avgTimeToHire > 0 ? `${analyticsData.avgTimeToHire}d` : '—',
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      bg: 'bg-blue-500/10',
      sub: 'Days from application to hire',
    },
    {
      label: 'Turnover Rate',
      value: `${analyticsData.turnoverRate.toFixed(1)}%`,
      icon: <Percent className="h-5 w-5 text-destructive" />,
      bg: 'bg-destructive/10',
      sub: 'Inactive / total employees',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live workforce metrics — computed from current data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${m.bg}`}>{m.icon}</div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {m.label}
              </p>
              <p className="text-4xl font-bold tracking-tight">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Hiring vs Departures</CardTitle>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.hiringTrend} margin={{ left: -20 }}>
                  <defs>
                    <linearGradient id="aHires" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(172, 65%, 36%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(172, 65%, 36%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aDeps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="hires" name="Hires" stroke="hsl(172, 65%, 36%)" strokeWidth={2} fill="url(#aHires)" dot={false} />
                  <Area type="monotone" dataKey="departures" name="Departures" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="url(#aDeps)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-semibold">Workforce by Department</CardTitle>
            <p className="text-xs text-muted-foreground">Headcount distribution</p>
          </CardHeader>
          <CardContent className="pt-4">
            {pieData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                No employee data yet
              </div>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">Headcount & Open Positions by Department</CardTitle>
          <p className="text-xs text-muted-foreground">Current snapshot</p>
        </CardHeader>
        <CardContent className="pt-4">
          {deptData.length === 0 ? (
            <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
              No department data yet
            </div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="headcount" name="Headcount" fill="hsl(172, 65%, 36%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="openPositions" name="Open Positions" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
