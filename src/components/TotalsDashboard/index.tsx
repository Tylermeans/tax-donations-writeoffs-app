/**
 * TotalsDashboard — primary feedback panel showing live-updating deduction total,
 * per-category breakdown, and per-event date breakdown (DASH-01, DASH-02, DASH-03).
 *
 * Only renders when the user has at least one donation event — an empty dashboard
 * before any data exists would confuse users (EmptyState covers that state instead).
 *
 * Sticky positioning on md+ keeps the total visible while the user scrolls
 * through their event list.
 */
import { DollarSign } from 'lucide-react'
import { useDonationStore } from '../../store/index'
import {
  selectGrandTotal,
  selectTotalsByCategory,
  selectEventThresholdFlags,
} from '../../store/selectors'
import { CategoryBreakdown } from './CategoryBreakdown'
import { EventBreakdown } from './EventBreakdown'

export function TotalsDashboard() {
  // Fine-grained subscriptions — each re-renders only when its slice changes
  const grandTotal = useDonationStore(selectGrandTotal)
  const byCategory = useDonationStore(selectTotalsByCategory)
  const events = useDonationStore((s) => s.events)
  const taxYear = useDonationStore((s) => s.taxYear)
  const eventFlags = useDonationStore(selectEventThresholdFlags)

  // Do not render before any data exists — EmptyState handles the zero-event state
  if (events.length === 0) return null

  return (
    <section
      aria-label="Deduction summary"
      className="bg-white border border-brand-100 rounded-xl p-6 md:sticky md:top-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-500 mb-1">{taxYear} Deductible Total</p>
          {/*
           * aria-live="polite" + aria-atomic="true": screen readers announce the
           * full updated value after each change without interrupting ongoing speech.
           * aria-atomic ensures the entire dollar amount is read, not just the changed digit.
           */}
          <p
            className="text-3xl font-bold text-brand-800 tabular-nums"
            aria-live="polite"
            aria-atomic="true"
          >
            ${grandTotal.toFixed(2)}
          </p>
          <p className="text-sm text-brand-500 mt-1">
            across {events.length} donation event{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        {/* Decorative icon — hidden from assistive tech since the text already communicates everything */}
        <div aria-hidden className="text-brand-200">
          <DollarSign size={40} />
        </div>
      </div>

      <CategoryBreakdown totalsByCategory={byCategory} />
      <EventBreakdown events={events} eventFlags={eventFlags} />
    </section>
  )
}
