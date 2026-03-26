/**
 * ExportButton — lazy-loading PDF export trigger.
 *
 * @react-pdf/renderer (~300KB) is NOT loaded until the user clicks this button.
 * The lazy boundary is ExportContent.tsx — React.lazy defers its import until
 * the Suspense boundary first renders ExportContent.
 *
 * State flow:
 * 1. Initial: show "Export PDF" button
 * 2. On click: set showPDF = true → Suspense renders ExportContent (triggers lazy load)
 * 3. ExportContent shows loading/error/download states
 * 4. On download or error-dismiss: onDone callback resets showPDF = false
 *
 * Accessibility:
 * - aria-label on the trigger button for screen readers
 * - cursor-pointer per CLAUDE.md
 * - FileDown icon from lucide-react (no emoji)
 */
import React, { Suspense, useState } from 'react'
import { FileDown } from 'lucide-react'

// Lazy import — @react-pdf/renderer is NOT loaded until ExportContent renders
const ExportContent = React.lazy(() => import('./ExportContent'))

export function ExportButton() {
  const [showPDF, setShowPDF] = useState(false)

  return (
    <div className="inline-flex items-center gap-3">
      {/* Primary trigger button — always visible */}
      <button
        type="button"
        onClick={() => setShowPDF(true)}
        aria-label="Export donation summary as PDF"
        className="
          inline-flex items-center gap-2
          px-4 py-2 rounded-md
          bg-brand-600 text-white
          text-sm font-medium
          cursor-pointer
          hover:bg-brand-700
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
          transition-colors
        "
      >
        {/* FileDown icon from lucide-react — no emoji per CLAUDE.md */}
        <FileDown size={16} aria-hidden="true" />
        Export PDF
      </button>

      {/* Lazy content renders only after button click — defers @react-pdf/renderer load */}
      {showPDF && (
        <Suspense fallback={<span className="text-sm text-brand-600">Preparing PDF...</span>}>
          <ExportContent onDone={() => setShowPDF(false)} />
        </Suspense>
      )}
    </div>
  )
}
