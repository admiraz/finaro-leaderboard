import { NextResponse } from 'next/server';
import { saveStoredResponses } from '@/lib/data/live-store';

export async function POST() {
  console.log('[clear] route hit');
  try {
    const { getStoredResponses } = await import('@/lib/data/live-store');
    const before = await getStoredResponses();
    console.log('[clear] entries before clear:', before.length);

    await saveStoredResponses([]);
    console.log('[clear] storage cleared — key: leaderboard:responses');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[clear] failed to clear storage:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
