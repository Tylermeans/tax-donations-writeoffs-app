/**
 * ImportBackupButton — "Restore Backup" button with file picker.
 *
 * Lets users restore all donation data from a previously saved .json backup.
 * Uses a hidden file input (controlled via useRef) so the visible button can
 * be styled like a normal button rather than the browser's file input widget.
 *
 * Validation flow:
 * 1. User clicks "Restore Backup" → file picker opens
 * 2. User selects a .json file
 * 3. importJSON reads and validates via PersistedStateSchema.safeParse
 * 4a. Success → confirm dialog (if events exist) → store.replaceAll hydrates
 * 4b. Failure → inline error message shown for 5 seconds (never alert())
 *
 * Accessibility:
 * - Explicit aria-label on the button for screen readers
 * - focus-visible ring provides keyboard navigation indicator
 * - cursor-pointer satisfies CLAUDE.md clickable-element requirement
 * - Error/success messages use role="status" for AT announcements
 */
import { useRef, useState, useEffect } from 'react'
import { Upload } from 'lucide-react'
import { useDonationStore } from '../store'
import { importJSON } from '../storage/backup'
import type { ValidatedPersistedState } from '../storage/schema'

export function ImportBackupButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const replaceAll = useDonationStore((s) => s.replaceAll)
  const events = useDonationStore((s) => s.events)
  const hasEvents = events.length > 0

  // Inline feedback — never use alert() per plan acceptance criteria
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Auto-dismiss feedback after 5 seconds.
  // Cleanup on unmount prevents state updates on unmounted component.
  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(null), 5000)
    return () => clearTimeout(timer)
  }, [feedback])

  function handleButtonClick() {
    // Programmatically open the hidden file input
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset the input so the same file can be re-selected on a second attempt
    e.target.value = ''

    function onSuccess(state: ValidatedPersistedState) {
      // Confirm before replacing — data loss warning for users who have items
      if (hasEvents && !window.confirm('This will replace all current donation data. Continue?')) {
        return
      }

      // replaceAll atomically hydrates the store from the validated backup
      replaceAll({ taxYear: state.taxYear, events: state.events })
      setFeedback({ type: 'success', message: 'Backup restored successfully' })
    }

    function onError(message: string) {
      setFeedback({ type: 'error', message })
    }

    importJSON(file, onSuccess, onError)
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      {/* Hidden file input — clicking the visible button below triggers it */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        aria-label="Import donation data from JSON backup file"
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
        {/* Upload icon from lucide-react — no emoji icons per CLAUDE.md */}
        <Upload size={16} aria-hidden="true" />
        Restore Backup
      </button>

      {/* Inline feedback — role="status" lets screen readers announce it without
          pulling keyboard focus away from the button */}
      {feedback && (
        <p
          role="status"
          className={`text-xs font-medium ${
            feedback.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {feedback.message}
        </p>
      )}
    </div>
  )
}
