import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  screening: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  interview: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  offer: 'bg-green-500/10 text-green-600 border-green-500/20',
  hired: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function RecentCandidates() {
  const { data } = useQuery({
    queryKey: ['candidates', { limit: 5 }],
    queryFn: () => api.getCandidates({ limit: 5 }),
  });

  const recent = data?.data?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Candidates</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/candidates" className="gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <UserPlus className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No candidates yet</p>
            <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-sm">
              <Link to="/candidates">Add your first candidate →</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((candidate) => (
              <div key={candidate.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {candidate.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground">{candidate.position}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn('capitalize text-xs', statusColors[candidate.status])}>
                  {candidate.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
