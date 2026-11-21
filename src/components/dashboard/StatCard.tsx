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
  featured?: boolean;
  className?: string;
}

export function StatCard({ title, value, change, icon, trend, featured = false, className }: StatCardProps) {
  const isPositive = trend === 'up';
  return (
    <Card className={cn(
      'overflow-hidden border-0 shadow-sm',
      featured && 'bg-primary text-primary-foreground',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <p className={cn(
            'text-[11px] font-semibold uppercase tracking-widest',
            featured ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <div className={cn(
            'rounded-xl p-2.5 shrink-0',
            featured ? 'bg-primary-foreground/15' : 'bg-primary/10'
          )}>
            <div className={featured ? 'text-primary-foreground' : 'text-primary'}>
              {icon}
            </div>
          </div>
        </div>
        <p className={cn(
          'text-5xl font-bold tracking-tight leading-none',
          featured ? 'text-primary-foreground' : 'text-foreground'
        )}>
          {value}
        </p>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-3">
            <span className={cn(
              'inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full',
              featured
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : (isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className={cn(
              'text-[11px]',
              featured ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}>
              vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
