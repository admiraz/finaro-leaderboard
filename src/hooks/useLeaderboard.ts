'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardData, Period, ApiResponse } from '@/lib/types';
import { REFRESH_INTERVAL } from '@/config/dashboard';

const initialState: Omit<LeaderboardData, 'refresh' | 'clearLocal'> = {
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
  const [data, setData] = useState<Omit<LeaderboardData, 'refresh' | 'clearLocal'>>(initialState);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setData((prev) => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        // Always bust the cache — critical for smart TV browsers that ignore Cache-Control
        const url = `/api/leaderboard?period=${period}&t=${Date.now()}&r=${Math.random().toString(36).slice(2)}`;
        const res = await fetch(url, {
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: ApiResponse = await res.json();

        setData({
          ranked: json.ranked ?? [],
          stats: json.stats,
          lastUpdated: new Date(),
          isLoading: false,
          error: null,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setData((prev) => ({
          ...prev,
          isLoading: false,
          error: `Refresh failed: ${msg}`,
        }));
      }
    },
    [period]
  );

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const clearLocal = useCallback(() => {
    setData({
      ranked: [],
      stats: {
        totalUnits: 0,
        topPerformer: '—',
        topPerformerUnits: 0,
        activeCount: 0,
        teamAvg: 0,
      },
      lastUpdated: new Date(),
      isLoading: false,
      error: null,
    });
  }, []);

  // Interval-based polling
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Page Visibility API — force re-fetch when TV browser wakes up / tab becomes visible
  // This is the main mitigation for smart TV browsers that pause JS intervals
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        console.log('[leaderboard] tab became visible — forcing refresh');
        fetchData(false);
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [fetchData]);

  return { ...data, refresh, clearLocal };
}
