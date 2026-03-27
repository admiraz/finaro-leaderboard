/**
 * One-time migration endpoint.
 * POST /api/admin/migrate
 *
 * Accepts a JSON array of FormResponse objects in the request body and
 * writes them into the persistent store (Redis), skipping duplicates.
 *
 * Use this once to seed Redis with data from your local leaderboard.json.
 *
 * Example:
 *   curl -X POST https://finaro-rangliste.vercel.app/api/admin/migrate \
 *     -H "Content-Type: application/json" \
 *     -H "x-webhook-secret: finaro-leaderboard-2026-live-secret" \
 *     -d @data/leaderboard.json
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStoredResponses, saveStoredResponses } from '@/lib/data/live-store';
import type { FormResponse } from '@/lib/types';

const WEBHOOK_SECRET = process.env.FORMS_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') ?? '';
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let incoming: FormResponse[];
  try {
    const body = await req.json();
    if (!Array.isArray(body)) throw new Error('Expected JSON array');
    incoming = body as FormResponse[];
  } catch (e) {
    return NextResponse.json({ error: `Invalid body: ${e instanceof Error ? e.message : e}` }, { status: 400 });
  }

  const existing = await getStoredResponses();
  const existingIds = new Set(existing.map((r) => r.id));
  const newRows = incoming.filter((r) => r.id && r.mitarbeiter && r.einheiten && !existingIds.has(r.id));

  if (newRows.length > 0) {
    await saveStoredResponses([...existing, ...newRows]);
  }

  return NextResponse.json({
    ok: true,
    migrated: newRows.length,
    skipped: incoming.length - newRows.length,
    total: existing.length + newRows.length,
  });
}
