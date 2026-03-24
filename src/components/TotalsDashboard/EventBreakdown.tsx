/**
 * EventBreakdown — per-donation-event date and total breakdown (DASH-02).
 *
 * Matches each event to its computed total from eventFlags to avoid
 * re-running the sum. Only renders when events exist.
 */
import type { DonationEvent } from '../../store/types'

interface EventBreakdownProps {
  events: DonationEvent[]
  eventFlags: Array<{ eventId: string; eventTotal: number }>
}

/**
 * Format an ISO date string (YYYY-MM-DD) as "Month Day, Year".
 * Append T00:00:00 to force UTC midnight parsing — without it, the Date
 * constructor parses bare ISO date strings as UTC but toLocaleDateString
 * shifts by local timezone offset, producing "Dec 31" for a Jan 1 date.
 */
function formatEventDate(isoDate: string): string {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function EventBreakdown({ events, eventFlags }: EventBreakdownProps) {
  if (events.length === 0) return null

  // Build a lookup map so each event can find its pre-computed total in O(1)
  const totalByEventId = new Map(eventFlags.map((f) => [f.eventId, f.eventTotal]))

  return (
    <div className="mt-4 pt-4 border-t border-brand-100 flex flex-col gap-2">
      <p className="text-xs font-medium text-brand-500 uppercase tracking-wide">By date</p>
      {events.map((event) => {
        const eventTotal = totalByEventId.get(event.id) ?? 0
        return (
          <div key={event.id} className="flex justify-between text-sm">
            <span className="text-brand-600">
              {formatEventDate(event.date)} · {event.organization}
            </span>
            <span className="text-brand-800 font-medium tabular-nums">
              ${eventTotal.toFixed(2)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
