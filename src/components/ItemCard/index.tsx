/**
 * ItemCard — composite item row component.
 *
 * Composes ConditionToggle, FMVRangePicker, and QuantityEditor into a single
 * interactive row. Handles all compliance warning states:
 *
 * 1. Poor-condition exclusion (IRC §170(f)(16)): red aside with strikethrough total
 * 2. High-value per-item warning (>$5,000): amber aside requiring qualified appraisal
 *
 * Why <article>: semantically each donated item is a self-contained unit of
 * content, making <article> the correct element. The aria-label makes the
 * landmark meaningful to screen reader users navigating by landmarks.
 *
 * Layout: single-column on mobile, side-by-side left (name/category) and
 * right (controls) on md+ per UI-SPEC section 6.
 */
import { AlertTriangle, Trash2 } from 'lucide-react'
import { useDonationStore } from '../../store'
import { isDeductible } from '../../store/selectors'
import type { DonationItem } from '../../store/types'
import { ConditionToggle } from './ConditionToggle'
import { FMVRangePicker } from './FMVRangePicker'
import { QuantityEditor } from './QuantityEditor'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ItemCardProps {
  eventId: string
  item: DonationItem
  taxYear: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ItemCard({ eventId, item, taxYear }: ItemCardProps) {
  // Only removeItem is used directly in ItemCard — sub-components call updateItem themselves
  const removeItem = useDonationStore((s) => s.removeItem)

  const deductible = isDeductible(item)
  const lineTotal = item.fmv_selected * item.quantity
  // $5K threshold check only applies when the item is deductible (poor items
  // with fmv_selected > 500 can also be deductible — selectors handle this)
  const isHighValue = deductible && lineTotal > 5000

  return (
    <article aria-label={item.name} className="bg-white rounded-xl border border-brand-100 p-4">
      {/* Main content row: left (meta) + right (controls) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
        {/* Left column — item name, category badge, optional IRS note */}
        <div className="flex flex-col gap-1 md:flex-1">
          <h4 className="text-sm font-semibold text-brand-800">{item.name}</h4>

          <span className="self-start text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">
            {item.category}
          </span>

          {/* IRS note — shown for categories with higher IRS scrutiny (e.g. electronics).
              Only rendered when the catalog entry includes an irsNote (ITEM-06). */}
          {item.irsNote && (
            <p className="text-xs text-brand-500 mt-1">{item.irsNote}</p>
          )}
        </div>

        {/* Right column — all interactive controls + line total */}
        <div className="flex flex-col gap-2 md:shrink-0 md:min-w-[160px]">
          <ConditionToggle eventId={eventId} item={item} taxYear={taxYear} />
          <FMVRangePicker eventId={eventId} item={item} taxYear={taxYear} />

          {/* Bottom row: quantity editor + line total */}
          <div className="flex items-center justify-between">
            <QuantityEditor eventId={eventId} item={item} />

            {/* Line total — strikethrough + muted when non-deductible (poor condition) */}
            {deductible ? (
              <span className="text-sm font-semibold text-brand-800 tabular-nums">
                ${lineTotal.toLocaleString()}
              </span>
            ) : (
              <span className="text-sm font-semibold text-brand-400 line-through tabular-nums">
                ${lineTotal.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Poor-condition exclusion warning (ITEM-07, D-10).
          IRC §170(f)(16): items must be in "good used condition or better" to be
          deductible. This aside uses role="alert" so screen readers announce it
          immediately when the user switches condition to Poor. */}
      {!deductible && (
        <aside
          role="alert"
          className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={14} aria-hidden className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 leading-relaxed">
            Items in poor condition are generally not deductible under IRC section 170(f)(16).
            This item is excluded from your total. Items over $500 may qualify with a
            qualified appraisal — consult a tax professional.
          </p>
        </aside>
      )}

      {/* $5,000 per-item qualified appraisal warning (DASH-06, D-13).
          Only shown when item is deductible AND line total exceeds $5K.
          Amber color reserved exclusively for IRS threshold flags per UI-SPEC. */}
      {isHighValue && (
        <aside
          role="alert"
          className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
        >
          <AlertTriangle size={14} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Items valued over $5,000 require a qualified appraisal and Form 8283 Section B.
          </p>
        </aside>
      )}

      {/* Remove button — dedicated button at the bottom, no overlap with content */}
      <div className="mt-3 pt-3 border-t border-brand-100">
        <button
          type="button"
          aria-label={`Remove ${item.name}`}
          onClick={() => removeItem(eventId, item.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer transition-colors"
        >
          <Trash2 size={13} aria-hidden />
          Remove
        </button>
      </div>
    </article>
  )
}
