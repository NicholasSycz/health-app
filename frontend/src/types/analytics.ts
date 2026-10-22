export interface DailyTotals {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  entry_count: number
}

export interface DayBreakdown {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
}

export interface MacroDay {
  date: string
  protein: number
  carbs: number
  fat: number
}

export interface GoalProgressDay {
  date: string
  actual_calories: number
  goal_calories: number | null
  actual_protein: number
  goal_protein: number | null
  actual_carbs: number
  goal_carbs: number | null
  actual_fat: number
  goal_fat: number | null
}

export interface WeeklyResponse {
  days: DayBreakdown[]
}

export interface MacrosTrendResponse {
  days: MacroDay[]
}

export interface GoalProgressResponse {
  days: GoalProgressDay[]
}
