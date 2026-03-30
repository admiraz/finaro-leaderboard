'use client';

import { useState } from 'react';
import type { Period } from '@/lib/types';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import Header from './Header';
import PrizeBanner from './PrizeBanner';
import Leaderboard from './Leaderboard';

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('today');
  const [isResetting, setIsResetting] = useState(false);
  const { ranked, stats, lastUpdated, isLoading, error, refresh, clearLocal } = useLeaderboard(period);
  const handleReset = async () => {
  if (!confirm('Are you sure you want to clear all results?')) return;

  try {
    setIsResetting(true);
    console.log('[reset] button clicked — starting clear request');

    const res = await fetch('/api/admin/clear', {
      method: 'POST',
      cache: 'no-store',
    });

    const payload = await res.json();

    console.log('[reset] response status:', res.status);
    console.log('[reset] payload:', payload);

    if (!res.ok) {
      throw new Error(payload?.error || 'Reset failed');
    }

    clearLocal();
    await refresh();

    console.log('[reset] leaderboard cleared and refreshed');
  } catch (error) {
    console.error('[reset] failed:', error);
    alert('Reset failed');
  } finally {
    setIsResetting(false);
  }
};

  return (
    <div className="h-screen flex flex-col bg-fin-bg text-fin-text overflow-hidden">
      <Header
        period={period}
        onPeriodChange={setPeriod}
        lastUpdated={lastUpdated}
        onReset={handleReset}
        isResetting={isResetting}
      />

      <PrizeBanner />

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-fin-bg">
          <div className="text-[0.5rem] font-semibold tracking-[0.4em] text-fin-faint uppercase mb-5">
            Finaro Leaderboard
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-fin-text uppercase mb-4">
            Noch keine Daten
          </div>
          <div className="w-8 h-px bg-fin-border mb-4" />
          <div className="text-[0.6rem] font-medium tracking-[0.25em] text-fin-muted uppercase">
            Warten auf erste Eingabe
          </div>
        </div>
      ) : (
        <Leaderboard ranked={ranked} />
      )}

      {error && (
        <div className="flex-shrink-0 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 py-2 bg-fin-error/10 border-t border-fin-error/20 text-fin-error text-[0.6rem] font-bold tracking-[0.2em] uppercase">
          {error}
        </div>
      )}
    </div>
  );
}
