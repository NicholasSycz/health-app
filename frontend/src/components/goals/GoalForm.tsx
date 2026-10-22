import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { createGoal, getCurrentGoal } from '../../api/goals'
import type { GoalResponse } from '../../types/goal'
import FormField from '../ui/FormField'
import { localDateString } from '../../utils/dates'
import ErrorMessage from '../ui/ErrorMessage'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

interface Props {
  onSaved: () => void
}

export default function GoalForm({ onSaved }: Props) {
  const [caloriesGoal, setCaloriesGoal] = useState('')
  const [proteinGoal, setProteinGoal] = useState('')
  const [carbsGoal, setCarbsGoal] = useState('')
  const [fatGoal, setFatGoal] = useState('')
  const [startDate, setStartDate] = useState(() => localDateString())
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getCurrentGoal()
      .then((goal: GoalResponse | null) => {
        if (!goal) return
        setCaloriesGoal(String(goal.calories_goal))
        if (goal.protein_goal != null) setProteinGoal(String(goal.protein_goal))
        if (goal.carbs_goal != null) setCarbsGoal(String(goal.carbs_goal))
        if (goal.fat_goal != null) setFatGoal(String(goal.fat_goal))
        setStartDate(goal.start_date)
        if (goal.end_date) setEndDate(goal.end_date)
      })
      .catch(() => setError('We couldn’t load your existing goals. Please try again later.'))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!caloriesGoal || Number(caloriesGoal) <= 0) {
      setError('Calorie goal is required and must be positive.')
      return
    }

    setLoading(true)
    try {
      await createGoal({
        calories_goal: Number(caloriesGoal),
        protein_goal: proteinGoal ? Number(proteinGoal) : null,
        carbs_goal: carbsGoal ? Number(carbsGoal) : null,
        fat_goal: fatGoal ? Number(fatGoal) : null,
        start_date: startDate,
        end_date: endDate || null,
      })
      onSaved()
    } catch {
      setError('Failed to save goal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="form-card">
      <div className="card-heading">
        <h2>Make it personal</h2>
        <span className="stat-icon food-icon">
          <Icon name="target" />
        </span>
      </div>
      <p className="card-description">Choose your daily calorie and macro targets.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <ErrorMessage message={error} />}
        <FormField
          id="caloriesGoal"
          label="Daily Calories Goal"
          type="number"
          min="1"
          step="any"
          value={caloriesGoal}
          onChange={(e) => setCaloriesGoal(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-3">
          <FormField
            id="proteinGoal"
            label="Protein (g)"
            type="number"
            min="0"
            step="any"
            value={proteinGoal}
            onChange={(e) => setProteinGoal(e.target.value)}
          />
          <FormField
            id="carbsGoal"
            label="Carbs (g)"
            type="number"
            min="0"
            step="any"
            value={carbsGoal}
            onChange={(e) => setCarbsGoal(e.target.value)}
          />
          <FormField
            id="fatGoal"
            label="Fat (g)"
            type="number"
            min="0"
            step="any"
            value={fatGoal}
            onChange={(e) => setFatGoal(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            id="startDate"
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <FormField
            id="endDate"
            label="End Date (optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="button-primary w-full">
          <Icon name="check" size={17} />
          {loading ? 'Saving…' : 'Save my goals'}
        </button>
      </form>
    </Card>
  )
}
