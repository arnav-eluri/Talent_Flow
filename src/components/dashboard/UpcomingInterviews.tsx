import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Phone, Building, Sparkles, Calendar } from 'lucide-react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5" />,
  phone: <Phone className="h-3.5 w-3.5" />,
  onsite: <Building className="h-3.5 w-3.5" />,
  ai: <Sparkles className="h-3.5 w-3.5" />,
};

const typeColors: Record<string, string> = {
  video: 'bg-blue-500/10 text-blue-600',
  phone: 'bg-green-500/10 text-green-600',
  onsite: 'bg-purple-500/10 text-purple-600',
  ai: 'bg-primary/10 text-primary',
};

export function UpcomingInterviews() {
  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.getInterviews(),
  });

  const upcoming = interviews
    .filter((i: any) => i.status === 'scheduled')
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Upcoming Interviews</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/interviews" className="gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No upcoming interviews</p>
            <Button variant="link" size="sm" asChild className="mt-1 h-auto p-0 text-sm">
              <Link to="/interviews">Schedule one →</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((interview: any) => (
              <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{interview.candidateName}</p>
                  <p className="text-xs text-muted-foreground">{interview.position}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(interview.scheduledAt), 'MMM d, h:mm a')}
                  </div>
                </div>
                <Badge className={cn('gap-1', typeColors[interview.type] ?? 'bg-muted text-muted-foreground')}>
                  {typeIcons[interview.type]}
                  <span className="capitalize text-xs">{interview.type}</span>
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
