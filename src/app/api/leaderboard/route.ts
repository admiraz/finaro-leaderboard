export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getStoredResponses } from '@/lib/data/live-store';

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

    const summaries = new Map<string, number>();
    for (const entry of filtered) {
      summaries.set(entry.mitarbeiter, (summaries.get(entry.mitarbeiter) ?? 0) + entry.einheiten);
    }

    const rankedBase = Array.from(summaries.entries())
      .map(([name, totalUnits]) => ({ name, totalUnits }))
      .sort((a, b) => b.totalUnits - a.totalUnits);

    const leaderUnits = rankedBase[0]?.totalUnits ?? 1;

    const ranked: RankedEmployee[] = rankedBase.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      totalUnits: item.totalUnits,
      progressPct: Math.round((item.totalUnits / leaderUnits) * 100),
      email: emailFromName(item.name),
    }));

    console.log('[leaderboard] ranked count after filter:', ranked.length, '| top 3:', ranked.slice(0, 3).map(r => r.name));

    const totalUnits = ranked.reduce((sum, r) => sum + r.totalUnits, 0);
    const activeCount = ranked.length;
    const top = ranked[0];

    const stats = {
      totalUnits,
      topPerformer: top?.name ?? '—',
      topPerformerUnits: top?.totalUnits ?? 0,
      activeCount,
      teamAvg: activeCount > 0 ? Math.round(totalUnits / activeCount) : 0,
    };

    return NextResponse.json(
      { ranked, stats },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err) {
    console.error('[leaderboard] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}