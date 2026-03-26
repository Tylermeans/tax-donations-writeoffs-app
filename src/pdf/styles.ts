/**
 * Shared StyleSheet constants for all PDF components.
 *
 * IMPORTANT: Only built-in Helvetica font family is used here.
 * Do NOT call Font.register() — there is a known v4 bug where custom
 * font registration causes usePDF to hang in a loading state indefinitely.
 *
 * Available built-in fonts: 'Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique'
 */
import { StyleSheet } from '@react-pdf/renderer'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Formats a number as a US dollar string: $1,234.56
 * Used across all PDF components for consistent currency display.
 */
export function formatCurrency(n: number): string {
  return `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * Formats an ISO date string (YYYY-MM-DD) as a human-readable date.
 *
 * Uses the T00:00:00 suffix to force UTC parsing — prevents the timezone
 * off-by-one-day issue where a date like "2025-03-15" renders as March 14
 * in negative-UTC-offset timezones (established Phase 2 pattern).
 */
export function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Page and footer styles
// ---------------------------------------------------------------------------

export const pageStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingRight: 60,
    paddingBottom: 60, // extra bottom padding to avoid overlap with fixed footer
    paddingLeft: 40,
    color: '#1a1a1a',
  },
})

export const footerStyles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666666',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

// ---------------------------------------------------------------------------
// Section styles
// ---------------------------------------------------------------------------

export const sectionStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 4,
    color: '#1a1a1a',
  },
  subHeader: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 8,
  },
})

// ---------------------------------------------------------------------------
// Table styles
// ---------------------------------------------------------------------------

export const tableStyles = StyleSheet.create({
  table: {
    width: '100%',
    marginBottom: 8,
  },
  // Header row — bold labels with bottom border
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
  },
  // Standard data row
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 20,
  },
  // Non-deductible item row — dimmed to signal exclusion from totals
  strikeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 4,
    paddingRight: 4,
    minHeight: 20,
    opacity: 0.4,
  },
  // Column width allocations: must sum to 100%
  colName: { width: '40%' },
  colCondition: { width: '15%' },
  colQty: { width: '10%', textAlign: 'right' },
  colFmv: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  // Header cell text — bold
  headerCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#333333',
  },
  // Standard cell text
  cellText: {
    fontSize: 9,
    color: '#1a1a1a',
  },
  // Non-deductible note below item name
  nonDeductibleNote: {
    fontSize: 7,
    color: '#cc0000',
    marginTop: 1,
  },
})

// ---------------------------------------------------------------------------
// Notice box styles (IRS Filing Notes)
// ---------------------------------------------------------------------------

export const noticeBoxStyles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#f8f8f8',
    padding: 10,
    marginBottom: 16,
    borderRadius: 2,
  },
  title: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 6,
    color: '#1a1a1a',
  },
  bullet: {
    fontSize: 9,
    marginBottom: 4,
    color: '#333333',
  },
  disclaimer: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8,
    color: '#555555',
    marginTop: 8,
    lineHeight: 1.4,
  },
})
