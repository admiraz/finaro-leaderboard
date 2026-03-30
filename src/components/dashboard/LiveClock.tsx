'use client';

import { useEffect, useState } from 'react';

function formatNow(date: Date) {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());

    tick();

    const interval = setInterval(tick, 1000);
    const watchdog = setInterval(() => {
      tick();
    }, 5000);

    const handleVisibilityChange = () => {
      tick();
    };

    const handleFocus = () => {
      tick();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      clearInterval(watchdog);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <span className="hidden sm:block text-[0.6rem] md:text-[0.65rem] font-medium text-fin-muted tabular-nums tracking-widest">
      {formatNow(now)}
    </span>
  );
}