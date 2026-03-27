/**
 * WelcomeGate — one-time intro + disclaimer acceptance screen.
 *
 * Blocks the app until the user clicks "I Understand". Acceptance is
 * persisted in localStorage so returning users skip straight to the app.
 *
 * Combines a friendly intro about what Donation Itemizer does with the
 * critical legal disclaimer that this is not tax advice.
 */
import { useState } from 'react'
import { FileDown, Search, ShieldCheck } from 'lucide-react'

const ACCEPTED_KEY = 'donation-itemizer-disclaimer-accepted'

/** Check if the user has already accepted (call outside React for SSR safety) */
export function hasAcceptedDisclaimer(): boolean {
  try {
    return localStorage.getItem(ACCEPTED_KEY) === 'true'
  } catch {
    // localStorage unavailable (private browsing) — show gate every time
    return false
  }
}

interface WelcomeGateProps {
  onAccept: () => void
}

export function WelcomeGate({ onAccept }: WelcomeGateProps) {
  const [checked, setChecked] = useState(false)

  function handleAccept() {
    try {
      localStorage.setItem(ACCEPTED_KEY, 'true')
    } catch {
      // Storage unavailable — acceptance won't persist but let them proceed
    }
    onAccept()
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full bg-white border border-brand-100 rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-brand-600 text-white px-6 py-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Donation Itemizer</h1>
          <p className="mt-2 text-brand-100 text-sm">
            Know what your donations are worth.
          </p>
        </div>

        {/* What it does */}
        <div className="px-6 py-6 space-y-5">
          <p className="text-sm text-brand-700 leading-relaxed">
            Donation Itemizer helps you track non-cash charitable donations and estimate
            their fair market value for tax deduction purposes. It's completely free,
            runs entirely in your browser, and no data ever leaves your device.
          </p>

          {/* Feature highlights */}
          <div className="grid gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-brand-50 rounded-lg p-2 shrink-0">
                <Search size={16} className="text-brand-500" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-800">Search &amp; itemize donations</p>
                <p className="text-xs text-brand-500">Browse hundreds of items with estimated values from charity guides</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-brand-50 rounded-lg p-2 shrink-0">
                <ShieldCheck size={16} className="text-brand-500" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-800">IRS threshold alerts</p>
                <p className="text-xs text-brand-500">Automatic flags when your donations cross key IRS filing thresholds</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-brand-50 rounded-lg p-2 shrink-0">
                <FileDown size={16} className="text-brand-500" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-medium text-brand-800">Export a PDF summary</p>
                <p className="text-xs text-brand-500">Download a formatted report ready to share with your tax preparer</p>
              </div>
            </div>
          </div>

          {/* Disclaimer box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Important:</strong> This is a free informational tool, not a tax
              preparation service. Values shown are estimates from published charity
              valuation guides — they are <strong>not IRS-determined or
              IRS-endorsed</strong>. This tool does not provide tax, legal, or financial
              advice. You are solely responsible for the accuracy of values claimed on
              your tax return. Always consult a qualified tax professional.
            </p>
          </div>

          {/* Checkbox + accept */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 cursor-pointer accent-brand-600"
              />
              <span className="text-sm text-brand-700 leading-relaxed">
                I understand that Donation Itemizer provides estimates only, is not tax
                advice, and that I am responsible for verifying all values with a
                qualified tax professional before claiming any deductions.
              </span>
            </label>

            <button
              type="button"
              disabled={!checked}
              onClick={handleAccept}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors"
            >
              I Understand — Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
