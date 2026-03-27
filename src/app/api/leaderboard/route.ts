import { NextRequest, NextResponse } from 'next/server';
import { getFormResponses } from '@/lib/data/adapter';
import { filterByPeriod, sumByEmployee, rankEmployees, calcStats } from '@/lib/aggregations';
import type { Period } from '@/lib/types';

const VALID_PERIODS: Period[] = ['today', 'week', 'month'];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  // Default 'month' so all recent test submissions are visible during setup.
  // Change back to 'today' once live data is confirmed working.
  const rawPeriod = searchParams.get('period') ?? 'today';
  const period: Period = VALID_PERIODS.includes(rawPeriod as Period)
    ? (rawPeriod as Period)
    : 'today';

  const responses = await getFormResponses();
  const filtered = filterByPeriod(responses, period);
  const summaries = sumByEmployee(filtered);
  const ranked = rankEmployees(summaries);
  const stats = calcStats(ranked);

  return NextResponse.json(
    { ranked, stats },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
