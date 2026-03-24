/**
 * DeleteConfirmation — inline delete confirmation pattern.
 *
 * Replaces the trash icon in-place when the user clicks delete. Programmatic
 * focus moves to the "Delete" confirm button on mount so keyboard and AT users
 * can immediately confirm or press Escape/Tab to reach "Cancel".
 *
 * Why programmatic focus instead of role="alert": role="alert" would only
 * announce the text but leave focus on the original trigger. Moving focus to
 * the confirm button both announces the dialog text (via aria-label) AND puts
 * the user in the correct position to act — better UX for AT users.
 *
 * Why no role="dialog": this is a micro-confirmation rendered inline within
 * the parent layout, not a modal that traps focus. The parent unmounts it on
 * both confirm and cancel, so no focus-trap management is needed.
 */
import { useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DeleteConfirmationProps {
  /** "event" or "item" — used in the confirmation prompt label */
  label: string
  onConfirm: () => void
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeleteConfirmation({ label, onConfirm, onCancel }: DeleteConfirmationProps) {
  // Ref to the Delete button so we can focus it programmatically on mount
  const confirmRef = useRef<HTMLButtonElement>(null)

  // Focus the confirm button as soon as this component mounts.
  // This handles both mouse and keyboard flows — the user is immediately
  // positioned on the destructive action so they must make a conscious choice.
  useEffect(() => {
    confirmRef.current?.focus()
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-red-700">Delete this {label}?</span>
      <button
        ref={confirmRef}
        type="button"
        aria-label="Confirm delete"
        onClick={onConfirm}
        className="px-3 py-1 bg-red-600 text-white text-sm rounded cursor-pointer hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
      >
        Delete
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-3 py-1 text-brand-600 text-sm hover:text-brand-800 cursor-pointer"
      >
        Cancel
      </button>
    </div>
  )
}
