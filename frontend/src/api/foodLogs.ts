import type { FoodLogCreate, FoodLogResponse } from '../types/foodLog'
import client from './client'

export async function createFoodLog(data: FoodLogCreate): Promise<FoodLogResponse> {
  const { data: result } = await client.post<FoodLogResponse>('/food-logs/', data)
  return result
}

export async function listFoodLogs(
  range?: string,
  startDate?: string,
  endDate?: string,
): Promise<FoodLogResponse[]> {
  const params: Record<string, string> = {}
  if (range) params.range = range
  if (startDate) params.start_date = startDate
  if (endDate) params.end_date = endDate
  const { data } = await client.get<FoodLogResponse[]>('/food-logs/', { params })
  return data
}

export async function deleteFoodLog(logId: number): Promise<void> {
  await client.delete(`/food-logs/${logId}`)
}
