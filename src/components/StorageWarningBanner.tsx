/**
 * StorageWarningBanner — informs the user when localStorage is unavailable.
 *
 * Per D-17: the app must remain fully functional when localStorage is unavailable.
 * This banner is purely informational — it never blocks usage. It appears above
 * all other content so users notice it immediately (aria-live="polite" for
 * screen readers that may not focus the banner on mount).
 *
 * Common triggers: Safari Private Browsing, storage quota exceeded,
 * strict browser security policies (e.g., iframe sandboxing).
 */
import { AlertTriangle } from 'lucide-react'

export function StorageWarningBanner() {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-start gap-3"
    >
      {/* Icon is decorative — the text conveys the full message */}
      <AlertTriangle
        aria-hidden="true"
        className="text-amber-600 mt-0.5 shrink-0"
        size={16}
      />
      <p className="text-sm text-amber-800 leading-snug">
        <span className="font-semibold">Your data won&apos;t be saved in this session.</span>{' '}
        You may be using private browsing or storage is full.
      </p>
    </div>
  )
}
