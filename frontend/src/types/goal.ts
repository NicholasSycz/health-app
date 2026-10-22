export interface GoalCreate {
  calories_goal: number
  protein_goal?: number | null
  carbs_goal?: number | null
  fat_goal?: number | null
  start_date: string
  end_date?: string | null
}

export interface GoalResponse {
  id: number
  user_id: number
  calories_goal: number
  protein_goal: number | null
  carbs_goal: number | null
  fat_goal: number | null
  start_date: string
  end_date: string | null
}
