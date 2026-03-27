import { NextRequest, NextResponse } from 'next/server';
import { addStoredResponse } from '@/lib/data/live-store';
import { archiveSubmission } from '@/lib/data/excel-archive';
import { employees } from '@/lib/data/employees';
import type { FormResponse } from '@/lib/types';

const VALID_NAMES = new Set(Object.keys(employees));

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const mitarbeiter = String(body.mitarbeiter ?? '').trim();
  const einheiten = Number(body.einheiten);

  if (!mitarbeiter || !VALID_NAMES.has(mitarbeiter)) {
    return NextResponse.json({ error: 'Ungültiger Mitarbeiter' }, { status: 400 });
  }
  if (!Number.isFinite(einheiten) || einheiten <= 0) {
    return NextResponse.json({ error: 'Einheiten muss grösser als 0 sein' }, { status: 400 });
  }

  const entry: FormResponse = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    mitarbeiter,
    einheiten,
  };

  // ── Primary: local live-store (always required) ────────────────────────────
  const result = addStoredResponse(entry);

  // ── Secondary: Excel archival (best-effort, fire and forget) ──────────────
  archiveSubmission(entry).catch((err) => {
    console.error('[Archive] Excel-Archivierung fehlgeschlagen:', err instanceof Error ? err.message : err);
  });

  return NextResponse.json(
    { ok: true, added: result.added, id: entry.id },
    { status: 201 }
  );
}
