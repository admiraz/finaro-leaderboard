'use client';

import LiveClock from './LiveClock';
import LiveIndicator from './LiveIndicator';

interface Props {
  onReset?: () => void;
  isResetting?: boolean;
}

export default function PrizeBanner({ onReset, isResetting }: Props) {
  return (
    <aside className="w-44 lg:w-48 xl:w-52 flex-shrink-0 border-r border-fin-border bg-fin-surface flex flex-col items-center px-4 py-5 text-center">

      {/* ── Top: brand identity ──────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 w-full">
        <img
          src="/images/finarologo.png"
          alt="Finaro"
          className="h-5 lg:h-6 object-contain select-none"
          draggable={false}
        />

        <div className="w-full h-px bg-fin-border" />

        {/* Live + clock in one compact line */}
        <div className="flex flex-col items-center gap-1.5">
          <LiveIndicator />
          <LiveClock />
        </div>
      </div>

      {/* ── Center: prize content (pushed to center via auto margins) ── */}
      <div className="flex flex-col items-center gap-3 my-auto py-4">

        <p className="text-[0.42rem] font-semibold tracking-[0.5em] text-fin-muted uppercase">
          1. Platz gewinnt
        </p>

        <img
          src="/images/1000fr.jpg"
          alt="1000 CHF"
          className="h-24 lg:h-28 xl:h-32 w-auto object-contain select-none"
          draggable={false}
        />

        <p className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-fin-text leading-none">
          1000 CHF
        </p>

        <div className="w-6 h-px bg-fin-border" />

        <p className="text-[0.42rem] font-medium tracking-[0.4em] text-fin-faint uppercase">
          Nur Platz 1 gewinnt
        </p>

      </div>

      {/* ── Bottom: reset ────────────────────────────────────── */}
      {onReset && (
        <div className="flex flex-col items-center gap-2.5 w-full mt-auto">
          <div className="w-full h-px bg-fin-border" />
          <button
            onClick={onReset}
            disabled={isResetting}
            className="text-[0.5rem] font-semibold tracking-[0.4em] text-fin-faint uppercase hover:text-fin-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Alle Einträge löschen"
          >
            {isResetting ? 'Clearing…' : 'Reset'}
          </button>
        </div>
      )}

    </aside>
  );
}
