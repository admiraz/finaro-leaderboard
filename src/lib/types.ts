// Raw shape mirroring MS Forms → Excel row
export interface FormResponse {
  id: string;
  timestamp: string; // ISO 8601
  mitarbeiter: string; // employee full name
  einheiten: number; // units completed
}

// After summing by employee
export interface EmployeeSummary {
  name: string;
  totalUnits: number;
  entryCount: number;
}

// After ranking
export interface RankedEmployee extends EmployeeSummary {
  rank: number;
  progressPct: number; // 0–100, relative to rank-1 units
  email?: string | null;
}

// Dashboard-wide computed stats
export interface AggregatedStats {
  totalUnits: number;
  topPerformer: string;
  topPerformerUnits: number;
  activeCount: number;
  teamAvg: number;
}

// Period filter
export type Period = 'today' | 'week' | 'month';

// Hook return shape
export interface LeaderboardData {
  ranked: RankedEmployee[];
  stats: AggregatedStats;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// API response shape
export interface ApiResponse {
  ranked: RankedEmployee[];
  stats: AggregatedStats;
}