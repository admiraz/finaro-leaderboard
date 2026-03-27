export default function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-fin-bg">
      <div className="max-w-sm w-full text-center px-8 MT-[-40px]">

        {/* Eyebrow */}
        <p className="text-[0.5rem] font-semibold tracking-[0.4em] text-fin-faint uppercase mb-5">
          Finaro Leaderboard
        </p>

        {/* Title */}
        <p className="text-xl sm:text-2xl font-black tracking-tight text-fin-text uppercase leading-tight mb-4">
          Keine Einträge heute
        </p>

        {/* Hairline */}
        <div className="w-8 h-px bg-fin-border mx-auto mb-4" />

        {/* Subtitle */}
        <p className="text-[0.6rem] font-medium tracking-[0.25em] text-fin-muted uppercase mb-2">
          Warten auf erste Eingabe
        </p>

        {/* Hint */}
        <p className="text-[0.55rem] tracking-[0.2em] text-fin-faint uppercase">
          Woche oder Monat für frühere Einträge
        </p>

      </div>
    </div>
  );
}
