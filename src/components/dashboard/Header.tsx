import type { Period } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';
import LiveIndicator from './LiveIndicator';
import PeriodFilter from './PeriodFilter';

interface Props {
  period: Period;
  onPeriodChange: (p: Period) => void;
  lastUpdated: Date | null;
}

export default function Header({ period, onPeriodChange, lastUpdated }: Props) {
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

      {/* Right: live status */}
      <div className="flex items-center gap-3 sm:gap-4">
        <LiveIndicator />
        <div className="hidden sm:block w-px h-3 bg-fin-border flex-shrink-0" />
        <span className="hidden sm:block text-[0.6rem] md:text-[0.65rem] font-medium text-fin-muted tabular-nums tracking-widest">
          {lastUpdated ? formatTimestamp(lastUpdated) : '—:—:—'}
        </span>
      </div>

    </header>
  );
}
