import type { FoodLogResponse } from '../../types/foodLog'
import Icon from '../ui/Icon'

interface Props {
  log: FoodLogResponse
  onDelete: (id: number) => void
}

export default function FoodLogItem({ log, onDelete }: Props) {
  const time = new Date(log.consumed_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="food-log-item">
      <div className="food-log-name">
        <p>{log.food_name ?? 'Unknown'}</p>
        <div className="food-log-meta">
          {time} &middot; {log.amount} {log.unit_label}
          {log.grams != null && ` (${Math.round(log.grams)} g)`}
        </div>
        <div className="food-log-macros">
          <span className="protein">
            <i className="macro-dot" />P {Math.round(log.protein)}g
          </span>
          <span className="carbs">
            <i className="macro-dot" />C {Math.round(log.carbs)}g
          </span>
          <span className="fat">
            <i className="macro-dot" />F {Math.round(log.fat)}g
          </span>
        </div>
      </div>
      <div className="food-log-calories">
        {Math.round(log.calories)}
        <small>kcal</small>
      </div>
      <button
        onClick={() => onDelete(log.id)}
        className="delete-food"
        aria-label={`Delete ${log.food_name ?? 'food entry'}`}
      >
        <Icon name="trash" size={15} />
      </button>
    </div>
  )
}
