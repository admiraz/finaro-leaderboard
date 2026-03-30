import { NextResponse } from 'next/server';
import { addStoredResponse } from '@/lib/data/live-store';
import type { FormResponse } from '@/lib/types';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  console.log('[submit-units] route hit');

  try {
    const body = await req.json();
    const { mitarbeiter, einheiten } = body as { mitarbeiter?: string; einheiten?: number | string };

    console.log('[submit-units] incoming payload:', { mitarbeiter, einheiten });

    if (!mitarbeiter || einheiten === undefined || einheiten === null) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const parsedEinheiten = Number(einheiten);
    if (!Number.isFinite(parsedEinheiten) || parsedEinheiten <= 0) {
      return NextResponse.json({ error: 'Invalid units' }, { status: 400 });
    }

    const entry: FormResponse = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mitarbeiter,
      einheiten: parsedEinheiten,
    };

    console.log('[submit-units] saving entry:', entry);

    const result = await addStoredResponse(entry);

    console.log('[submit-units] saved — added:', result.added, '| id:', entry.id);

    return NextResponse.json({ success: true, added: result.added, id: entry.id });
  } catch (err) {
    console.error('[submit-units] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
