const paths = {
  leaf: 'M20 4c-8-1-15 2-15 8a7 7 0 0 0 7 7c6 0 9-7 8-15ZM5 20 15 10M10 15v-5m0 5h5',
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  diary: 'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H4zM13 7a3 3 0 0 1 3-3h5v14h-4a4 4 0 0 0-4 3',
  target: 'M21 12a9 9 0 1 1-9-9m5 0v4h4m-4 0-5 5m4 0a4 4 0 1 1-4-4',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  logout: 'M9 4H4v16h5m5-13 5 5-5 5m-5-5h10',
  calendar:
    'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 11h18',
  flame: 'M12 3c1 5 5 5 5 9 2-1 2-3 2-3 5 8-1 12-7 12S2 17 5 11c0 3 2 3 2 3-1-5 4-7 5-11Z',
  check: 'm5 12 4 4L19 6',
  chart: 'M4 4v16h17M8 15l4-5 4 2 5-7',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
} as const

interface Props {
  name: keyof typeof paths
  size?: number
  className?: string
}

export default function Icon({ name, size = 20, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name]} />
    </svg>
  )
}
