import { NextRequest, NextResponse } from 'next/server';
import { getFormResponses as getExcelResponses } from '@/lib/data/excel';
import { getStoredResponses, saveStoredResponses } from '@/lib/data/live-store';

const WEBHOOK_SECRET = process.env.FORMS_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret') ?? '';
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let excelRows: Awaited<ReturnType<typeof getExcelResponses>>;
  try {
    excelRows = await getExcelResponses();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `Excel fetch failed: ${msg}` }, { status: 500 });
  }

  const existing = await getStoredResponses();
  const existingIds = new Set(existing.map((r) => r.id));

  const newRows = excelRows.filter((r) => !existingIds.has(r.id));
  if (newRows.length > 0) {
    await saveStoredResponses([...existing, ...newRows]);
  }

  return NextResponse.json({
    ok: true,
    imported: newRows.length,
    skipped: excelRows.length - newRows.length,
    total: existing.length + newRows.length,
  });
}
