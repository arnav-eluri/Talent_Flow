import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: ReactNode;
  trend?: 'up' | 'down';
  className?: string;
}

export function StatCard({ title, value, change, icon, trend, className }: StatCardProps) {
  const isPositive = trend === 'up';
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <div className="rounded-lg bg-primary/10 p-2 shrink-0">
            {icon}
          </div>
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <div className={cn(
              'flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full',
              isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change > 0 ? '+' : ''}{change}%
            </div>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
