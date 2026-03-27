/**
 * LegalDisclaimer — persistent notice about the nature of FMV estimates.
 *
 * Per D-16: this must be visible and readable — NOT fine print.
 * Beefed up to provide stronger legal protection for the tool provider.
 */
import { Info } from 'lucide-react'

export function LegalDisclaimer() {
  return (
    <aside
      role="note"
      className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 flex items-start gap-3 max-w-2xl mx-auto mt-4"
    >
      <Info
        aria-hidden="true"
        className="text-brand-500 mt-0.5 shrink-0"
        size={16}
      />
      <p className="text-sm text-brand-800 leading-relaxed">
        <strong>Not tax advice.</strong> This free tool provides estimates based on
        published charity valuation guides. Values shown are not IRS-determined and
        may not reflect the actual fair market value of your items. Always consult a
        qualified tax professional before claiming deductions.
      </p>
    </aside>
  )
}
