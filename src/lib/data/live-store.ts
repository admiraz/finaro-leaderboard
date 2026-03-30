/**
 * Live data store — production-safe persistence layer.
 *
 * Production (Vercel):
 *   Uses Upstash Redis via @upstash/redis. Supports both env var naming
 *   conventions:
 *     - New Upstash integration: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     - Old Vercel KV (migrated): KV_REST_API_URL + KV_REST_API_TOKEN
 *
 * Local development:
 *   Falls back to data/leaderboard.json — no cloud setup required.
 *   Switch to Redis locally by setting the env vars in .env.local.
 */

import type { FormResponse } from '@/lib/types';

const REDIS_KEY = 'leaderboard:responses';

// Resolve env vars — support both Upstash and legacy Vercel KV naming
const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL   ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN  ?? process.env.KV_REST_API_TOKEN;
const USE_REDIS   = !!(REDIS_URL && REDIS_TOKEN);

// ── Redis helpers (production) ─────────────────────────────────────────────────

function getRedis() {
  const { Redis } = require('@upstash/redis') as typeof import('@upstash/redis');
  return new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! });
}

async function redisGetAll(): Promise<FormResponse[]> {
  const data = await getRedis().get<FormResponse[]>(REDIS_KEY);
  return data ?? [];
}

async function redisSetAll(responses: FormResponse[]): Promise<void> {
  await getRedis().set(REDIS_KEY, responses);
}

// ── File helpers (local dev fallback) ─────────────────────────────────────────

function fileGetAll(): FormResponse[] {
  try {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const p = path.join(process.cwd(), 'data', 'leaderboard.json');
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as FormResponse[];
  } catch {
    return [];
  }
}

function fileSetAll(responses: FormResponse[]): void {
  const fs = require('fs') as typeof import('fs');
  const path = require('path') as typeof import('path');
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'leaderboard.json'), JSON.stringify(responses, null, 2), 'utf-8');
}

// ── Public API (all async — same interface regardless of backend) ──────────────

export async function getStoredResponses(): Promise<FormResponse[]> {
  console.log(`[live-store] READ — backend: ${USE_REDIS ? 'Redis' : 'file'} — key: ${REDIS_KEY}`);
  return USE_REDIS ? redisGetAll() : fileGetAll();
}

export async function saveStoredResponses(responses: FormResponse[]): Promise<void> {
  console.log(`[live-store] WRITE — backend: ${USE_REDIS ? 'Redis' : 'file'} — key: ${REDIS_KEY} — count: ${responses.length}`);
  if (USE_REDIS) return redisSetAll(responses);
  fileSetAll(responses);
}

export async function addStoredResponse(entry: FormResponse): Promise<{ added: boolean }> {
  const existing = await getStoredResponses();
  if (existing.some((r) => r.id === entry.id)) {
    return { added: false };
  }
  await saveStoredResponses([...existing, entry]);
  return { added: true };
}

export async function getFormResponses(): Promise<FormResponse[]> {
  return getStoredResponses();
}
