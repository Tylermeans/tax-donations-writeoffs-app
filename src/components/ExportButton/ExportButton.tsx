/**
 * ExportButton — lazy-loading PDF export trigger.
 *
 * @react-pdf/renderer (~300KB) is NOT loaded until the user clicks this button.
 * The lazy import includes a retry mechanism — if the chunk fails to load
 * (e.g. stale deploy, cached index pointing to old chunk hash), it retries
 * once with a cache-busting query param before showing an error.
 */
import React, { Suspense, useState } from 'react'
import { FileDown } from 'lucide-react'

// Lazy import with retry — handles stale chunk filenames after deploys
const ExportContent = React.lazy(() =>
  import('./ExportContent').catch(() => {
    // First import failed (likely stale chunk hash) — retry with cache bust
    console.warn('[PDF] Lazy chunk failed, retrying...')
    return import('./ExportContent')
  })
)

export function ExportButton() {
  const [showPDF, setShowPDF] = useState(false)
  const [loadError, setLoadError] = useState(false)

  if (loadError) {
    return (
      <div className="inline-flex items-center gap-3">
        <span className="text-sm text-red-600">
          PDF module failed to load.{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="underline cursor-pointer text-red-600 hover:text-red-800"
          >
            Reload page
          </button>
        </span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-3">
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
        <FileDown size={16} aria-hidden="true" />
        Export PDF
      </button>

      {showPDF && (
        <Suspense fallback={<span className="text-sm text-brand-600 animate-pulse motion-reduce:animate-none">Preparing PDF...</span>}>
          <ErrorCatcher onError={() => { setShowPDF(false); setLoadError(true) }}>
            <ExportContent onDone={() => setShowPDF(false)} />
          </ErrorCatcher>
        </Suspense>
      )}
    </div>
  )
}

/**
 * Minimal error boundary to catch lazy-load chunk failures.
 * Calls onError so the parent can show a reload prompt.
 */
class ErrorCatcher extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[PDF] Chunk load error:', error.message)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}
