/**
 * buildReportData — pure function that snapshots the Zustand store state
 * into a ReportData object for the PDF renderer.
 *
 * Taking a snapshot (instead of passing the live store) means the PDF
 * captures a point-in-time view. If the user edits items after clicking
 * Export, the already-generating PDF is not affected.
 */
import {
  selectGrandTotal,
  selectTotalsByCategory,
  selectAggregateThresholdFlags,
} from '../store/selectors'
import type { DonationStore } from '../store'

// ---------------------------------------------------------------------------
// ReportData type — the complete snapshot for the PDF
// ---------------------------------------------------------------------------

export interface ReportData {
  taxYear: number
  events: DonationStore['events']
  grandTotal: number
  totalsByCategory: Record<string, number>
  thresholds: ReturnType<typeof selectAggregateThresholdFlags>
  /** ISO timestamp of when the PDF was generated */
  generatedAt: string
}

// ---------------------------------------------------------------------------
// buildReportData
// ---------------------------------------------------------------------------

/**
 * Converts the full DonationStore state into a ReportData snapshot.
 *
 * All selector calls happen here once — PDF sub-components receive
 * pre-computed values so they don't need store access themselves.
 */
export function buildReportData(state: DonationStore): ReportData {
  return {
    taxYear: state.taxYear,
    events: state.events,
    grandTotal: selectGrandTotal(state),
    totalsByCategory: selectTotalsByCategory(state),
    thresholds: selectAggregateThresholdFlags(state),
    generatedAt: new Date().toISOString(),
  }
}
