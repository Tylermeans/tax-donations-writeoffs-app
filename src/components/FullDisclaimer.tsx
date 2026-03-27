/**
 * FullDisclaimer — modal overlay with comprehensive legal disclaimer.
 *
 * Covers: no warranty, no tax advice, limitation of liability, accuracy
 * disclaimers, indemnification, and governing terms. Written to provide
 * maximum legal protection for a free, open-source tool.
 *
 * Triggered by a footer link. Uses native <dialog> for accessibility
 * (focus trap, Escape to close, backdrop click to close).
 */
import { useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface FullDisclaimerProps {
  open: boolean
  onClose: () => void
}

export function FullDisclaimer({ open, onClose }: FullDisclaimerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Close on backdrop click (click on <dialog> itself, not its children)
        if (e.target === dialogRef.current) onClose()
      }}
      className="max-w-2xl w-[calc(100%-2rem)] mx-auto rounded-xl border border-brand-200 shadow-xl p-0 backdrop:bg-black/50"
    >
      <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-brand-800">
            Disclaimer &amp; Terms of Use
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close disclaimer"
            className="text-brand-400 hover:text-brand-600 cursor-pointer transition-colors"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 text-sm text-brand-700 leading-relaxed">
          <section>
            <h3 className="font-semibold text-brand-800 mb-1">No Tax Advice</h3>
            <p>
              Donation Itemizer is an informational tool only. Nothing provided by this
              tool constitutes tax advice, legal advice, financial advice, or any other
              form of professional advice. The tool does not create a client, advisor,
              fiduciary, or professional relationship of any kind between you and the
              creators or operators of this tool.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">Accuracy of Values</h3>
            <p>
              Fair market value (FMV) estimates displayed in this tool are sourced from
              publicly available charity valuation guides (such as those published by
              The Salvation Army and Goodwill Industries). These values are
              approximations only and <strong>are not IRS-determined, IRS-endorsed, or
              IRS-verified values</strong>. The actual fair market value of any item may
              differ significantly from the estimates shown. The IRS may disallow
              deductions based on values that do not accurately reflect fair market value
              as defined in IRS Publication 561.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">No Warranty</h3>
            <p>
              This tool is provided <strong>&ldquo;as is&rdquo; and &ldquo;as
              available&rdquo;</strong> without warranties of any kind, whether express,
              implied, statutory, or otherwise, including but not limited to warranties
              of merchantability, fitness for a particular purpose, accuracy,
              completeness, availability, security, compatibility, or non-infringement.
              The creators make no warranty that the tool will be error-free,
              uninterrupted, or free of harmful components.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by applicable law, in no event shall the
              creators, operators, contributors, or affiliates of Donation Itemizer be
              liable for any indirect, incidental, special, consequential, or punitive
              damages, or any loss of profits, revenue, data, or use, arising out of or
              in connection with your use of or inability to use this tool, even if
              advised of the possibility of such damages. This includes, without
              limitation, any damages arising from: (a) inaccurate FMV estimates; (b)
              IRS penalties, audits, or disallowed deductions; (c) reliance on
              information provided by this tool; (d) loss of data stored in your
              browser; or (e) any other matter relating to this tool.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">Your Responsibility</h3>
            <p>
              You are solely responsible for: (a) determining the accuracy and
              appropriateness of any values used on your tax return; (b) maintaining
              adequate records and documentation of your charitable contributions as
              required by the IRS; (c) obtaining written acknowledgments from donee
              organizations as required for donations exceeding $250; (d) obtaining
              qualified appraisals where required by law; and (e) consulting with a
              qualified tax professional regarding your specific tax situation.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">Indemnification</h3>
            <p>
              You agree to indemnify, defend, and hold harmless the creators, operators,
              and contributors of Donation Itemizer from and against any and all claims,
              damages, obligations, losses, liabilities, costs, and expenses (including
              reasonable attorneys&apos; fees) arising from: (a) your use of this tool;
              (b) your violation of any applicable tax law or regulation; or (c) any
              claim that your use of information from this tool caused damage to a third
              party.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">Data &amp; Privacy</h3>
            <p>
              All data you enter into this tool is stored locally in your web browser
              (localStorage) and is never transmitted to any server. The creators of this
              tool do not collect, store, process, or have access to any of your personal
              or financial information. You are responsible for the security of your own
              device and browser data. Clearing your browser data or using private
              browsing mode may result in permanent loss of your entered information.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">IRS Compliance</h3>
            <p>
              This tool references IRS publications, forms, and thresholds for
              informational purposes only. Tax laws and IRS guidelines change
              periodically. The tool may not reflect the most current IRS requirements.
              It is your responsibility to verify all IRS requirements, forms, and
              filing deadlines with the IRS directly or through a qualified tax
              professional.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-brand-800 mb-1">Changes to This Disclaimer</h3>
            <p>
              This disclaimer may be updated at any time without notice. Continued use
              of the tool after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="bg-brand-50 border border-brand-100 rounded-lg px-4 py-3 mt-4">
            <p className="text-xs text-brand-600">
              By using Donation Itemizer, you acknowledge that you have read, understood,
              and agree to be bound by this disclaimer. If you do not agree, do not use
              this tool.
            </p>
          </section>
        </div>

        {/* Close button at bottom */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </dialog>
  )
}
