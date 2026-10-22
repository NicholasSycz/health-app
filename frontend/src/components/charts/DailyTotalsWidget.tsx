import { Link } from 'react-router-dom'
import type { DailyTotals } from '../../types/analytics'
import type { GoalResponse } from '../../types/goal'
import Card from '../ui/Card'
import Icon from '../ui/Icon'

interface Props {
  totals: DailyTotals
  goal: GoalResponse | null
}

export default function DailyTotalsWidget({ totals, goal }: Props) {
  const consumed = Math.round(totals.total_calories)
  const remaining = goal ? Math.round(goal.calories_goal - totals.total_calories) : null
  const progress =
    goal && goal.calories_goal > 0 ? Math.min(totals.total_calories / goal.calories_goal, 1) : 0
  const macros = [
    { label: 'Protein', value: totals.total_protein, target: goal?.protein_goal, color: 'protein' },
    { label: 'Carbs', value: totals.total_carbs, target: goal?.carbs_goal, color: 'carbs' },
    { label: 'Fat', value: totals.total_fat, target: goal?.fat_goal, color: 'fat' },
  ]

  return (
    <Card className="daily-summary">
      <div className="card-heading">
        <div>
          <span className="eyebrow">MAKE EVERY DAY COUNT</span>
          <h2>Your daily nutrition</h2>
        </div>
        <span className="soft-badge">
          <span className="status-dot" />
          Today
        </span>
      </div>
      <div className="calorie-overview">
        <div className={`calorie-ring ${remaining != null && remaining < 0 ? 'over-goal' : ''}`}>
          <svg viewBox="0 0 180 180" aria-hidden="true">
            <circle className="ring-track" cx="90" cy="90" r="78" />
            <circle
              className="ring-fill"
              cx="90"
              cy="90"
              r="78"
              pathLength="100"
              strokeDasharray={`${progress * 100} 100`}
            />
          </svg>
          <div className="ring-label">
            <Icon name="flame" size={21} />
            <strong>{(remaining == null ? consumed : Math.abs(remaining)).toLocaleString()}</strong>
            <span>
              {remaining == null
                ? 'calories eaten'
                : remaining < 0
                  ? 'over your goal'
                  : 'calories remaining'}
            </span>
          </div>
        </div>
        <div className="calorie-breakdown">
          <div className="calorie-stat">
            <span className="stat-icon goal-icon">
              <Icon name="target" />
            </span>
            <div>
              <span>Daily goal</span>
              <strong>
                {goal ? Math.round(goal.calories_goal).toLocaleString() : 'Not set'}
                <small>{goal ? ' kcal' : ''}</small>
              </strong>
            </div>
          </div>
          <div className="calorie-stat">
            <span className="stat-icon food-icon">
              <Icon name="diary" />
            </span>
            <div>
              <span>Food logged</span>
              <strong>
                {consumed.toLocaleString()}
                <small> kcal</small>
              </strong>
            </div>
          </div>
          <Link to="/goals" className="text-link">
            {goal ? 'Adjust your goals' : 'Set your daily goal'}
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
      <div className="macro-summary">
        {macros.map((macro) => {
          const hasTarget = macro.target != null && macro.target > 0
          const percentage =
            macro.target != null && macro.target > 0
              ? Math.min((macro.value / macro.target) * 100, 100)
              : 0
          return (
            <div key={macro.label} className={`macro-stat ${macro.color}`}>
              <div className="macro-label">
                <span className="macro-dot" />
                {macro.label}
              </div>
              <p>
                <strong>
                  {Math.round(macro.value)}
                  <small>g</small>
                </strong>
                <span>{macro.target != null ? `/ ${Math.round(macro.target)} g` : 'consumed'}</span>
              </p>
              <div
                className="progress-track"
                role={hasTarget ? 'progressbar' : undefined}
                aria-label={hasTarget ? `${macro.label} goal progress` : undefined}
                aria-valuenow={hasTarget ? Math.round(percentage) : undefined}
                aria-valuemin={hasTarget ? 0 : undefined}
                aria-valuemax={hasTarget ? 100 : undefined}
              >
                <div style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="summary-footer">
        <Icon name="check" size={16} />
        <span>
          {totals.entry_count === 0
            ? 'A fresh start. Log your first food of the day.'
            : `${totals.entry_count} food ${totals.entry_count === 1 ? 'entry' : 'entries'} logged today. Every entry adds up.`}
        </span>
      </div>
    </Card>
  )
}
