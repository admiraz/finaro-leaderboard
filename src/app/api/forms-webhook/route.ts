import { NextRequest, NextResponse } from 'next/server';
import { addStoredResponse } from '@/lib/data/live-store';
import type { FormResponse } from '@/lib/types';

const WEBHOOK_SECRET = process.env.FORMS_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  // Auth check
  const secret = req.headers.get('x-webhook-secret') ?? '';
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Extract + normalize fields
  const mitarbeiter = String(body.mitarbeiter ?? body.name ?? '').trim();
  const einheiten = Number(body.einheiten ?? body.units ?? 0);
  const id = String(body.id ?? crypto.randomUUID());
  const timestamp =
    typeof body.timestamp === 'string' && body.timestamp
      ? body.timestamp
      : new Date().toISOString();

  if (!mitarbeiter) {
    return NextResponse.json({ error: 'Missing mitarbeiter' }, { status: 400 });
  }
  if (!Number.isFinite(einheiten) || einheiten <= 0) {
    return NextResponse.json({ error: 'Invalid einheiten' }, { status: 400 });
  }

  const entry: FormResponse = { id, timestamp, mitarbeiter, einheiten };
  const result = addStoredResponse(entry);

  return NextResponse.json(
    { ok: true, added: result.added, id },
    { status: result.added ? 201 : 200 }
  );
}
