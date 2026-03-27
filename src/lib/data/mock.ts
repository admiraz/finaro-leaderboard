import type { FormResponse } from '../types';

// Today = 2026-03-25
// Covers today, this week (Mar 19–25), this month (Mar 1–25)

export async function getFormResponses(): Promise<FormResponse[]> {
  return [
    // ── TODAY (2026-03-25) ──────────────────────────────────────
    { id: 't1',  timestamp: '2026-03-25T07:45:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 28 },
    { id: 't2',  timestamp: '2026-03-25T08:10:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 14 },
    { id: 't3',  timestamp: '2026-03-25T08:55:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 35 },
    { id: 't4',  timestamp: '2026-03-25T09:30:00Z', mitarbeiter: 'Felix Richter',  einheiten: 22 },
    { id: 't5',  timestamp: '2026-03-25T10:15:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 19 },
    { id: 't6',  timestamp: '2026-03-25T11:00:00Z', mitarbeiter: 'Lena Hoffmann',  einheiten: 41 },
    { id: 't7',  timestamp: '2026-03-25T11:45:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 31 },
    { id: 't8',  timestamp: '2026-03-25T13:20:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 18 },

    // ── THIS WEEK — Mon–Fri (2026-03-19 to 2026-03-24) ─────────
    { id: 'w1',  timestamp: '2026-03-19T08:00:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 45 },
    { id: 'w2',  timestamp: '2026-03-19T09:30:00Z', mitarbeiter: 'Felix Richter',  einheiten: 38 },
    { id: 'w3',  timestamp: '2026-03-20T08:15:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 27 },
    { id: 'w4',  timestamp: '2026-03-20T10:00:00Z', mitarbeiter: 'Lena Hoffmann',  einheiten: 52 },
    { id: 'w5',  timestamp: '2026-03-21T08:45:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 33 },
    { id: 'w6',  timestamp: '2026-03-21T11:00:00Z', mitarbeiter: 'Marcus Braun',   einheiten: 61 },
    { id: 'w7',  timestamp: '2026-03-24T09:00:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 39 },
    { id: 'w8',  timestamp: '2026-03-24T10:30:00Z', mitarbeiter: 'Felix Richter',  einheiten: 44 },
    { id: 'w9',  timestamp: '2026-03-24T13:00:00Z', mitarbeiter: 'Marcus Braun',   einheiten: 29 },
    { id: 'w10', timestamp: '2026-03-22T08:30:00Z', mitarbeiter: 'Lena Hoffmann',  einheiten: 36 },
    { id: 'w11', timestamp: '2026-03-23T09:15:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 48 },
    { id: 'w12', timestamp: '2026-03-23T11:30:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 25 },

    // ── THIS MONTH (2026-03-01 to 2026-03-18) ──────────────────
    { id: 'm1',  timestamp: '2026-03-01T09:00:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 62 },
    { id: 'm2',  timestamp: '2026-03-01T10:00:00Z', mitarbeiter: 'Marcus Braun',   einheiten: 74 },
    { id: 'm3',  timestamp: '2026-03-03T08:30:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 41 },
    { id: 'm4',  timestamp: '2026-03-03T11:00:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 55 },
    { id: 'm5',  timestamp: '2026-03-05T09:15:00Z', mitarbeiter: 'Felix Richter',  einheiten: 68 },
    { id: 'm6',  timestamp: '2026-03-05T13:00:00Z', mitarbeiter: 'Lena Hoffmann',  einheiten: 83 },
    { id: 'm7',  timestamp: '2026-03-07T08:00:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 49 },
    { id: 'm8',  timestamp: '2026-03-07T10:30:00Z', mitarbeiter: 'Marcus Braun',   einheiten: 57 },
    { id: 'm9',  timestamp: '2026-03-10T09:00:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 35 },
    { id: 'm10', timestamp: '2026-03-10T11:00:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 71 },
    { id: 'm11', timestamp: '2026-03-12T08:45:00Z', mitarbeiter: 'Felix Richter',  einheiten: 46 },
    { id: 'm12', timestamp: '2026-03-12T10:15:00Z', mitarbeiter: 'Lena Hoffmann',  einheiten: 59 },
    { id: 'm13', timestamp: '2026-03-14T09:30:00Z', mitarbeiter: 'Marcus Braun',   einheiten: 82 },
    { id: 'm14', timestamp: '2026-03-14T11:45:00Z', mitarbeiter: 'Sarah Müller',   einheiten: 53 },
    { id: 'm15', timestamp: '2026-03-17T08:00:00Z', mitarbeiter: 'Klaus Werner',   einheiten: 44 },
    { id: 'm16', timestamp: '2026-03-17T10:00:00Z', mitarbeiter: 'Anna Bauer',     einheiten: 38 },
    { id: 'm17', timestamp: '2026-03-18T09:15:00Z', mitarbeiter: 'Felix Richter',  einheiten: 77 },
    { id: 'm18', timestamp: '2026-03-18T11:30:00Z', mitarbeiter: 'Lena Hoffmann',  einheiten: 64 },
  ];
}
