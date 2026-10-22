import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { getWeekly } from '../../api/analytics'
import type { WeeklyResponse } from '../../types/analytics'
import { COLORS } from './chartConfig'
import { localDateString } from '../../utils/dates'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

// Import chartConfig to ensure registration runs
import './chartConfig'

export default function WeeklyChart() {
  const [data, setData] = useState<WeeklyResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getWeekly()
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
        <ErrorMessage message="We couldn’t load your weekly calories." />
      </Card>
    )

  const labels = data.days.map((d) => {
    const date = new Date(d.date + 'T00:00:00')
    return date.toLocaleDateString(undefined, { weekday: 'short' })
  })

  return (
    <Card>
      <div className="card-heading">
        <div>
          <h3 className="chart-title">Your week at a glance</h3>
          <p className="chart-subtitle">Daily calorie intake</p>
        </div>
        <span className="soft-badge">This week</span>
      </div>
      <div className="chart-container">
        <Bar
          role="img"
          aria-label="Bar chart of daily calorie intake this week"
          data={{
            labels,
            datasets: [
              {
                label: 'Calories',
                data: data.days.map((d) => d.total_calories),
                backgroundColor: data.days.map((day) =>
                  day.date === localDateString() ? COLORS.calories : '#c4d9ff',
                ),
                borderRadius: 5,
                maxBarThickness: 30,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { maxTicksLimit: 5 } },
              x: { grid: { display: false } },
            },
          }}
        />
      </div>
    </Card>
  )
}
