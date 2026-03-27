/**
 * ExportContent — the lazy boundary that loads @react-pdf/renderer on demand.
 *
 * Uses pdf().toBlob() instead of usePDF() hook — the hook has known infinite
 * loop issues with React 19's useSyncExternalStore. The imperative API is
 * more reliable and gives us explicit control over the generation lifecycle.
 *
 * Export as default — required by React.lazy().
 */
import { useEffect, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { DonationReport } from '../../pdf/DonationReport'
import { buildReportData } from '../../pdf/buildReportData'
import { useDonationStore } from '../../store'

interface ExportContentProps {
  onDone: () => void
}

export default function ExportContent({ onDone }: ExportContentProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Snapshot store state once on mount — not reactive (PDF is point-in-time)
  const state = useDonationStore.getState()
  const reportData = buildReportData(state)

  useEffect(() => {
    let cancelled = false

    async function generate() {
      try {
        console.log('[PDF] Starting generation...')
        const blob = await pdf(<DonationReport data={reportData} />).toBlob()
        if (cancelled) return
        const url = URL.createObjectURL(blob)
        console.log('[PDF] Generation complete, blob URL created')
        setBlobUrl(url)
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        const msg = err instanceof Error ? err.message : String(err)
        console.error('[PDF] Generation failed:', msg)
        setErrorMsg(msg)
        setStatus('error')
      }
    }

    generate()

    return () => {
      cancelled = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // Run once on mount — reportData is a snapshot, not reactive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading') {
    return (
      <span className="text-sm text-brand-600 animate-pulse motion-reduce:animate-none">
        Generating PDF...
      </span>
    )
  }

  if (status === 'error') {
    return (
      <span className="text-sm text-red-600">
        PDF failed: {errorMsg}.{' '}
        <button
          type="button"
          onClick={onDone}
          className="underline cursor-pointer text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </span>
    )
  }

  return (
    <a
      href={blobUrl ?? undefined}
      download={`donations-${reportData.taxYear}.pdf`}
      onClick={() => {
        // Small delay so the download starts before we unmount
        setTimeout(onDone, 100)
      }}
      className="
        inline-flex items-center gap-2
        px-4 py-2 rounded-md
        bg-brand-600 text-white
        text-sm font-medium
        cursor-pointer
        hover:bg-brand-700
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
        transition-colors
        no-underline
      "
    >
      Download PDF
    </a>
  )
}
