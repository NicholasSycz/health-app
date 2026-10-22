import type {
  DailyTotals,
  GoalProgressResponse,
  MacrosTrendResponse,
  WeeklyResponse,
} from '../types/analytics'
import client from './client'

export async function getDaily(date?: string): Promise<DailyTotals> {
  const params: Record<string, string> = {}
  if (date) params.date = date
  const { data } = await client.get<DailyTotals>('/analytics/daily', { params })
  return data
}

export async function getWeekly(weekStart?: string): Promise<WeeklyResponse> {
  const params: Record<string, string> = {}
  if (weekStart) params.week_start = weekStart
  const { data } = await client.get<WeeklyResponse>('/analytics/weekly', { params })
  return data
}

export async function getMacrosTrend(
  startDate?: string,
  endDate?: string,
): Promise<MacrosTrendResponse> {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const { data } = await client.get<MacrosTrendResponse>('/analytics/macros-trend', { params })
  return data
}

export async function getGoalProgress(
  startDate?: string,
  endDate?: string,
): Promise<GoalProgressResponse> {
  const params: Record<string, string> = {}
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const { data } = await client.get<GoalProgressResponse>('/analytics/goal-progress', { params })
  return data
}
