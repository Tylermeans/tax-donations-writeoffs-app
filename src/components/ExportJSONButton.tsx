/**
 * ExportJSONButton — "Save Backup" button.
 *
 * Reads the current donation store state and triggers a .json file download
 * via exportJSON. Standalone component — wired into the UI by Plan 02.
 *
 * Accessibility:
 * - Explicit aria-label describes the action for screen readers
 * - focus-visible ring provides keyboard navigation indicator
 * - cursor-pointer satisfies CLAUDE.md clickable-element requirement
 */
import { Download } from 'lucide-react'
import { useDonationStore } from '../store'
import { exportJSON } from '../storage/backup'

export function ExportJSONButton() {
  const schemaVersion = useDonationStore((s) => s.schemaVersion)
  const taxYear = useDonationStore((s) => s.taxYear)
  const events = useDonationStore((s) => s.events)

  function handleClick() {
    // Snapshot the current store state into the PersistedState shape for the backup
    exportJSON({ schemaVersion, taxYear, events })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Save donation data as JSON backup file"
      className="
        inline-flex items-center gap-2
        px-4 py-2 rounded-md
        border border-brand-300
        bg-white text-brand-700
        text-sm font-medium
        cursor-pointer
        hover:bg-brand-50
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        transition-colors
      "
    >
      {/* Download icon from lucide-react — no emoji icons per CLAUDE.md */}
      <Download size={16} aria-hidden="true" />
      Save Backup
    </button>
  )
}
