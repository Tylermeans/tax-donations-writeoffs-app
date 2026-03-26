/**
 * ThresholdFlags — aggregate IRS compliance banners (DASH-05, DASH-06, DASH-07).
 *
 * Two possible flags, each reactive to store state:
 *   1. $500 aggregate: Form 8283 Section A required (D-12)
 *   2. $5,000 per-item: Qualified appraisal required, names the specific item (D-13)
 *
 * Per UI-SPEC section 11: flags must appear immediately with no animation or
 * transition — role="alert" already triggers instant screen reader announcement.
 * Do NOT add transition/animate classes here.
 *
 * Returns null when neither flag is active so no empty wrapper renders in the DOM.
 */
import { AlertTriangle } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useDonationStore } from '../../store/index'
import { selectAggregateThresholdFlags, selectGrandTotal } from '../../store/selectors'

export function ThresholdFlags() {
  // useShallow prevents infinite re-renders — selectAggregateThresholdFlags returns a new object each call
  const flags = useDonationStore(useShallow(selectAggregateThresholdFlags))
  const grandTotal = useDonationStore(selectGrandTotal)

  // No active flags → render nothing (avoids empty space in the layout)
  if (!flags.requiresForm8283SectionA && !flags.requiresQualifiedAppraisal) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      {/* $500 aggregate flag — triggers Form 8283 Section A filing requirement */}
      {flags.requiresForm8283SectionA && (
        <aside
          role="alert"
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4"
        >
          <AlertTriangle size={16} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-amber-800">Form 8283 Section A required</p>
            <p className="text-sm text-amber-700">
              Your total non-cash donations exceed $500. Attach Form 8283 Section A to your tax
              return. Your total: ${grandTotal.toFixed(2)}.
            </p>
          </div>
        </aside>
      )}

      {/* $5,000 per-item flag — triggers qualified appraisal requirement for named item */}
      {flags.requiresQualifiedAppraisal && (
        <aside
          role="alert"
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4"
        >
          <AlertTriangle size={16} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-amber-800">Qualified appraisal required</p>
            <p className="text-sm text-amber-700">
              &ldquo;{flags.highValueItemName}&rdquo; is valued over $5,000. A qualified appraisal
              is required and must be attached to Form 8283 Section B.
            </p>
          </div>
        </aside>
      )}
    </div>
  )
}
