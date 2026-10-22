export type MacroBasis = 'per_100g' | 'per_serving'

export const MASS_UNITS = ['g', 'kg', 'oz', 'lb'] as const
export const VOLUME_UNITS = ['ml', 'l', 'tsp', 'tbsp', 'fl_oz', 'cup'] as const

/** Display labels for the fixed units; portions carry their own label. */
export const UNIT_LABELS: Record<string, string> = {
  g: 'g',
  kg: 'kg',
  oz: 'oz',
  lb: 'lb',
  ml: 'ml',
  l: 'L',
  tsp: 'tsp',
  tbsp: 'tbsp',
  fl_oz: 'fl oz',
  cup: 'cup',
  serving: 'serving',
}

export interface FoodPortion {
  id: number
  label: string
  gram_weight: number
  is_default: boolean
}

export interface Food {
  id: number
  name: string
  basis: MacroBasis
  density_g_per_ml: number | null
  serving_size: string | null
  portions: FoodPortion[]
}

export interface FoodLogCreate {
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  unit: string
  portion_id?: number | null
  basis?: MacroBasis
  density_g_per_ml?: number | null
  consumed_at?: string
}

export interface FoodLogResponse {
  id: number
  food_id: number | null
  food_name: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  amount: number
  unit: string
  unit_label: string
  portion_id: number | null
  grams: number | null
  consumed_at: string
}
