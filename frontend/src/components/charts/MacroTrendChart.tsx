import { useCallback, useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { getMacrosTrend } from '../../api/analytics'
import { localDateString } from '../../utils/dates'
import type { MacrosTrendResponse } from '../../types/analytics'
import { COLORS } from './chartConfig'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

import './chartConfig'

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

export default function MacroTrendChart() {
  const [data, setData] = useState<MacrosTrendResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [rangeDays, setRangeDays] = useState(30)
  const [error, setError] = useState(false)

  const fetchData = useCallback(async () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - rangeDays + 1)
    try {
      const result = await getMacrosTrend(localDateString(start), localDateString(end))
      setData(result)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [rangeDays])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading)
    return (
      <Card>
        <LoadingSpinner />
      </Card>
    )

  const labels = (data?.days ?? []).map((d) => {
    const date = new Date(d.date + 'T00:00:00')
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  })

  return (
    <Card className="chart-wide">
      <div className="card-heading">
        <div>
          <h3 className="chart-title">A closer look at your macros</h3>
          <p className="chart-subtitle">Protein, carbs, and fat over time · grams</p>
        </div>
        <div className="segmented-control" role="group" aria-label="Macro trend date range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => {
                setLoading(true)
                setRangeDays(r.days)
              }}
              disabled={rangeDays === r.days}
              aria-pressed={rangeDays === r.days}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {error || !data ? (
        <div className="mt-5">
          <ErrorMessage message="We couldn’t load your macro trend. Choose another date range to try again." />
        </div>
      ) : data.days.length === 0 ? (
        <div className="chart-empty">Log your food to see your macro trends here.</div>
      ) : (
        <div className="chart-container">
          <Line
            role="img"
            aria-label={`Line chart of protein, carbs, and fat intake over the last ${rangeDays} days`}
            data={{
              labels,
              datasets: [
                {
                  label: 'Protein',
                  data: data.days.map((d) => d.protein),
                  borderColor: COLORS.protein,
                  tension: 0.3,
                  pointRadius: 0,
                  pointHitRadius: 12,
                  borderWidth: 2,
                },
                {
                  label: 'Carbs',
                  data: data.days.map((d) => d.carbs),
                  borderColor: COLORS.carbs,
                  tension: 0.3,
                  pointRadius: 0,
                  pointHitRadius: 12,
                  borderWidth: 2,
                },
                {
                  label: 'Fat',
                  data: data.days.map((d) => d.fat),
                  borderColor: COLORS.fat,
                  tension: 0.3,
                  pointRadius: 0,
                  pointHitRadius: 12,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true, ticks: { maxTicksLimit: 5 } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } },
              },
            }}
          />
        </div>
      )}
    </Card>
  )
}
