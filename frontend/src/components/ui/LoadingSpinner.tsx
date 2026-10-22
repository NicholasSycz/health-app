export default function LoadingSpinner() {
  return (
    <div role="status" className="flex items-center justify-center p-8">
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"
      />
      <span className="sr-only">Loading your data…</span>
    </div>
  )
}
