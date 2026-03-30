'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardData, Period, ApiResponse } from '@/lib/types';
import { REFRESH_INTERVAL } from '@/config/dashboard';

const initialState: Omit<LeaderboardData, 'refresh'> = {
  ranked: [],
  stats: {
    totalUnits: 0,
    topPerformer: '—',
    topPerformerUnits: 0,
    activeCount: 0,
    teamAvg: 0,
  },
  lastUpdated: null,
  isLoading: true,
  error: null,
};

export function useLeaderboard(period: Period): LeaderboardData {
  const [data, setData] = useState<Omit<LeaderboardData, 'refresh'>>(initialState);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        const res = await fetch(`/api/leaderboard?period=${period}&t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse = await res.json();

        setData({
          ranked: json.ranked,
          stats: json.stats,
          lastUpdated: new Date(),
          isLoading: false,
          error: null,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        // Keep last good data visible; just update error + isLoading
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: `Refresh failed: ${msg}`,
        }));
      }
    },
    [period]
  );

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { ...data, refresh: () => fetchData(true) };
}
