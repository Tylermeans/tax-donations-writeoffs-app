/**
 * AppShell — single-column layout wrapper for the entire application.
 *
 * Includes header, legal disclaimer banner, main content area, and footer
 * with a link to the full legal disclaimer modal.
 */
import { useState, type ReactNode } from 'react'
import { LegalDisclaimer } from './LegalDisclaimer'
import { FullDisclaimer } from './FullDisclaimer'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(false)

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="bg-brand-600 text-white">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Donation Itemizer
          </h1>
          <p className="mt-1 text-brand-100 text-sm md:text-base">
            Know what your donations are worth.
          </p>
        </div>
      </header>

      {/* Legal disclaimer banner — always visible below header */}
      <div className="px-4 md:px-6 lg:px-8">
        <LegalDisclaimer />
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 flex-1 w-full">
        {children}
      </main>

      {/* Footer with disclaimer link */}
      <footer className="bg-brand-50 border-t border-brand-100 mt-auto">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex flex-col items-center gap-2 text-center">
          <p className="text-xs text-brand-500">
            Donation Itemizer is a free tool. No data leaves your browser.
          </p>
          <button
            type="button"
            onClick={() => setShowDisclaimer(true)}
            className="text-xs font-medium text-brand-600 hover:text-brand-800 underline cursor-pointer transition-colors"
          >
            Disclaimer &amp; Terms of Use
          </button>
          <p className="text-xs text-brand-400">
            &copy; {new Date().getFullYear()} — Not tax advice. Use at your own risk.
          </p>
        </div>
      </footer>

      {/* Full disclaimer modal */}
      <FullDisclaimer open={showDisclaimer} onClose={() => setShowDisclaimer(false)} />
    </div>
  )
}
