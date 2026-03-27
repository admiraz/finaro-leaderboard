export default function PrizeBanner() {
  return (
    <div className="bg-fin-surface border-b border-fin-border flex-shrink-0">
      <div className="flex flex-col items-center text-center px-6 py-8 sm:py-10 lg:py-5 xl:py-7">

        {/* Eyebrow — tiny, heavily tracked */}
        <p className="text-[0.44rem] sm:text-[0.48rem] font-semibold tracking-[0.55em] text-fin-muted uppercase mb-4 sm:mb-5 lg:mb-3">
          1. Platz gewinnt
        </p>

        {/* Product image — hero anchor */}
        <img
          src="/images/iphone-17-pro-colors.png"
          alt="iPhone"
          className="h-36 sm:h-44 md:h-52 lg:h-36 xl:h-44 object-contain select-none mb-4 sm:mb-5 lg:mb-3"
          draggable={false}
        />

        {/* Prize headline — magazine scale */}
        <p className="text-6xl sm:text-7xl md:text-8xl lg:text-6xl xl:text-7xl font-black tracking-tight text-fin-text leading-none mb-3 sm:mb-4 lg:mb-3">
          iPhone
        </p>

        {/* Hairline */}
        <div className="w-8 h-px bg-fin-border mb-3" />

        {/* Tension line — barely visible, just enough to create close */}
        <p className="text-[0.44rem] sm:text-[0.48rem] font-medium tracking-[0.45em] text-fin-faint uppercase">
          Nur Platz 1 gewinnt
        </p>

      </div>
    </div>
  );
}
