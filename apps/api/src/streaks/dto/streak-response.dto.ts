export type DayState = 'COMPLETED' | 'INCOMPLETE' | 'AT_RISK' | 'SAVED';

export interface DayResult {
  date: string;
  activities: number;
  state: DayState;
}

export interface StreakResponseDto {
  activitiesToday: number;
  total: number;
  days: DayResult[];
}
