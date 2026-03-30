export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getStoredResponses } from '@/lib/data/live-store';
import { ALL_EMPLOYEES } from '@/config/employees';

type RankedEmployee = {
  rank: number;
  name: string;
  totalUnits: number;
  progressPct: number;
  email?: string;
};

function emailFromName(name: string): string {
  const localPart = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s.-]/g, '')
    .replace(/\s+/g, '.');

  return `${localPart}@finaro.ch`;
}

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') ?? 'today';
  console.log('[leaderboard] GET hit — period:', period);

  try {
    const allEntries = await getStoredResponses();
    console.log('[leaderboard] raw stored count:', allEntries.length);

    // Period filtering
    const now = new Date();
    const filtered = allEntries.filter((entry) => {
      const ts = new Date(entry.timestamp);
      if (period === 'today') {
        return (
          ts.getFullYear() === now.getFullYear() &&
          ts.getMonth() === now.getMonth() &&
          ts.getDate() === now.getDate()
        );
      }
      if (period === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return ts >= startOfWeek;
      }
      if (period === 'month') {
        return ts.getFullYear() === now.getFullYear() && ts.getMonth() === now.getMonth();
      }
      return true;
    });

    // Aggregate totals per employee
    const summaries = new Map<string, number>();
    for (const entry of filtered) {
      summaries.set(entry.mitarbeiter, (summaries.get(entry.mitarbeiter) ?? 0) + entry.einheiten);
    }

    // Merge with ALL_EMPLOYEES so everyone always appears (0 units if no submissions)
    const merged = ALL_EMPLOYEES.map((name) => ({
      name,
      totalUnits: summaries.get(name) ?? 0,
    })).sort((a, b) => b.totalUnits - a.totalUnits);

    const leaderUnits = merged[0]?.totalUnits ?? 0;

    const ranked: RankedEmployee[] = merged.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      totalUnits: item.totalUnits,
      progressPct: leaderUnits > 0 ? Math.round((item.totalUnits / leaderUnits) * 100) : 0,
      email: emailFromName(item.name),
    }));

    console.log('[leaderboard] ranked count:', ranked.length, '| top 3:', ranked.slice(0, 3).map(r => `${r.name}(${r.totalUnits})`));

    const totalUnits = ranked.reduce((sum, r) => sum + r.totalUnits, 0);
    const activeCount = ranked.filter(r => r.totalUnits > 0).length;
    const top = ranked[0];

    const stats = {
      totalUnits,
      topPerformer: top?.totalUnits > 0 ? top.name : '—',
      topPerformerUnits: top?.totalUnits ?? 0,
      activeCount,
      teamAvg: activeCount > 0 ? Math.round(totalUnits / activeCount) : 0,
    };

    return NextResponse.json({ ranked, stats }, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error('[leaderboard] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
