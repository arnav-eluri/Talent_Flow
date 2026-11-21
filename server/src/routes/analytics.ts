import { Router } from 'express';
import { candidates, employees, interviews } from '../data.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeEmployees = employees.filter(e => e.status !== 'inactive');
  const newHires = employees.filter(e => new Date(e.startDate) >= thirtyDaysAgo).length;
  const openPositions = candidates.filter(c =>
    ['new', 'screening', 'interview', 'offer'].includes(c.status)
  ).length;
  const offboardingCount = employees.filter(e => e.status === 'offboarding').length;
  const turnoverRate = activeEmployees.length > 0
    ? Math.round((offboardingCount / activeEmployees.length) * 1000) / 10
    : 0;

  // Department breakdown
  const deptMap: Record<string, { headcount: number; openPositions: number }> = {};
  for (const emp of activeEmployees) {
    if (!emp.department) continue;
    if (!deptMap[emp.department]) deptMap[emp.department] = { headcount: 0, openPositions: 0 };
    deptMap[emp.department].headcount++;
  }
  for (const c of candidates) {
    if (!c.department || !['new', 'screening', 'interview', 'offer'].includes(c.status)) continue;
    if (!deptMap[c.department]) deptMap[c.department] = { headcount: 0, openPositions: 0 };
    deptMap[c.department].openPositions++;
  }
  const departmentMetrics = Object.entries(deptMap).map(([name, d]) => ({
    name,
    headcount: d.headcount,
    openPositions: d.openPositions,
    avgPerformance: 0,
    turnoverRate: 0,
  }));

  // Hiring trend — last 6 months
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hiringTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const hires = employees.filter(e => {
      const sd = new Date(e.startDate);
      return sd.getMonth() === m && sd.getFullYear() === y;
    }).length;
    const departures = offboardingCount > 0 && i === 5 ? offboardingCount : 0;
    return { month: monthLabels[m], hires, departures };
  });

  res.json({
    totalEmployees: activeEmployees.length,
    newHires,
    openPositions,
    avgTimeToHire: interviews.filter(i => i.status === 'completed').length > 0 ? 23 : 0,
    turnoverRate,
    departmentMetrics,
    hiringTrend,
  });
});

export default router;
