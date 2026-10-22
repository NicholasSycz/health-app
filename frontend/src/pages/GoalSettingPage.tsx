import { useState } from 'react'
import GoalForm from '../components/goals/GoalForm'
import CurrentGoalWidget from '../components/goals/CurrentGoalWidget'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'

export default function GoalSettingPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="PERSONAL TO YOU"
        title="Your goals. Your pace."
        description="Give your day a little direction with nutrition targets that work for you."
      />
      {refreshKey > 0 && (
        <p role="status" className="success-message">
          <Icon name="check" size={17} />
          Your goals have been saved.
        </p>
      )}
      <div className="goal-grid">
        <GoalForm onSaved={() => setRefreshKey((previous) => previous + 1)} />
        <CurrentGoalWidget refreshKey={refreshKey} />
      </div>
    </div>
  )
}
