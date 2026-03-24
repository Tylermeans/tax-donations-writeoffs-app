/**
 * DonationEventList — ordered list of donation events with an Add CTA.
 *
 * Renders one DonationEventCard per event from the store. When no events
 * exist, returns null — the parent (App.tsx) renders EmptyState instead.
 *
 * The "Add Donation Event" CTA toggles showAddForm which replaces the button
 * with the AddEventForm inline. After form submission AddEventForm calls
 * onComplete() → setShowAddForm(false) which restores the CTA button.
 *
 * Focus management after add:
 * After events.length increases (new event added), a useEffect focuses the
 * "Add item to this donation" button of the newly added event card. This
 * moves the user to the logical next action without relying on page scroll
 * or manual navigation. querySelector targets the last event card's button
 * since new events are appended at the end of the list.
 *
 * Why return null instead of <EmptyState>: EmptyState is handled at the
 * App.tsx level so it can occupy the full main content area with proper
 * py-16 spacing. If DonationEventList rendered it, it would be nested
 * inside the events section with incorrect spacing.
 */
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { AddEventForm } from '../AddEventForm'
import { DonationEventCard } from '../DonationEventCard'
import { useDonationStore } from '../../store'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DonationEventList() {
  const events = useDonationStore((s) => s.events)
  const taxYear = useDonationStore((s) => s.taxYear)

  // showAddForm: toggles between the CTA button and the inline AddEventForm
  const [showAddForm, setShowAddForm] = useState(false)

  // Track previous events count so we can detect a newly added event
  const prevEventsLengthRef = useRef(events.length)

  // After a new event is added, focus the "Add item" button on the last card.
  // This guides the user to the next natural action without relying on scroll.
  useEffect(() => {
    if (events.length > prevEventsLengthRef.current) {
      // Slight delay lets the DOM paint the new card before we query for its button
      const timeout = setTimeout(() => {
        const eventCards = document.querySelectorAll('[data-event-card]')
        const lastCard = eventCards[eventCards.length - 1]
        if (lastCard) {
          const addItemBtn = lastCard.querySelector<HTMLButtonElement>(
            '[aria-label="Add item to this donation"]'
          )
          addItemBtn?.focus()
        }
      }, 50)
      return () => clearTimeout(timeout)
    }
    prevEventsLengthRef.current = events.length
  }, [events.length])

  // Return null when empty — App.tsx renders EmptyState in this case
  if (events.length === 0) return null

  return (
    <section aria-label="Donation events" className="flex flex-col gap-4">
      {/* Render each event as a card — key on stable event.id */}
      {events.map((event) => (
        // data-event-card attribute used by the focus management useEffect above
        <div key={event.id} data-event-card>
          <DonationEventCard event={event} taxYear={taxYear} />
        </div>
      ))}

      {/* Add Donation Event CTA / inline form toggle */}
      {showAddForm ? (
        <AddEventForm onComplete={() => setShowAddForm(false)} />
      ) : (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            aria-label="Add a new donation event"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
          >
            <Plus size={16} aria-hidden />
            Add Donation Event
          </button>
        </div>
      )}
    </section>
  )
}
