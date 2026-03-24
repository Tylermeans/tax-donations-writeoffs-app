/**
 * Derived state selectors for the donation store.
 *
 * All selectors are pure functions that accept the store state and return
 * computed values — no hooks, no side effects. This makes them testable
 * without React and composable across components.
 *
 * Business rules encoded here:
 * - IRC §170(f)(16): items must be in "good used condition or better" to be deductible.
 *   Exception: poor-condition items with fmv_selected > $500 remain deductible
 *   (typically applies to antiques, art, or collectibles verified by appraisal).
 * - $250 threshold is per-event (D-11): each donation event is evaluated independently.
 * - $500 threshold is aggregate grand total (D-12): triggers Form 8283 Section A.
 * - $5,000 threshold is per single item (D-13): triggers qualified appraisal requirement.
 */
import type { DonationItem } from './types'
import type { DonationStore } from './index'

// ---------------------------------------------------------------------------
// isDeductible — IRC §170(f)(16) condition check
// ---------------------------------------------------------------------------

/**
 * Returns true if an item qualifies for a charitable deduction.
 *
 * Poor-condition items are disqualified under IRC §170(f)(16) UNLESS their
 * fmv_selected exceeds $500, which typically indicates an appraised antique
 * or collectible where the poor condition has already been factored in.
 */
export const isDeductible = (item: DonationItem): boolean =>
  item.condition !== 'poor' || item.fmv_selected > 500

// ---------------------------------------------------------------------------
// selectGrandTotal
// ---------------------------------------------------------------------------

/**
 * Sums fmv_selected * quantity for all deductible items across all events.
 * Poor-condition items at or below $500 are excluded (isDeductible handles this).
 */
export const selectGrandTotal = (state: DonationStore): number =>
  state.events.reduce((eventAcc, event) => {
    const eventTotal = event.items.reduce((itemAcc, item) => {
      if (!isDeductible(item)) return itemAcc
      return itemAcc + item.fmv_selected * item.quantity
    }, 0)
    return eventAcc + eventTotal
  }, 0)

// ---------------------------------------------------------------------------
// selectTotalsByCategory
// ---------------------------------------------------------------------------

/**
 * Returns a map of category string → total deductible value.
 * Useful for the visual breakdown by category in the running total dashboard.
 */
export const selectTotalsByCategory = (state: DonationStore): Record<string, number> => {
  const totals: Record<string, number> = {}
  for (const event of state.events) {
    for (const item of event.items) {
      if (!isDeductible(item)) continue
      const prev = totals[item.category] ?? 0
      totals[item.category] = prev + item.fmv_selected * item.quantity
    }
  }
  return totals
}

// ---------------------------------------------------------------------------
// selectEventThresholdFlags — per-event $250 threshold (D-11)
// ---------------------------------------------------------------------------

/**
 * Returns one entry per event with:
 * - eventId: for matching back to the event
 * - eventTotal: sum of deductible items in this event
 * - requiresWrittenAcknowledgment: true when eventTotal > $250
 *
 * CRITICAL: This is per-event, not aggregate. A donor with 3 events at
 * $180/$280/$200 only needs written acknowledgment for the $280 event.
 */
export const selectEventThresholdFlags = (
  state: DonationStore
): Array<{ eventId: string; eventTotal: number; requiresWrittenAcknowledgment: boolean }> =>
  state.events.map((event) => {
    const eventTotal = event.items.reduce((acc, item) => {
      if (!isDeductible(item)) return acc
      return acc + item.fmv_selected * item.quantity
    }, 0)
    return {
      eventId: event.id,
      eventTotal,
      // $250 threshold triggers written acknowledgment requirement (IRS Publication 1771)
      requiresWrittenAcknowledgment: eventTotal > 250,
    }
  })

// ---------------------------------------------------------------------------
// selectAggregateThresholdFlags — $500 grand total (D-12) and $5K per-item (D-13)
// ---------------------------------------------------------------------------

/**
 * Returns aggregate-level threshold flags:
 * - requiresForm8283SectionA: true when grand total > $500 (Form 8283, Section A)
 * - requiresQualifiedAppraisal: true when any single item's fmv_selected > $5,000
 * - highValueItemName: name of the first item exceeding $5,000 (for UI callout)
 *
 * These thresholds operate on the aggregate / per-item level, NOT per-event.
 */
export const selectAggregateThresholdFlags = (
  state: DonationStore
): { requiresForm8283SectionA: boolean; requiresQualifiedAppraisal: boolean; highValueItemName?: string } => {
  const grandTotal = selectGrandTotal(state)

  // Find the first deductible item that exceeds the $5,000 per-item threshold
  let highValueItem: DonationItem | undefined
  for (const event of state.events) {
    for (const item of event.items) {
      // The $5K check applies to deductible items (isDeductible must pass)
      if (isDeductible(item) && item.fmv_selected > 5000) {
        highValueItem = item
        break
      }
    }
    if (highValueItem) break
  }

  return {
    // Form 8283 Section A required for total non-cash donations exceeding $500
    requiresForm8283SectionA: grandTotal > 500,
    // Qualified appraisal required for any single item exceeding $5,000
    requiresQualifiedAppraisal: highValueItem !== undefined,
    highValueItemName: highValueItem?.name,
  }
}
