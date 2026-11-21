import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building2 } from 'lucide-react';

interface Dept {
  name: string;
  headcount: number;
  openPositions: number;
  avgPerformance: number;
  turnoverRate: number;
}

interface DepartmentMetricsProps {
  data: Dept[];
}

export function DepartmentMetrics({ data }: DepartmentMetricsProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Building2 className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No departments yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxHeadcount = Math.max(...data.map(d => d.headcount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Department Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((dept) => (
            <div key={dept.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{dept.name}</span>
                <span className="text-sm text-muted-foreground">{dept.headcount} employees</span>
              </div>
              <Progress value={(dept.headcount / maxHeadcount) * 100} className="h-2" />
              {dept.openPositions > 0 && (
                <p className="text-xs text-muted-foreground">{dept.openPositions} open positions</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
