import type { Food, FoodPortion } from '../types/foodLog'
import client from './client'

export async function searchFoods(q?: string): Promise<Food[]> {
  const params: Record<string, string> = {}
  if (q) params.q = q
  const { data } = await client.get<Food[]>('/foods/', { params })
  return data
}

export async function listFoodPortions(foodId: number): Promise<FoodPortion[]> {
  const { data } = await client.get<FoodPortion[]>(`/foods/${foodId}/portions`)
  return data
}
