import type { Period } from '@/lib/types';
import { PERIODS } from '@/config/dashboard';

interface Props {
  period: Period;
  onChange: (p: Period) => void;
}

export default function PeriodFilter({ period, onChange }: Props) {
  return (
    <nav className="flex items-center gap-1">
      {PERIODS.map(({ key, label }) => {
        const active = period === key;
        return (
          <button
            key={key}
            aria-pressed={active}
            onClick={() => onChange(key as Period)}
            className={`
              px-3 sm:px-4 md:px-5 py-2
              text-[0.52rem] sm:text-[0.58rem] md:text-[0.62rem]
              tracking-[0.22em] sm:tracking-[0.28em]
              uppercase cursor-pointer transition-all duration-200
              ${active
                ? 'text-fin-text font-bold border-b border-fin-text'
                : 'text-fin-faint font-normal border-b border-transparent hover:text-fin-muted'
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
