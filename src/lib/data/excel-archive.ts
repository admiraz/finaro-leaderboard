/**
 * Excel archival — best-effort secondary storage.
 *
 * When an employee submits through /submit, this module appends a row to the
 * Microsoft-hosted Excel workbook that is linked to the Microsoft Forms survey.
 *
 * IMPORTANT LIMITATIONS:
 * - This does NOT write into Microsoft Forms itself. Forms responses are read-only
 *   and cannot be injected via API. Instead, we append a data row directly to the
 *   linked Excel workbook so the spreadsheet stays in sync.
 * - The appended row will be visible in Excel / SharePoint but NOT counted as an
 *   official Forms response in the Forms portal.
 * - If the Graph API call fails, it is logged server-side and the submission still
 *   succeeds (the local live-store write is the authoritative source).
 */

import type { FormResponse } from '@/lib/types';
import { getGraphAccessToken } from '@/lib/graph';

// ── Helpers ────────────────────────────────────────────────────────────────────

function toShareId(url: string): string {
  const base64 = Buffer.from(url).toString('base64');
  return 'u!' + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function resolveDriveItem(token: string) {
  const shareUrl = process.env.FORMS_EXCEL_SHARE_URL;
  if (!shareUrl) throw new Error('FORMS_EXCEL_SHARE_URL is not set');

  const shareId = toShareId(shareUrl);
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/shares/${shareId}/driveItem`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
  if (!res.ok) throw new Error(`driveItem resolve failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ── Main export ────────────────────────────────────────────────────────────────

/**
 * Appends one row to the Forms-linked Excel workbook.
 *
 * Column order matches the standard Microsoft Forms export:
 *   A=ID  B=Start time  C=Completion time  D=Email  E=Name  F=Mitarbeiter  G=Einheiten
 *
 * Tries the Table append API first (Forms always creates a ListObject/Table).
 * Falls back to writing directly into the first empty row via range address.
 */
export async function archiveSubmission(entry: FormResponse): Promise<void> {
  const token = await getGraphAccessToken();
  const driveItem = await resolveDriveItem(token);

  const driveId: string = driveItem.parentReference?.driveId;
  const itemId: string = driveItem.id;
  if (!driveId || !itemId) throw new Error(`Missing driveId/itemId in driveItem response`);

  // List worksheets — pick first
  const wsRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
  if (!wsRes.ok) throw new Error(`List worksheets failed: ${wsRes.status}`);
  const wsData = await wsRes.json();
  const sheets: Array<{ name: string }> = wsData.value ?? [];
  if (sheets.length === 0) throw new Error('No worksheets found in workbook');
  const sheetName = sheets[0].name;
  const sheetEnc = encodeURIComponent(sheetName);

  // Row values — matching the Forms export column order
  const values = [[
    entry.id,
    entry.timestamp,
    entry.timestamp,
    '',                  // D: respondent email (not available from internal submit)
    entry.mitarbeiter,   // E: respondent name
    entry.mitarbeiter,   // F: Mitarbeiter (form question answer)
    entry.einheiten,     // G: Einheiten (form question answer)
  ]];

  // ── Strategy 1: append via Table rows API ────────────────────────────────────
  const tablesRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets('${sheetEnc}')/tables`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );

  if (tablesRes.ok) {
    const tablesData = await tablesRes.json();
    const tables: Array<{ name: string }> = tablesData.value ?? [];

    if (tables.length > 0) {
      const tableEnc = encodeURIComponent(tables[0].name);
      const appendRes = await fetch(
        `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets('${sheetEnc}')/tables('${tableEnc}')/rows/add`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ values }),
          cache: 'no-store',
        }
      );
      if (!appendRes.ok) {
        throw new Error(`Table row append failed: ${appendRes.status} ${await appendRes.text()}`);
      }
      return; // success via table
    }
  }

  // ── Strategy 2: write to next empty row via range address ────────────────────
  const rangeRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets('${sheetEnc}')/usedRange`,
    { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
  );
  if (!rangeRes.ok) throw new Error(`usedRange failed: ${rangeRes.status}`);
  const rangeData = await rangeRes.json();
  const nextRow = (rangeData.rowCount ?? 1) + 1;

  const writeRes = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${itemId}/workbook/worksheets('${sheetEnc}')/range(address='A${nextRow}:G${nextRow}')`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
      cache: 'no-store',
    }
  );
  if (!writeRes.ok) {
    throw new Error(`Range write failed: ${writeRes.status} ${await writeRes.text()}`);
  }
}
