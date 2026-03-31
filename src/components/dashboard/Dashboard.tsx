'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import PrizeBanner from './PrizeBanner';
import Leaderboard from './Leaderboard';

export default function Dashboard() {
  const [isResetting, setIsResetting] = useState(false);
  // Period is fixed to 'today' — period switching removed from TV layout
  const { ranked, isLoading, error, refresh, clearLocal } = useLeaderboard('today');

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
    } catch (err) {
      console.error('[reset] failed:', err);
      alert('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-fin-bg text-fin-text">

      {/* Left: prize + info panel */}
      <PrizeBanner onReset={handleReset} isResetting={isResetting} />

      {/* Right: leaderboard — full height, no header overhead */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-fin-bg">
            <div className="text-[0.5rem] font-semibold tracking-[0.4em] text-fin-faint uppercase mb-5">
              Finaro Leaderboard
            </div>
            <div className="text-xl font-black tracking-tight text-fin-text uppercase mb-4">
              Laden…
            </div>
            <div className="w-8 h-px bg-fin-border" />
          </div>
        ) : (
          <Leaderboard ranked={ranked} />
        )}

        {error && (
          <div className="flex-shrink-0 px-5 py-2 bg-red-50 border-t border-red-200 text-red-600 text-[0.6rem] font-bold tracking-[0.2em] uppercase">
            {error}
          </div>
        )}
      </div>

    </div>
  );
}
