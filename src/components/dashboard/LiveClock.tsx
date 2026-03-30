'use client';

import { useEffect, useState } from 'react';

export default function LiveClock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('de-DE', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    }

    tick(); // set immediately on mount
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="hidden sm:block text-[0.6rem] md:text-[0.65rem] font-medium text-fin-muted tabular-nums tracking-widest">
      {time || '—:—:—'}
    </span>
  );
}
