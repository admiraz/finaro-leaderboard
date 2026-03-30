'use client';

import type { Period } from '@/lib/types';
import LiveIndicator from './LiveIndicator';
import LiveClock from './LiveClock';
import PeriodFilter from './PeriodFilter';

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;
  lastUpdated: Date | null;
  onReset?: () => void;
}

export default function Header({ period, onPeriodChange, lastUpdated: _lastUpdated, onReset }: Props) {
  return (
    <header className="flex items-center justify-between px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16 py-3 md:py-4 lg:py-5 border-b border-fin-border bg-fin-surface flex-shrink-0">

      {/* Left: logo */}
      <img
        src="/images/finarologo.png"
        alt="Finaro"
        className="h-6 sm:h-7 md:h-8 lg:h-8 xl:h-9 object-contain select-none"
        draggable={false}
      />

      {/* Center: period navigation */}
      <PeriodFilter period={period} onChange={onPeriodChange} />

      {/* Right: live status + reset */}
      <div className="flex items-center gap-3 sm:gap-4">
        <LiveIndicator />
        <div className="hidden sm:block w-px h-3 bg-fin-border flex-shrink-0" />
        <LiveClock />
        {onReset && (
          <>
            <div className="hidden sm:block w-px h-3 bg-fin-border flex-shrink-0" />
            <button
              onClick={onReset}
              className="hidden sm:block text-[0.55rem] font-semibold tracking-widest text-fin-faint uppercase hover:text-fin-muted transition-colors"
              title="Alle Einträge löschen"
            >
              Reset
            </button>
          </>
        )}
      </div>

    </header>
  );
}
