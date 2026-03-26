/**
 * ExportContent — the lazy boundary that loads @react-pdf/renderer on demand.
 *
 * This file is intentionally the ONLY non-pdf/ file that imports @react-pdf/renderer.
 * It lives behind a React.lazy() call in ExportButton.tsx, so the ~300KB library
 * is only downloaded when the user clicks "Export PDF" for the first time.
 *
 * Render states:
 * - loading: PDF generation in progress — show pulsing "Generating PDF..." text
 * - error: PDF generation failed — show error + retry button
 * - ready: show a download anchor styled as a primary button
 *
 * Export as default — required by React.lazy().
 */
import { usePDF } from '@react-pdf/renderer'
import { DonationReport } from '../../pdf/DonationReport'
import { buildReportData } from '../../pdf/buildReportData'
import { useDonationStore } from '../../store'

interface ExportContentProps {
  onDone: () => void
}

export default function ExportContent({ onDone }: ExportContentProps) {
  // Read the entire store state as a one-time snapshot for the PDF
  const state = useDonationStore()
  const reportData = buildReportData(state)

  // usePDF renders the document and provides a blob URL to download
  const [instance] = usePDF({ document: <DonationReport data={reportData} /> })

  if (instance.loading) {
    return (
      // Pulsing animation is wrapped in @media (prefers-reduced-motion) via Tailwind
      <span className="text-sm text-brand-600 animate-pulse motion-reduce:animate-none">
        Generating PDF...
      </span>
    )
  }

  if (instance.error) {
    return (
      <span className="text-sm text-red-600">
        PDF generation failed.{' '}
        <button
          type="button"
          onClick={() => {
            // Trigger re-mount to retry generation
            onDone()
          }}
          className="underline cursor-pointer text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </span>
    )
  }

  // PDF is ready — render a download anchor styled as a primary button
  return (
    <a
      href={instance.url ?? undefined}
      download={`donations-${reportData.taxYear}.pdf`}
      onClick={onDone}
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
