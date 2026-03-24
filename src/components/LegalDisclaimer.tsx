/**
 * LegalDisclaimer — persistent notice about the nature of FMV estimates.
 *
 * Per D-16: this must be visible and readable — NOT fine print. font-size is
 * text-sm (14px) at minimum. The text explicitly distinguishes charity-guide
 * estimates from IRS-determined values, per INFR-05.
 *
 * Rendered by AppShell directly below the header so it's always visible on
 * page load without scrolling.
 */
import { Info } from 'lucide-react'

export function LegalDisclaimer() {
  return (
    <aside
      role="note"
      className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 flex items-start gap-3 max-w-2xl mx-auto mt-4"
    >
      {/* Icon is decorative — message is fully conveyed by text */}
      <Info
        aria-hidden="true"
        className="text-brand-500 mt-0.5 shrink-0"
        size={16}
      />
      <p className="text-sm text-brand-800 leading-relaxed">
        This tool provides estimates based on Salvation Army and Goodwill valuation
        guides. These are not IRS-determined values. Consult a qualified tax
        professional to understand if your deductions qualify.
      </p>
    </aside>
  )
}
