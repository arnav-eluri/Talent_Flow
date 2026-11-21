import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Phone, Building, Sparkles, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

const typeConfig: Record<string, { icon: ReactNode; color: string }> = {
  video:  { icon: <Video className="h-3.5 w-3.5" />,    color: 'bg-blue-100 text-blue-600' },
  phone:  { icon: <Phone className="h-3.5 w-3.5" />,    color: 'bg-green-100 text-green-600' },
  onsite: { icon: <Building className="h-3.5 w-3.5" />, color: 'bg-purple-100 text-purple-600' },
  ai:     { icon: <Sparkles className="h-3.5 w-3.5" />, color: 'bg-primary/10 text-primary' },
};

export function UpcomingInterviews() {
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.getInterviews(),
  });

  const upcoming = (interviews as any[])
    .filter((i) => i.status === 'scheduled')
    .slice(0, 4);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Upcoming Interviews</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Scheduled this week</p>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-muted-foreground hover:text-foreground">
          <Link to="/interviews">View all <ArrowRight className="h-3 w-3" /></Link>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium">No upcoming interviews</p>
            <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-xs">
              <Link to="/interviews">Schedule one →</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {upcoming.map((interview: any) => {
              const config = typeConfig[interview.type] ?? { icon: <Calendar className="h-3.5 w-3.5" />, color: 'bg-muted text-muted-foreground' };
              return (
                <div key={interview.id} className="flex items-center justify-between py-3 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', config.color)}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{interview.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{interview.position}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-foreground">
                      {format(new Date(interview.scheduledAt), 'MMM d')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(interview.scheduledAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
