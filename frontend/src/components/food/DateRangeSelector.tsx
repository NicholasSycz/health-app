const ranges = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

interface Props {
  selected: string
  onChange: (range: string) => void
}

export default function DateRangeSelector({ selected, onChange }: Props) {
  return (
    <div className="segmented-control" role="group" aria-label="Diary date range">
      {ranges.map((r) => (
        <button key={r.value} onClick={() => onChange(r.value)} aria-pressed={selected === r.value}>
          {r.label}
        </button>
      ))}
    </div>
  )
}
