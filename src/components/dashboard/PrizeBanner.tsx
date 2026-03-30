export default function PrizeBanner() {
  return (
    <aside className="w-44 lg:w-48 xl:w-52 flex-shrink-0 border-r border-fin-border bg-fin-surface flex flex-col items-center justify-center px-4 py-6 text-center gap-3">

      {/* Eyebrow */}
      <p className="text-[0.42rem] font-semibold tracking-[0.5em] text-fin-muted uppercase">
        1. Platz gewinnt
      </p>

      {/* Prize image */}
      <img
        src="/images/1000fr.jpg"
        alt="1000 CHF"
        className="h-24 lg:h-28 xl:h-32 w-auto object-contain select-none"
        draggable={false}
      />

      {/* Prize headline */}
      <p className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-fin-text leading-none">
        1000 CHF
      </p>

      {/* Hairline */}
      <div className="w-6 h-px bg-fin-border" />

      {/* Tension line */}
      <p className="text-[0.42rem] font-medium tracking-[0.4em] text-fin-faint uppercase">
        Nur Platz 1 gewinnt
      </p>

    </aside>
  );
}
