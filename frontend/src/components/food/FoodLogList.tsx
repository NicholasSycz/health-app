import { useCallback, useEffect, useState } from 'react'
import { deleteFoodLog, listFoodLogs } from '../../api/foodLogs'
import type { FoodLogResponse } from '../../types/foodLog'
import Card from '../ui/Card'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'
import DateRangeSelector from './DateRangeSelector'
import FoodLogItem from './FoodLogItem'
import Icon from '../ui/Icon'

interface Props {
  refreshKey: number
}

export default function FoodLogList({ refreshKey }: Props) {
  const [logs, setLogs] = useState<FoodLogResponse[]>([])
  const [range, setRange] = useState('today')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listFoodLogs(range)
      setLogs(data)
    } catch {
      setError('Failed to load food logs.')
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs, refreshKey])

  async function handleDelete(id: number) {
    try {
      await deleteFoodLog(id)
      setLogs((prev) => prev.filter((l) => l.id !== id))
    } catch {
      setError('Failed to delete entry.')
    }
  }

  // Group by date
  const grouped = logs.reduce<Record<string, FoodLogResponse[]>>((acc, log) => {
    const dateKey = new Date(log.consumed_at).toLocaleDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(log)
    return acc
  }, {})

  return (
    <Card>
      <div className="diary-list-heading">
        <div>
          <h2>Your food diary</h2>
          <p className="chart-subtitle">A little more awareness, one entry at a time.</p>
        </div>
        <DateRangeSelector selected={range} onChange={setRange} />
      </div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}
      {!loading && !error && logs.length === 0 && (
        <div className="diary-empty">
          <span className="empty-icon">
            <Icon name="diary" size={30} />
          </span>
          <h3>Your diary is ready for you</h3>
          <p>
            No food logged for this period.
            <br />
            Add a food to start building your daily picture.
          </p>
        </div>
      )}
      {!loading &&
        !error &&
        Object.entries(grouped).map(([date, entries]) => (
          <div key={date} className="diary-day">
            <div className="diary-day-header">
              <strong>{date}</strong>
              <span>
                {Math.round(
                  entries.reduce((total, entry) => total + entry.calories, 0),
                ).toLocaleString()}{' '}
                kcal · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>
            {entries.map((log) => (
              <FoodLogItem key={log.id} log={log} onDelete={handleDelete} />
            ))}
          </div>
        ))}
    </Card>
  )
}
