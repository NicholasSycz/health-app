import type { GoalCreate, GoalResponse } from '../types/goal'
import client from './client'

export async function createGoal(data: GoalCreate): Promise<GoalResponse> {
  const { data: result } = await client.post<GoalResponse>('/goals/', data)
  return result
}

export async function getCurrentGoal(): Promise<GoalResponse | null> {
  try {
    const { data } = await client.get<GoalResponse>('/goals/current')
    return data
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 404) return null
    }
    throw err
  }
}
