import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

type LeaderboardEntry = {
  name: string;
  units: number;
};

export async function GET() {
  try {
    const stored = await redis.get<LeaderboardEntry[]>('leaderboard');
    const leaderboard: LeaderboardEntry[] = Array.isArray(stored) ? stored : [];
    return NextResponse.json(leaderboard);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}