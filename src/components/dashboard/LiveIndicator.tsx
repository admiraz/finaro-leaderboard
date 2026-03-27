export default function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="live-dot w-2 h-2 bg-fin-accent flex-shrink-0" />
      <span className="text-[0.58rem] font-semibold tracking-[0.3em] text-fin-muted uppercase">
        Live
      </span>
    </div>
  );
}
