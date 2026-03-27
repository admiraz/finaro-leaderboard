import { formatNumber } from '@/lib/utils';

interface Props {
  label: string;
  value: number | string;
  subLabel?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, subLabel, accent = false }: Props) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div
      className={`
        flex flex-col justify-between p-6 border-2 flex-1
        ${accent
          ? 'border-brut-yellow bg-brut-yellow'
          : 'border-white bg-black'
        }
      `}
    >
      <span
        className={`
          text-[0.65rem] font-bold tracking-[0.2em] uppercase
          ${accent ? 'text-black' : 'text-brut-muted'}
        `}
      >
        {label}
      </span>

      <span
        className={`
          text-5xl font-bold leading-none mt-3 break-all
          ${accent ? 'text-black' : 'text-white'}
        `}
      >
        {displayValue}
      </span>

      {subLabel && (
        <span
          className={`
            text-xs font-medium mt-2 truncate
            ${accent ? 'text-black/70' : 'text-brut-muted'}
          `}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}
