import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDaily } from '../api/analytics'
import { getCurrentGoal } from '../api/goals'
import { listFoodLogs } from '../api/foodLogs'
import type { DailyTotals } from '../types/analytics'
import type { GoalResponse } from '../types/goal'
import type { FoodLogResponse } from '../types/foodLog'
import DailyTotalsWidget from '../components/charts/DailyTotalsWidget'
import WeeklyChart from '../components/charts/WeeklyChart'
import MacroTrendChart from '../components/charts/MacroTrendChart'
import GoalProgressChart from '../components/charts/GoalProgressChart'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Icon from '../components/ui/Icon'
import ErrorMessage from '../components/ui/ErrorMessage'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const [summary, setSummary] = useState<{
    totals: DailyTotals
    goal: GoalResponse | null
    logs: FoodLogResponse[]
  } | null>(null)
  const [error, setError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([getDaily(), getCurrentGoal(), listFoodLogs('today')])
      .then(([totals, goal, logs]) => {
        if (active) {
          setSummary({ totals, goal, logs })
          setError(false)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [refreshKey])

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="YOUR DAILY OVERVIEW"
        title="A healthier you starts here."
        description="A little awareness. A little consistency. A little better every day."
      >
        <span className="date-badge">
          <Icon name="calendar" size={17} />
          {new Date().toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <Link to="/food-log" className="button-primary">
          <Icon name="plus" size={18} />
          Log food
        </Link>
      </PageHeader>
      {error ? (
        <div className="space-y-3">
          <ErrorMessage message="We couldn’t load your daily overview. Please try again." />
          <button
            className="button-secondary"
            onClick={() => setRefreshKey((previous) => previous + 1)}
          >
            Try again
          </button>
        </div>
      ) : !summary ? (
        <Card>
          <LoadingSpinner />
        </Card>
      ) : (
        <div className="overview-grid">
          <DailyTotalsWidget totals={summary.totals} goal={summary.goal} />
          <Card className="diary-preview">
            <div className="card-heading">
              <div>
                <span className="eyebrow">ONE ENTRY AT A TIME</span>
                <h2>Today’s diary</h2>
              </div>
              <span className="stat-icon food-icon">
                <Icon name="diary" />
              </span>
            </div>
            <p className="card-description">Good habits start with checking in.</p>
            {summary.logs.length ? (
              <div className="recent-foods">
                {[...summary.logs]
                  .sort(
                    (first, second) =>
                      new Date(second.consumed_at).getTime() -
                      new Date(first.consumed_at).getTime(),
                  )
                  .slice(0, 3)
                  .map((log) => (
                    <div className="recent-food" key={log.id}>
                      <span className="food-initial" aria-hidden="true">
                        {(log.food_name || 'Food').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{log.food_name || 'Food entry'}</strong>
                        <span>
                          {log.amount} {log.unit_label}
                        </span>
                      </div>
                      <p>
                        {Math.round(log.calories)}
                        <small>kcal</small>
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="diary-empty">
                <span className="empty-icon">
                  <Icon name="diary" size={30} />
                </span>
                <h3>A fresh page for today</h3>
                <p>
                  Your food entries will appear here.
                  <br />
                  Start with your first bite.
                </p>
              </div>
            )}
            <Link to="/food-log" className="button-secondary diary-button">
              {summary.logs.length ? 'Open food diary' : 'Log your first food'}
              <Icon name="arrow" size={17} />
            </Link>
          </Card>
        </div>
      )}
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE BIGGER PICTURE</span>
          <h2>See your progress</h2>
          <p>Small steps today. Meaningful patterns over time.</p>
        </div>
        <span className="section-icon">
          <Icon name="chart" size={25} />
        </span>
      </div>
      <div className="charts-grid">
        <WeeklyChart />
        <GoalProgressChart />
      </div>
      <MacroTrendChart />
      <div className="encouragement">
        <span className="encouragement-icon">
          <Icon name="leaf" size={25} />
        </span>
        <div>
          <strong>Progress is a practice.</strong>
          <p>Keep showing up for yourself, one day at a time.</p>
        </div>
        <Link to="/goals" className="text-link">
          Make it personal
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </div>
  )
}
