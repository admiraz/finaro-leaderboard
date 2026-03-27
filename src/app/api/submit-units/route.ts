import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

type LeaderboardEntry = {
  name: string;
  units: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, units } = body as { name?: string; units?: number | string };

    if (!name || units === undefined || units === null) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const parsedUnits = Number(units);

    if (!Number.isFinite(parsedUnits) || parsedUnits <= 0) {
      return NextResponse.json({ error: 'Invalid units' }, { status: 400 });
    }

    const key = 'leaderboard';

    const stored = await redis.get<LeaderboardEntry[]>(key);
    const leaderboard: LeaderboardEntry[] = Array.isArray(stored) ? stored : [];

    const existing = leaderboard.find((u) => u.name === name);

    if (existing) {
      existing.units += parsedUnits;
    } else {
      leaderboard.push({ name, units: parsedUnits });
    }

    leaderboard.sort((a, b) => b.units - a.units);

    await redis.set(key, leaderboard);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}