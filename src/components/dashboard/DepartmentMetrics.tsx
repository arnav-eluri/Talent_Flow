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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Departments</CardTitle>
          <p className="text-xs text-muted-foreground">Headcount by department</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Building2 className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No departments yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxHeadcount = Math.max(...data.map(d => d.headcount), 1);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Departments</CardTitle>
        <p className="text-xs text-muted-foreground">Headcount by department</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {data.map((dept) => (
            <div key={dept.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{dept.name}</span>
                <span className="text-xs font-semibold text-foreground">{dept.headcount}</span>
              </div>
              <Progress value={(dept.headcount / maxHeadcount) * 100} className="h-1.5" />
              {dept.openPositions > 0 && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {dept.openPositions} open {dept.openPositions === 1 ? 'position' : 'positions'}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
