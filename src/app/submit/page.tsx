'use client';

import { useState } from 'react';

const EMPLOYEES = [
  'Admir Bocerri',
  'Alfonso Allende',
  'Ardit Arifi',
  'Arijan Qollaku',
  'Berivan Coban',
  'Besmira Jahija',
  'Destan Celik',
  'Dion Maliqi',
  'Endrit Beadini',
  'Erand Vinca',
  'Feim Sahiti',
  'Fjolla Shaqiri',
  'Idriz Ajeti',
  'Imran Hamzic',
  'Isra Daljipi',
  'Leart Ajeti',
  'Metin Beadini',
  'Milad Ahmadyar',
  'Riza Ahmeti',
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function SubmitPage() {
  const [mitarbeiter, setMitarbeiter] = useState('');
  const [einheiten, setEinheiten] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const units = Number(einheiten);
    if (!mitarbeiter) {
      setErrorMsg('Bitte wähle einen Mitarbeiter aus.');
      setStatus('error');
      return;
    }
    if (!einheiten || !Number.isFinite(units) || units <= 0) {
      setErrorMsg('Einheiten muss eine Zahl grösser als 0 sein.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/submit-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mitarbeiter, einheiten: units }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
      }

      setStatus('success');
      setMitarbeiter('');
      setEinheiten('');
    } catch (e) {
      setErrorMsg(
        e instanceof Error
          ? e.message
          : 'Übermittlung fehlgeschlagen. Bitte versuche es erneut.'
      );
      setStatus('error');
    }
  };

  const handleChange = () => {
    if (status === 'success' || status === 'error') setStatus('idle');
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen bg-fin-bg flex flex-col items-center justify-center px-4 py-10 sm:py-12">

      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] text-fin-accent uppercase mb-2">
          Finaro
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-fin-text tracking-tight">
          Einheiten erfassen
        </h1>
        <p className="mt-2 text-sm text-fin-muted">
          Erfasse deine abgeschlossenen Einheiten im Live-Leaderboard.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm sm:max-w-md bg-fin-surface rounded-2xl border border-fin-border shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">

          {/* Mitarbeiter */}
          <div>
            <label
              htmlFor="mitarbeiter"
              className="block text-xs font-semibold tracking-widest text-fin-muted uppercase mb-2"
            >
              Mitarbeiter
            </label>
            <div className="relative">
              <select
                id="mitarbeiter"
                value={mitarbeiter}
                onChange={(e) => { setMitarbeiter(e.target.value); handleChange(); }}
                className="w-full appearance-none bg-fin-bg border border-fin-border rounded-xl px-4 py-4 sm:py-3.5 text-fin-text text-base focus:outline-none focus:ring-2 focus:ring-fin-accent focus:border-transparent transition"
              >
                <option value="">Mitarbeiter auswählen…</option>
                {EMPLOYEES.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-fin-muted">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Einheiten */}
          <div>
            <label
              htmlFor="einheiten"
              className="block text-xs font-semibold tracking-widest text-fin-muted uppercase mb-2"
            >
              Einheiten
            </label>
            <input
              id="einheiten"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="z.B. 12"
              value={einheiten}
              onChange={(e) => { setEinheiten(e.target.value); handleChange(); }}
              className="w-full bg-fin-bg border border-fin-border rounded-xl px-4 py-4 sm:py-3.5 text-fin-text text-base focus:outline-none focus:ring-2 focus:ring-fin-accent focus:border-transparent transition placeholder:text-fin-faint"
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-2.5 text-fin-error text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="flex items-start gap-2.5 text-fin-accent text-sm bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Eintrag erfolgreich übermittelt!</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-fin-accent text-white font-semibold text-sm tracking-wider uppercase rounded-xl py-4 sm:py-4 hover:opacity-90 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"/>
                </svg>
                Wird übermittelt…
              </span>
            ) : 'Erfassen'}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <a
        href="/"
        className="mt-8 text-xs text-fin-muted hover:text-fin-text transition tracking-wide"
      >
        ← Zurück zum Leaderboard
      </a>
    </main>
  );
}
