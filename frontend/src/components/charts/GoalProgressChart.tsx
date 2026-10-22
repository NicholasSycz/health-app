import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { getGoalProgress } from '../../api/analytics'
import type { GoalProgressResponse } from '../../types/analytics'
import { COLORS } from './chartConfig'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'
import { Link } from 'react-router-dom'

import './chartConfig'

export default function GoalProgressChart() {
  const [data, setData] = useState<GoalProgressResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getGoalProgress()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <Card>
        <LoadingSpinner />
      </Card>
    )
  if (error || !data)
    return (
      <Card>
        <ErrorMessage message="We couldn’t load your calorie progress." />
      </Card>
    )

  const labels = data.days.map((d) => {
    const date = new Date(d.date + 'T00:00:00')
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })

  return (
    <Card>
      <div>
        <h3 className="chart-title">Finding your rhythm</h3>
        <p className="chart-subtitle">Your calories compared with your daily goal</p>
      </div>
      {data.days.length === 0 ? (
        <div className="chart-empty">
          <p>Your progress starts with your first entry.</p>
          <Link to="/food-log" className="text-link justify-center mt-3">
            Start your food diary
          </Link>
        </div>
      ) : (
        <div className="chart-container">
          <Line
            role="img"
            aria-label="Line chart comparing calories consumed with daily calorie goals"
            data={{
              labels,
              datasets: [
                {
                  label: 'Actual',
                  data: data.days.map((d) => d.actual_calories),
                  borderColor: COLORS.calories,
                  tension: 0.3,
                  pointRadius: 0,
                  pointHitRadius: 12,
                  borderWidth: 2,
                  fill: true,
                  backgroundColor: '#3479f60b',
                },
                {
                  label: 'Goal',
                  data: data.days.map((d) => d.goal_calories),
                  borderColor: COLORS.goal,
                  borderDash: [6, 3],
                  tension: 0.3,
                  pointRadius: 0,
                  borderWidth: 1.5,
                  spanGaps: false,
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true, ticks: { maxTicksLimit: 5 } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 6, maxRotation: 0 } },
              },
            }}
          />
        </div>
      )}
    </Card>
  )
}
