import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

type LeaderboardEntry = {
  mitarbeiter: string;
  einheiten: number;
};

type RankedEmployee = {
  rank: number;
  name: string;
  totalUnits: number;
  progressPct: number;
  email?: string;
};

const redis = Redis.fromEnv();

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

export async function GET() {
  try {
    const stored = await redis.get<LeaderboardEntry[]>('leaderboard');
    const entries: LeaderboardEntry[] = Array.isArray(stored) ? stored : [];

    const summaries = new Map<string, number>();

    for (const entry of entries) {
      summaries.set(
        entry.mitarbeiter,
        (summaries.get(entry.mitarbeiter) || 0) + entry.einheiten
      );
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

    const totalUnits = ranked.reduce((sum, item) => sum + item.totalUnits, 0);
    const activeCount = ranked.length;
    const top = ranked[0];

    const stats = {
      totalUnits,
      topPerformer: top?.name ?? '—',
      topPerformerUnits: top?.totalUnits ?? 0,
      activeCount,
      teamAvg: activeCount > 0 ? Math.round(totalUnits / activeCount) : 0,
    };

    return NextResponse.json({ ranked, stats });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}