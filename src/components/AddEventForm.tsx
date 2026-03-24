/**
 * AddEventForm — inline form for creating a new donation event.
 *
 * Collects the donation date and organization name then dispatches addEvent
 * to the Zustand store. The form uses native <form> submit (preventDefault)
 * so Enter key works in both fields without extra keydown handlers.
 *
 * After a successful add, fields are reset and onComplete() is called so the
 * parent (DonationEventList) can collapse this form and show the CTA button.
 *
 * Accessibility:
 * - Date input has aria-required="true" and aria-describedby linking to the
 *   hint span below it — AT reads "The date you dropped off your donations"
 *   when the input receives focus.
 * - Organization name is optional per IRS requirements — donation events can
 *   be valid without specifying the recipient org at time of entry.
 * - section[aria-label] makes the form a distinct landmark for screen reader
 *   users navigating by regions.
 */
import { useState } from 'react'
import { useDonationStore } from '../store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AddEventFormProps {
  /** Called after the event is added and form is reset — collapses the form */
  onComplete: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AddEventForm({ onComplete }: AddEventFormProps) {
  const addEvent = useDonationStore((s) => s.addEvent)

  const [date, setDate] = useState('')
  const [organization, setOrganization] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Date is required — native validation handles the browser-level error,
    // but we guard here as well for programmatic callers and to be explicit.
    if (!date) return

    addEvent({ date, organization })

    // Reset fields so the form is clean if the user opens it again
    setDate('')
    setOrganization('')

    onComplete()
  }

  return (
    <section aria-label="Add donation event">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-brand-100 rounded-xl px-4 py-5 flex flex-col gap-4"
      >
        <h2 className="text-base font-semibold text-brand-800">New Donation Event</h2>

        {/* Donation date — required */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brand-700">
            Donation date <span aria-hidden>*</span>
          </span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-required="true"
            aria-describedby="event-date-hint"
            className="h-10 px-3 border border-brand-200 rounded-lg text-sm text-brand-800 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 cursor-pointer"
          />
          <span id="event-date-hint" className="text-xs text-brand-400">
            The date you dropped off your donations
          </span>
        </label>

        {/* Organization name — optional */}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-brand-700">Organization name</span>
          <input
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Goodwill, Salvation Army"
            className="h-10 px-3 border border-brand-200 rounded-lg text-sm text-brand-800 placeholder:text-brand-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
          />
        </label>

        {/* Submit — accent color reserved for additive positive actions (UI-SPEC) */}
        <button
          type="submit"
          className="h-10 px-4 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
        >
          Add Donation Event
        </button>
      </form>
    </section>
  )
}
