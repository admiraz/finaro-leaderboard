import { NextRequest, NextResponse } from 'next/server';
import { saveStoredResponses } from '@/lib/data/live-store';

const WEBHOOK_SECRET = process.env.FORMS_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') ?? '';
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await saveStoredResponses([]);

  return NextResponse.json({ ok: true, message: 'Live store cleared.' });
}
