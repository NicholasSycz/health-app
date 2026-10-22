import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createFoodLog } from '../../api/foodLogs'
import { searchFoods } from '../../api/foods'
import type { Food, MacroBasis } from '../../types/foodLog'
import { MASS_UNITS, UNIT_LABELS, VOLUME_UNITS } from '../../types/foodLog'
import FormField from '../ui/FormField'
import ErrorMessage from '../ui/ErrorMessage'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

interface Props {
  onCreated: () => void
}

interface UnitOption {
  value: string
  label: string
  portionId?: number
}

export default function FoodLogForm({ onCreated }: Props) {
  const [foods, setFoods] = useState<Food[]>([])
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [basis, setBasis] = useState<MacroBasis>('per_serving')
  const [density, setDensity] = useState('')
  const [amount, setAmount] = useState('1')
  const [unitKey, setUnitKey] = useState('serving')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    searchFoods()
      .then(setFoods)
      .catch(() => setFoods([]))
  }, [])

  // An existing food governs its own units; a new one is described by the form.
  const matchedFood = useMemo(
    () => foods.find((f) => f.name.toLowerCase() === foodName.trim().toLowerCase()) ?? null,
    [foods, foodName],
  )

  const effectiveBasis: MacroBasis = matchedFood ? matchedFood.basis : basis
  const effectiveDensity = matchedFood
    ? matchedFood.density_g_per_ml
    : density
      ? Number(density)
      : null

  const unitOptions = useMemo<UnitOption[]>(() => {
    // Legacy per-serving foods have no recorded weight, so servings is all they support.
    if (effectiveBasis === 'per_serving') {
      return [{ value: 'serving', label: 'serving' }]
    }
    const opts: UnitOption[] = MASS_UNITS.map((u) => ({
      value: u,
      label: UNIT_LABELS[u],
    }))
    // Volume only converts to mass when we know the food's density.
    if (effectiveDensity != null) {
      opts.push(...VOLUME_UNITS.map((u) => ({ value: u, label: UNIT_LABELS[u] })))
    }
    for (const p of matchedFood?.portions ?? []) {
      opts.push({ value: `portion:${p.id}`, label: p.label, portionId: p.id })
    }
    return opts
  }, [effectiveBasis, effectiveDensity, matchedFood])

  // Keep the selected unit valid whenever the option set changes.
  useEffect(() => {
    if (!unitOptions.some((o) => o.value === unitKey)) {
      setUnitKey(unitOptions[0]?.value ?? 'serving')
    }
  }, [unitOptions, unitKey])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!foodName.trim()) {
      setError('Food name is required.')
      return
    }

    const selected = unitOptions.find((o) => o.value === unitKey)
    const isPortion = selected?.portionId != null

    setLoading(true)
    try {
      await createFoodLog({
        food_name: foodName.trim(),
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        amount: Number(amount) || 1,
        unit: isPortion ? 'portion' : unitKey,
        portion_id: isPortion ? selected?.portionId : null,
        basis: effectiveBasis,
        density_g_per_ml: effectiveDensity,
      })
      setFoodName('')
      setCalories('')
      setProtein('')
      setCarbs('')
      setFat('')
      setDensity('')
      setAmount('1')
      searchFoods()
        .then(setFoods)
        .catch(() => undefined)
      onCreated()
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to create food log.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="form-card">
      <div className="card-heading">
        <h2>What’s on your plate?</h2>
        <span className="stat-icon food-icon">
          <Icon name="plus" />
        </span>
      </div>
      <p className="card-description">Find a saved food or add something new.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <ErrorMessage message={error} />}
        <FormField
          id="foodName"
          label="Food Name"
          list="food-options"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="e.g. Greek yogurt"
        />
        <datalist id="food-options">
          {foods.map((f) => (
            <option key={f.id} value={f.name} />
          ))}
        </datalist>

        {matchedFood ? (
          <p className="text-xs text-gray-500">
            Using saved food &middot; macros are{' '}
            {matchedFood.basis === 'per_100g' ? 'per 100 g' : 'per serving'}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="calories"
                label="Calories"
                type="number"
                min="0"
                step="any"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
              <FormField
                id="protein"
                label="Protein (g)"
                type="number"
                min="0"
                step="any"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
              <FormField
                id="carbs"
                label="Carbs (g)"
                type="number"
                min="0"
                step="any"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
              <FormField
                id="fat"
                label="Fat (g)"
                type="number"
                min="0"
                step="any"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="basis" className="mb-1 block text-sm font-medium text-gray-700">
                Those macros are per
              </label>
              <select
                id="basis"
                value={basis}
                onChange={(e) => setBasis(e.target.value as MacroBasis)}
                className="form-input"
              >
                <option value="per_serving">one serving</option>
                <option value="per_100g">100 g</option>
              </select>
            </div>
            {basis === 'per_100g' && (
              <FormField
                id="density"
                label="Density (g/ml) — optional, enables cups and ml"
                type="number"
                min="0"
                step="any"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
              />
            )}
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="amount"
            label="Amount"
            type="number"
            min="0.01"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div>
            <label htmlFor="unit" className="mb-1 block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select
              id="unit"
              value={unitKey}
              onChange={(e) => setUnitKey(e.target.value)}
              className="form-input"
            >
              {unitOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="button-primary w-full">
          <Icon name="plus" size={17} />
          {loading ? 'Adding to diary…' : 'Add to diary'}
        </button>
      </form>
    </Card>
  )
}
