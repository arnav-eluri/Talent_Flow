import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

const periods = ['30d', '3m', '6m', '1y'] as const;

interface HiringChartProps {
  data: { month: string; hires: number; departures: number }[];
}

export function HiringChart({ data }: HiringChartProps) {
  const [period, setPeriod] = useState<typeof periods[number]>('6m');

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Hiring Trend</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">New hires vs departures</p>
          </div>
          <div className="flex items-center bg-muted rounded-lg p-1 gap-0.5">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'text-xs font-medium px-3 py-1.5 rounded-md transition-all',
                  period === p
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hiresGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(172, 65%, 36%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(172, 65%, 36%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="depsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '10px',
                  fontSize: 12,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                }}
              />
              <Area type="monotone" dataKey="hires" name="New Hires" stroke="hsl(172, 65%, 36%)" strokeWidth={2} fillOpacity={1} fill="url(#hiresGrad)" dot={false} />
              <Area type="monotone" dataKey="departures" name="Departures" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fillOpacity={1} fill="url(#depsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-0.5 rounded-full bg-primary inline-block" />
            New Hires
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-3 h-0.5 rounded-full bg-destructive inline-block" />
            Departures
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
