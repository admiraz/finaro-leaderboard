import { NextResponse } from 'next/server';
import { saveStoredResponses } from '@/lib/data/live-store';

export async function POST() {
  await saveStoredResponses([]);
  return NextResponse.json({ ok: true });
}
