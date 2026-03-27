import type { AggregatedStats } from '@/lib/types';
import { formatNumber } from '@/lib/utils';

interface Props {
  stats: AggregatedStats;
}

interface StripItemProps {
  label: string;
  value: string | number;
  dominant?: boolean;
  secondary?: boolean;
  hideOnMobile?: boolean;
}

function StripItem({ label, value, dominant = false, secondary = false, hideOnMobile = false }: StripItemProps) {
  const display =
    typeof value === 'number'
      ? value === 0 ? '—' : formatNumber(value)
      : value;

  const numSize = dominant
    ? 'text-3xl sm:text-5xl md:text-7xl font-black tracking-tight'
    : secondary
    ? 'text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight'
    : 'text-2xl sm:text-3xl md:text-4xl font-bold';

  return (
    <div className={`flex flex-col justify-center px-3 sm:px-6 md:px-10 ${hideOnMobile ? 'hidden sm:flex' : 'flex'}`}>
      <div className={`${numSize} text-fin-text leading-none truncate`}>
        {display}
      </div>
      <div className="text-[0.45rem] sm:text-[0.55rem] font-bold tracking-[0.2em] sm:tracking-[0.28em] text-fin-muted uppercase mt-1 sm:mt-2">
        {label}
      </div>
    </div>
  );
}

export default function StatsCards({ stats }: Props) {
  return (
    <div className="flex items-stretch border-b border-fin-border bg-fin-surface h-[80px] sm:h-[100px] md:h-[120px] flex-shrink-0 overflow-x-auto">
      <StripItem label="TOTAL EINHEITEN"    value={stats.totalUnits}   dominant />
      <div className="w-px bg-fin-border self-stretch my-4 sm:my-5 md:my-7 flex-shrink-0" />
      <StripItem label="SPITZENREITER"      value={stats.topPerformer} secondary />
      <div className="w-px bg-fin-border self-stretch my-4 sm:my-5 md:my-7 flex-shrink-0 hidden sm:block" />
      <StripItem label="AKTIV"              value={stats.activeCount}  hideOnMobile />
      <div className="w-px bg-fin-border self-stretch my-4 sm:my-5 md:my-7 flex-shrink-0 hidden md:block" />
      <StripItem label="TEAM-DURCHSCHNITT"  value={stats.teamAvg}      hideOnMobile />
    </div>
  );
}
