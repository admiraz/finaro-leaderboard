import type { FormResponse } from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     process.env.AZURE_CLIENT_ID!,
        client_secret: process.env.AZURE_CLIENT_SECRET!,
        scope:         'https://graph.microsoft.com/.default',
        grant_type:    'client_credentials',
      }),
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

// ── Share URL → DriveItem ─────────────────────────────────────────────────────

function toShareId(url: string): string {
  const base64 = Buffer.from(url).toString('base64');
  return 'u!' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function resolveDriveItem(token: string) {
  const shareUrl = process.env.FORMS_EXCEL_SHARE_URL!;
  const shareId  = toShareId(shareUrl);

  console.log('[Excel] resolving driveItem, shareId prefix:', shareId.slice(0, 24));

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error(`Resolve driveItem failed: ${res.status} ${await res.text()}`);
  }

  const item = await res.json();
  console.log('[Excel] driveItem id:', item.id, '| driveId:', item.parentReference?.driveId);
  return item;
}

// ── Worksheet → raw values ────────────────────────────────────────────────────

async function getWorksheetValues(
  token: string,
  driveId: string,
  itemId: string
): Promise<unknown[][]> {
  // Always list worksheets first — never assume the sheet name.
  // Microsoft Forms names sheets after the form title, not "Sheet1".
  const listRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );

  if (!listRes.ok) {
    throw new Error(`List worksheets failed: ${listRes.status} ${await listRes.text()}`);
  }

  const listData = await listRes.json();
  const sheets: Array<{ name: string }> = listData.value ?? [];
  console.log('[Excel] worksheets found:', sheets.map(s => `"${s.name}"`).join(', '));

  if (sheets.length === 0) throw new Error('No worksheets found in workbook');

  // Try each sheet in order; return the first one that has more than just a header row.
  for (const sheet of sheets) {
    const url =
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}` +
      `/workbook/worksheets('${encodeURIComponent(sheet.name)}')/usedRange`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[Excel] sheet "${sheet.name}" usedRange → ${res.status}`);
      continue;
    }

    const data = await res.json();
    const values: unknown[][] = data.values ?? [];
    console.log(`[Excel] sheet "${sheet.name}" → ${values.length} rows`);

    if (values.length > 1) {
      console.log('[Excel] header:', values[0]);
      console.log('[Excel] first data row:', values[1]);
      return values;
    }
  }

  console.warn('[Excel] all sheets empty or inaccessible');
  return [];
}

// ── Timestamp normalisation ───────────────────────────────────────────────────
//
// Microsoft Graph / Excel returns dates in one of three forms:
//   1. Excel serial number  (float)  e.g. 46117.604166…
//   2. ISO string                    e.g. "2026-03-26T14:30:00Z"
//   3. Locale string (US format)     e.g. "3/26/2026 2:30:00 PM"
//
// All are normalised to an ISO string here so filterByPeriod always works.

function parseTimestamp(raw: unknown): string {
  // ── Excel serial number ────────────────────────────────────────────────────
  if (typeof raw === 'number' && raw > 1) {
    // Days since Dec 30 1899 (Excel epoch).  25569 = days between Excel epoch and Unix epoch.
    const ms = (raw - 25569) * 86400 * 1000;
    return new Date(ms).toISOString();
  }

  if (typeof raw === 'string' && raw.trim()) {
    // ── Standard ISO / RFC string ──────────────────────────────────────────
    const direct = new Date(raw);
    if (!isNaN(direct.getTime())) return direct.toISOString();

    // ── "M/D/YYYY H:MM:SS AM/PM"  (locale string from Excel) ──────────────
    const m = raw.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i
    );
    if (m) {
      let h = parseInt(m[4], 10);
      const ampm = (m[7] ?? '').toUpperCase();
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      // Construct as UTC to avoid server-locale drift
      return new Date(
        Date.UTC(
          parseInt(m[3], 10),
          parseInt(m[1], 10) - 1,
          parseInt(m[2], 10),
          h,
          parseInt(m[5], 10),
          parseInt(m[6], 10)
        )
      ).toISOString();
    }
  }

  console.warn('[Excel] unparseable timestamp, treating as epoch:', raw);
  return new Date(0).toISOString();
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function getFormResponses(): Promise<FormResponse[]> {
  const token    = await getAccessToken();
  const driveItem = await resolveDriveItem(token);

  const driveId: string = driveItem.parentReference?.driveId;
  const itemId:  string = driveItem.id;

  if (!driveId || !itemId) {
    throw new Error(`Missing driveId (${driveId}) or itemId (${itemId})`);
  }

  const rows = await getWorksheetValues(token, driveId, itemId);
  console.log('[Excel] total rows incl. header:', rows.length);

  if (rows.length <= 1) {
    console.warn('[Excel] workbook has no data rows — returning empty');
    return [];
  }

  const responses: FormResponse[] = (rows.slice(1) as unknown[][])
    .filter((row, i) => {
      const mitarbeiter = String(row[5] ?? '').trim();
      if (!mitarbeiter) {
        console.warn(`[Excel] row ${i + 2}: empty mitarbeiter, skipping`);
        return false;
      }
      return true;
    })
    .map((row, i) => {
      const r: FormResponse = {
        id:          String(row[0] ?? i),
        timestamp:   parseTimestamp(row[1]),              // B = Start time
        mitarbeiter: String(row[5] ?? '').trim(),         // F = Mitarbeiter
        einheiten:   parseFloat(String(row[6] ?? '0')) || 0, // G = Einheiten
      };
      console.log(`[Excel] parsed row ${i + 2}:`, r);
      return r;
    });

  console.log('[Excel] valid responses:', responses.length);
  return responses;
}
