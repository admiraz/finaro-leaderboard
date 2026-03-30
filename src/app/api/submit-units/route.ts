import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

type LeaderboardEntry = {
  mitarbeiter: string;
  einheiten: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      mitarbeiter,
      einheiten,
    } = body as { mitarbeiter?: string; einheiten?: number | string };

    if (!mitarbeiter || einheiten === undefined || einheiten === null) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const parsedEinheiten = Number(einheiten);

    if (!Number.isFinite(parsedEinheiten) || parsedEinheiten <= 0) {
      return NextResponse.json({ error: 'Invalid units' }, { status: 400 });
    }

    const key = 'leaderboard';

    const stored = await redis.get<LeaderboardEntry[]>(key);
    const leaderboard: LeaderboardEntry[] = Array.isArray(stored) ? stored : [];

    const existing = leaderboard.find((u) => u.mitarbeiter === mitarbeiter);

    if (existing) {
      existing.einheiten += parsedEinheiten;
    } else {
      leaderboard.push({ mitarbeiter, einheiten: parsedEinheiten });
    }

    leaderboard.sort((a, b) => b.einheiten - a.einheiten);

    await redis.set(key, leaderboard);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}