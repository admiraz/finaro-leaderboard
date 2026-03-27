'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { RankedEmployee } from '@/lib/types';
import InitialsAvatar from '@/components/ui/InitialsAvatar';
import { formatNumber } from '@/lib/utils';

interface Props {
  employee: RankedEmployee & { movement?: number };
}

export default function LeaderboardRow({ employee }: Props) {
  const { rank, name, totalUnits, progressPct, email, movement = 0 } = employee;

  const [prevRank, setPrevRank] = useState(rank);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevRank !== rank) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      setPrevRank(rank);
      return () => clearTimeout(t);
    }
  }, [rank, prevRank]);

  const isOne   = rank === 1;
  const isTwo   = rank === 2;
  const isThree = rank === 3;
  const isTop   = rank <= 3;

  const rowClass = isOne
    ? 'leaderboard-row-1'
    : isTwo
    ? 'leaderboard-row-2'
    : isThree
    ? 'leaderboard-row-3'
    : 'leaderboard-row-default';

  // ── Padding ── rank 1 gets dramatically more air, others compress ───────────
  const padding = isOne
    ? 'py-5 sm:py-6 md:py-7 lg:py-8 xl:py-10 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16'
    : isTop
    ? 'py-3 sm:py-3.5 md:py-4 lg:py-5 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16'
    : 'py-1.5 sm:py-2 md:py-2.5 lg:py-3 px-5 sm:px-8 md:px-12 lg:px-14 xl:px-16';

  // ── Name — enormous scale gap between rank 1 and everyone else ─────────────
  const nameSize = isOne
    ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black'
    : isTwo
    ? 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold'
    : isThree
    ? 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold'
    : 'text-[10px] sm:text-xs md:text-sm lg:text-sm font-normal text-fin-muted';

  // ── Units — rank 1 unit count is the hero number on screen ─────────────────
  const unitsSize = isOne
    ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black'
    : isTwo
    ? 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold'
    : isThree
    ? 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold'
    : 'text-[10px] sm:text-xs md:text-sm font-normal text-fin-muted';

  // ── Progress bar — hairline thin, noise reduced ─────────────────────────────
  const barH = isOne
    ? 'h-[3px] sm:h-[4px] md:h-[5px]'
    : isTop
    ? 'h-px sm:h-[2px]'
    : 'h-px';

  const barFill = isOne
    ? 'bg-fin-accent'
    : isTop
    ? 'bg-fin-border-strong'
    : 'bg-fin-border-mid';

  // ── Rank badge ──────────────────────────────────────────────────────────────
  const badgeSize = isOne
    ? 'w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl'
    : isTop
    ? 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-[10px] sm:text-xs md:text-sm'
    : 'w-5 h-5 sm:w-5 sm:h-5 text-[8px] sm:text-[9px]';

  const badgeStyle = isOne
    ? 'bg-fin-accent text-white font-black'
    : isTwo
    ? 'text-fin-muted font-semibold border border-fin-border-mid'
    : isThree
    ? 'text-fin-faint font-medium border border-fin-border'
    : 'text-fin-faint/60 font-normal';

  // ── Gap between elements ────────────────────────────────────────────────────
  const gap = isOne
    ? 'gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7'
    : isTop
    ? 'gap-2 sm:gap-3 md:gap-4 lg:gap-5'
    : 'gap-1.5 sm:gap-2 md:gap-3';

  // ── Movement indicator ──────────────────────────────────────────────────────
  const movementText =
    movement > 0 ? `↑${movement}` : movement < 0 ? `↓${Math.abs(movement)}` : null;
  const movementColor =
    movement > 0 ? 'text-fin-accent' : 'text-red-400';

  return (
    <motion.div
      layout
      layoutId={email || name}
      className={`
        ${rowClass} ${padding} ${gap}
        flex items-center
        border-b border-fin-border
        transition-colors duration-500
        ${flash ? 'hover:bg-fin-accent/3' : ''}
      `}
    >
      {/* Rank badge */}
      <div className={`${badgeSize} ${badgeStyle} flex items-center justify-center flex-shrink-0`}>
        {rank}
      </div>

      {/* Avatar — only visible for top ranks on smaller screens */}
      <div className={isTop ? 'flex-shrink-0' : 'hidden sm:flex flex-shrink-0'}>
        <InitialsAvatar
          name={name}
          email={email}
          rank={rank}
          size={isOne ? 'lg' : isTop ? 'md' : 'sm'}
        />
      </div>

      {/* Name + bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 md:mb-2.5 min-w-0">
          <span className={`${nameSize} truncate leading-none`}>
            {name}
          </span>

          {movementText && isTop && (
            <motion.span
              key={`${name}-${rank}-${movementText}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`text-[9px] sm:text-[10px] font-semibold tracking-tight flex-shrink-0 ${movementColor}`}
            >
              {movementText}
            </motion.span>
          )}
        </div>

        <div className={`w-full ${barH} bg-fin-border overflow-hidden`}>
          <motion.div
            className={`h-full ${barFill}`}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Units */}
      <div className={`${unitsSize} flex-shrink-0 tabular-nums leading-none`}>
        {formatNumber(totalUnits)}
      </div>
    </motion.div>
  );
}
