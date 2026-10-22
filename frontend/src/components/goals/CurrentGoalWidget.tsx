import { useEffect, useState } from 'react'
import { getCurrentGoal } from '../../api/goals'
import { getDaily } from '../../api/analytics'
import type { GoalResponse } from '../../types/goal'
import type { DailyTotals } from '../../types/analytics'
import Card from '../ui/Card'
import Icon from '../ui/Icon'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

interface Props {
  refreshKey: number
  dailyTotals?: DailyTotals
}

function ProgressBar({
  label,
  actual,
  goal,
  color = '',
  unit = 'g',
}: {
  label: string
  actual: number
  goal: number
  color?: string
  unit?: string
}) {
  const pct = goal > 0 ? Math.min((actual / goal) * 100, 100) : 0
  const over = goal > 0 && actual > goal

  return (
    <div className={`goal-progress-row ${color}`}>
      <div className="goal-progress-label">
        <span>
          <span className="macro-dot" />
          {label}
        </span>
        <span>
          {Math.round(actual)} / {Math.round(goal)} {unit}
          {over ? ' · over goal' : ''}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={`${label} goal progress`}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function CurrentGoalWidget({ refreshKey, dailyTotals }: Props) {
  const [goal, setGoal] = useState<GoalResponse | null>(null)
  const [fetchedTotals, setFetchedTotals] = useState<DailyTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([getCurrentGoal(), dailyTotals ? Promise.resolve(dailyTotals) : getDaily()])
      .then(([currentGoal, totals]) => {
        if (active) {
          setGoal(currentGoal)
          setFetchedTotals(totals)
          setError(false)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [refreshKey, dailyTotals])

  const totals = dailyTotals ?? fetchedTotals

  return (
    <Card>
      <div className="card-heading">
        <div>
          <span className="eyebrow">A LITTLE CLOSER EACH DAY</span>
          <h2>Today’s progress</h2>
        </div>
        <span className="stat-icon food-icon">
          <Icon name="chart" />
        </span>
      </div>
      <p className="card-description">See how your day lines up with your targets.</p>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="mt-5">
          <ErrorMessage message="We couldn’t load your goal progress. Please try again later." />
        </div>
      ) : !goal ? (
        <div className="diary-empty">
          <span className="empty-icon">
            <Icon name="target" size={30} />
          </span>
          <h3>A goal gives you direction</h3>
          <p>
            Set a goal that includes today to see
            <br />
            your daily progress here.
          </p>
        </div>
      ) : (
        <div>
          <ProgressBar
            label="Calories"
            actual={totals?.total_calories ?? 0}
            goal={goal.calories_goal}
            unit="kcal"
          />
          {goal.protein_goal != null && (
            <ProgressBar
              label="Protein"
              actual={totals?.total_protein ?? 0}
              goal={goal.protein_goal}
              color="protein"
            />
          )}
          {goal.carbs_goal != null && (
            <ProgressBar
              label="Carbs"
              actual={totals?.total_carbs ?? 0}
              goal={goal.carbs_goal}
              color="carbs"
            />
          )}
          {goal.fat_goal != null && (
            <ProgressBar
              label="Fat"
              actual={totals?.total_fat ?? 0}
              goal={goal.fat_goal}
              color="fat"
            />
          )}
          <p className="goal-note">
            <Icon name="leaf" size={18} />
            Consistency adds up. Use your targets as a guide and keep checking in with yourself.
          </p>
        </div>
      )}
    </Card>
  )
}
