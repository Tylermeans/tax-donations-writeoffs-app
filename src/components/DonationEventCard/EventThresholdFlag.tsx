/**
 * EventThresholdFlag — per-event $250 IRS written acknowledgment warning.
 *
 * Displayed as a colored band directly beneath the event header when the
 * deductible total for that event exceeds $250. Per IRS Publication 1771,
 * the donating organization must provide written acknowledgment for any
 * single donation of $250 or more — this threshold is per-event, not aggregate.
 *
 * Why role="alert": the flag may appear/disappear as items are added/removed
 * within the event. role="alert" causes screen readers to announce the warning
 * immediately when it enters the DOM without requiring the user to navigate to it.
 *
 * Per UI-SPEC: amber coloring is reserved exclusively for IRS threshold flags.
 */
import { AlertTriangle } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventThresholdFlagProps {
  /** Organization name for the personalized warning message */
  organization: string
  /** Controls visibility — render nothing when false to avoid empty DOM nodes */
  visible: boolean
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventThresholdFlag({ organization, visible }: EventThresholdFlagProps) {
  // Return null when not needed — avoids empty wrapper nodes in the DOM (D-11)
  if (!visible) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200"
    >
      {/* AlertTriangle icon uses aria-hidden because the role="alert" and text
          content convey the warning — the icon is purely decorative here */}
      <AlertTriangle size={14} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
      <p className="text-xs text-amber-800">
        This donation exceeds $250 — a written acknowledgment from{' '}
        <strong>{organization || 'the organization'}</strong> is required for your tax
        records.
      </p>
    </div>
  )
}
