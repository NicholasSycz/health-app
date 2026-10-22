import { useState } from 'react'
import FoodLogForm from '../components/food/FoodLogForm'
import FoodLogList from '../components/food/FoodLogList'
import PageHeader from '../components/ui/PageHeader'
import Icon from '../components/ui/Icon'

export default function FoodLogPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="YOUR FOOD DIARY"
        title="Every bite tells a story."
        description="Keep track of what fuels you. Your daily habits start here."
      >
        <span className="date-badge">
          <Icon name="calendar" size={17} />
          {new Date().toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </PageHeader>
      <div className="diary-grid">
        <FoodLogForm onCreated={() => setRefreshKey((previous) => previous + 1)} />
        <FoodLogList refreshKey={refreshKey} />
      </div>
    </div>
  )
}
