/** Local calendar date as YYYY-MM-DD.
 *
 * `toISOString().slice(0, 10)` returns the *UTC* date, which is the wrong day
 * for anyone whose local date differs from UTC's at the moment of the call.
 */
export function localDateString(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
