import { employees } from './data/employees';
import type {
  FormResponse,
  EmployeeSummary,
  RankedEmployee,
  AggregatedStats,
  Period,
} from './types';

export function filterByPeriod(
  responses: FormResponse[],
  period: Period
): FormResponse[] {
  const now = new Date();

  const startOf = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const todayStart = startOf(now);

  const weekStart = startOf(now);
  weekStart.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
  ); // Monday

  const monthStart = startOf(now);
  monthStart.setDate(1);

  const cutoff: Record<Period, Date> = {
    today: todayStart,
    week: weekStart,
    month: monthStart,
  };

  const from = cutoff[period];

  return responses.filter((r) => new Date(r.timestamp) >= from);
}

export function sumByEmployee(responses: FormResponse[]): EmployeeSummary[] {
  const map = new Map<string, { totalUnits: number; entryCount: number }>();

  for (const r of responses) {
    const existing = map.get(r.mitarbeiter);

    if (existing) {
      existing.totalUnits += r.einheiten;
      existing.entryCount += 1;
    } else {
      map.set(r.mitarbeiter, {
        totalUnits: r.einheiten,
        entryCount: 1,
      });
    }
  }

  return Array.from(map.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));
}

export function rankEmployees(summaries: EmployeeSummary[]): RankedEmployee[] {
  const sorted = [...summaries].sort((a, b) => b.totalUnits - a.totalUnits);
  const leaderUnits = sorted[0]?.totalUnits ?? 1;

  return sorted.map((s, i) => {
    const employee = employees[s.name as keyof typeof employees];

    return {
      ...s,
      rank: i + 1,
      progressPct: Math.round((s.totalUnits / leaderUnits) * 100),
      email: employee?.email || null,
    };
  });
}

export function calcStats(ranked: RankedEmployee[]): AggregatedStats {
  const totalUnits = ranked.reduce((sum, e) => sum + e.totalUnits, 0);
  const activeCount = ranked.length;
  const top = ranked[0];

  return {
    totalUnits,
    topPerformer: top?.name ?? '—',
    topPerformerUnits: top?.totalUnits ?? 0,
    activeCount,
    teamAvg: activeCount > 0 ? Math.round(totalUnits / activeCount) : 0,
  };
}