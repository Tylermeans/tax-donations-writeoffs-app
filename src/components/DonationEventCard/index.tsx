/**
 * DonationEventCard — container for a single donation event.
 *
 * Composes EventHeader (date/org/actions), EventThresholdFlag ($250 IRS warning),
 * and a list of ItemCard components for each donated item in the event.
 *
 * The "Add item to this donation" button at the bottom toggles local
 * showItemPicker state. The ItemSearch component will be wired here in Plan 04.
 * For this plan the button exists and the state is managed; Plan 04 renders
 * the picker into the toggle target.
 *
 * Event total calculation: sum of fmv_selected * quantity for deductible items
 * only. Poor-condition items (condition === 'poor' with fmv_selected <= $500)
 * are excluded per IRC §170(f)(16) — isDeductible handles this check.
 *
 * Why overflow-hidden on the outer div: the rounded-xl corners need to clip
 * the EventHeader's bg-brand-50 and EventThresholdFlag's bg-amber-50 so they
 * don't leak outside the card borders.
 */
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { isDeductible } from '../../store/selectors'
import type { DonationEvent } from '../../store/types'
import { CatalogBrowser } from '../ItemCatalog/CatalogBrowser'
import { ItemSearch } from '../ItemCatalog/ItemSearch'
import { ItemCard } from '../ItemCard'
import { EventHeader } from './EventHeader'
import { EventThresholdFlag } from './EventThresholdFlag'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DonationEventCardProps {
  event: DonationEvent
  /** Tax year — passed down to ItemCard for condition-toggle and FMV display */
  taxYear: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DonationEventCard({ event, taxYear }: DonationEventCardProps) {
  // showItemPicker: toggled by "Add item" button; Plan 04 will render ItemSearch here
  const [showItemPicker, setShowItemPicker] = useState(false)

  // Compute deductible event total inline — avoids an extra store selector call
  // since we already have the event data. Poor items excluded per isDeductible.
  const eventTotal = event.items.reduce((acc, item) => {
    if (!isDeductible(item)) return acc
    return acc + item.fmv_selected * item.quantity
  }, 0)

  return (
    <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
      {/* Event header: date, org, running total, edit and delete actions */}
      <EventHeader event={event} eventTotal={eventTotal} />

      {/* $250 per-event IRS threshold flag — renders only when total > $250 */}
      <EventThresholdFlag organization={event.organization} visible={eventTotal > 250} />

      {/* Item list — divide-y creates a subtle separator between items */}
      {event.items.length > 0 && (
        <div className="divide-y divide-brand-100">
          {event.items.map((item) => (
            <div key={item.id} className="px-4 py-3">
              <ItemCard eventId={event.id} item={item} taxYear={taxYear} />
            </div>
          ))}
        </div>
      )}

      {/* Item picker: search + catalog browse — toggled by the Add item button */}
      {showItemPicker && (
        <div className="px-4 py-3 border-t border-brand-100 flex flex-col gap-4">
          {/* Type-ahead search — fastest path for users who know what they donated */}
          <ItemSearch eventId={event.id} onItemAdded={() => setShowItemPicker(false)} />
          {/* Category browser — for users who prefer to explore by type */}
          <CatalogBrowser eventId={event.id} onItemAdded={() => setShowItemPicker(false)} />
        </div>
      )}

      {/* Add item CTA — shown at the bottom of the card */}
      <div className="px-4 py-3 border-t border-brand-100">
        <button
          type="button"
          onClick={() => setShowItemPicker((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-medium text-accent-600 hover:text-accent-500 cursor-pointer"
          aria-label="Add item to this donation"
          aria-expanded={showItemPicker}
        >
          <Plus size={16} aria-hidden />
          Add item to this donation
        </button>
      </div>
    </div>
  )
}
