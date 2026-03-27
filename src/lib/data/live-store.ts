import fs from 'fs';
import path from 'path';
import type { FormResponse } from '@/lib/types';

const STORE_PATH = path.join(process.cwd(), 'data', 'leaderboard.json');

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getStoredResponses(): FormResponse[] {
  try {
    if (!fs.existsSync(STORE_PATH)) return [];
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as FormResponse[];
  } catch {
    return [];
  }
}

export function saveStoredResponses(responses: FormResponse[]): void {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(responses, null, 2), 'utf-8');
}

export function addStoredResponse(entry: FormResponse): { added: boolean } {
  const existing = getStoredResponses();
  if (existing.some((r) => r.id === entry.id)) {
    return { added: false };
  }
  existing.push(entry);
  saveStoredResponses(existing);
  return { added: true };
}

export async function getFormResponses(): Promise<FormResponse[]> {
  return getStoredResponses();
}
