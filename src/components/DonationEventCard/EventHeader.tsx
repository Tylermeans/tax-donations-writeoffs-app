/**
 * EventHeader — editable event header with date, org name, running total, and actions.
 *
 * Two modes:
 * - View mode: shows formatted date, org name, event total, edit and delete buttons
 * - Edit mode: inline form with date input + org text input + Save/Cancel buttons
 *
 * The edit flow dispatches updateEvent (added to store in this plan) so items
 * are preserved — we never delete/re-add the event to avoid data loss.
 *
 * Delete flow: clicking the trash icon transitions to an inline DeleteConfirmation
 * component which receives programmatic focus. On confirm, removeEvent is called.
 *
 * Date formatting: appends T00:00:00 before parsing to force local-time
 * interpretation — without it, Date constructor treats YYYY-MM-DD as UTC,
 * causing off-by-one-day display in timezones behind UTC (D-08 pattern).
 */
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useDonationStore } from '../../store'
import type { DonationEvent } from '../../store/types'
import { DeleteConfirmation } from './DeleteConfirmation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventHeaderProps {
  event: DonationEvent
  /** Deductible total for this event — computed in DonationEventCard parent */
  eventTotal: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats an ISO date string (YYYY-MM-DD) as "Month D, YYYY".
 * Appends T00:00:00 so the Date constructor treats it as local time,
 * avoiding timezone off-by-one-day issues (UTC vs. local timezone).
 */
function formatEventDate(isoDate: string): string {
  if (!isoDate) return 'No date set'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventHeader({ event, eventTotal }: EventHeaderProps) {
  const removeEvent = useDonationStore((s) => s.removeEvent)
  const updateEvent = useDonationStore((s) => s.updateEvent)

  // Edit mode toggle — replaces header content with an inline form
  const [isEditing, setIsEditing] = useState(false)
  // Delete confirmation toggle — replaces the trash icon with DeleteConfirmation
  const [isDeleting, setIsDeleting] = useState(false)

  // Local edit state — initialized from the event, updated on input change
  const [editDate, setEditDate] = useState(event.date)
  const [editOrg, setEditOrg] = useState(event.organization)

  function handleDelete() {
    removeEvent(event.id)
  }

  function handleEditSave() {
    // Validate date is not empty before persisting
    if (!editDate) return
    updateEvent(event.id, { date: editDate, organization: editOrg })
    setIsEditing(false)
  }

  function handleEditCancel() {
    // Revert local state to current event values
    setEditDate(event.date)
    setEditOrg(event.organization)
    setIsEditing(false)
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <header className="flex flex-col gap-3 px-4 py-4 bg-brand-50 border-b border-brand-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          {/* Date input */}
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-medium text-brand-600">Donation date</span>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              required
              aria-label="Donation date"
              className="h-9 px-3 border border-brand-200 rounded-lg text-sm text-brand-800 bg-white focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20 cursor-pointer"
            />
          </label>

          {/* Organization name input */}
          <label className="flex flex-col gap-1 flex-1">
            <span className="text-xs font-medium text-brand-600">Organization</span>
            <input
              type="text"
              value={editOrg}
              onChange={(e) => setEditOrg(e.target.value)}
              placeholder="e.g. Goodwill, Salvation Army"
              aria-label="Organization name"
              className="h-9 px-3 border border-brand-200 rounded-lg text-sm text-brand-800 bg-white placeholder:text-brand-400 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20"
            />
          </label>
        </div>

        {/* Save / Cancel buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEditSave}
            className="h-8 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleEditCancel}
            className="h-8 px-3 text-brand-600 hover:text-brand-800 text-xs cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </header>
    )
  }

  // ── View mode ─────────────────────────────────────────────────────────────
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-4 bg-brand-50 border-b border-brand-100">
      {/* Left: formatted date + org name */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <time className="text-sm font-semibold text-brand-800" dateTime={event.date}>
          {formatEventDate(event.date)}
        </time>
        <span className="text-sm text-brand-600 truncate">
          {event.organization || 'Organization not specified'}
        </span>
      </div>

      {/* Right: event total + edit + delete actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Event total — tabular-nums prevents layout jitter as value changes */}
        <span className="text-sm font-semibold text-brand-700 tabular-nums">
          ${eventTotal.toFixed(2)}
        </span>

        {/* Edit button — opens inline edit form */}
        <button
          type="button"
          aria-label="Edit donation event"
          onClick={() => setIsEditing(true)}
          className="cursor-pointer text-brand-400 hover:text-brand-600"
        >
          <Pencil size={14} aria-hidden />
        </button>

        {/* Delete: shows DeleteConfirmation inline when isDeleting, trash icon otherwise */}
        {isDeleting ? (
          <DeleteConfirmation
            label="event"
            onConfirm={handleDelete}
            onCancel={() => setIsDeleting(false)}
          />
        ) : (
          <button
            type="button"
            aria-label="Delete donation event"
            onClick={() => setIsDeleting(true)}
            className="cursor-pointer text-brand-400 hover:text-red-500"
          >
            <Trash2 size={14} aria-hidden />
          </button>
        )}
      </div>
    </header>
  )
}
