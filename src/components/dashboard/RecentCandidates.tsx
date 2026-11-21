import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const statusDot: Record<string, string> = {
  new:       'bg-blue-500',
  screening: 'bg-yellow-500',
  interview: 'bg-violet-500',
  offer:     'bg-emerald-500',
  hired:     'bg-green-500',
  rejected:  'bg-red-500',
};

const statusLabel: Record<string, string> = {
  new:       'New',
  screening: 'Screening',
  interview: 'Interview',
  offer:     'Offer',
  hired:     'Hired',
  rejected:  'Rejected',
};

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
];

export function RecentCandidates() {
  const { data } = useQuery({
    queryKey: ['candidates', { limit: 5 }],
    queryFn: () => api.getCandidates({ limit: 5 }),
  });

  const recent = data?.data?.slice(0, 5) ?? [];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Recent Candidates</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Latest pipeline activity</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground">
          <Link to="/candidates">View all <ArrowRight className="h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <UserPlus className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No candidates yet</p>
            <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-xs">
              <Link to="/candidates">Add your first candidate →</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((candidate: any, i: number) => (
              <div key={candidate.id} className="flex items-center justify-between py-3 first:pt-0">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    avatarColors[i % avatarColors.length]
                  )}>
                    {candidate.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground">{candidate.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot[candidate.status] ?? 'bg-gray-400')} />
                  <span className="text-xs text-muted-foreground">{statusLabel[candidate.status] ?? candidate.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
