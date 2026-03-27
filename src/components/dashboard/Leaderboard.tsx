'use client';

import { useEffect, useRef, useState } from 'react';
import type { RankedEmployee } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import LeaderboardRow from './LeaderboardRow';
import EmptyState from './EmptyState';

interface Props {
  ranked: RankedEmployee[];
}

type RankedWithMovement = RankedEmployee & {
  movement: number;
};

export default function Leaderboard({ ranked }: Props) {
  const previousRanksRef = useRef<Record<string, number>>({});
  const [displayRows, setDisplayRows] = useState<RankedWithMovement[]>([]);

  useEffect(() => {
    const nextRows: RankedWithMovement[] = ranked.map((employee) => {
      const key = employee.email || employee.name;
      const previousRank = previousRanksRef.current[key];
      const movement = previousRank ? previousRank - employee.rank : 0;
      return { ...employee, movement };
    });

    const nextRankMap: Record<string, number> = {};
    for (const employee of ranked) {
      const key = employee.email || employee.name;
      nextRankMap[key] = employee.rank;
    }

    previousRanksRef.current = nextRankMap;
    setDisplayRows(nextRows);
  }, [ranked]);

  if (displayRows.length === 0) return <EmptyState />;

  return (
    // bg-fin-bg here creates the subtle depth: off-white zone vs white hero above
    <div className="flex-1 overflow-y-auto bg-fin-bg">
      <AnimatePresence initial={false}>
        {displayRows.map((employee) => (
          <motion.div
            key={employee.email || employee.name}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              layout: { duration: 0.5, ease: 'easeInOut' },
              opacity: { duration: 0.18 },
            }}
          >
            <LeaderboardRow employee={employee} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
