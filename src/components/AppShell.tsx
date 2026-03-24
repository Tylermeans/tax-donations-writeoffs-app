/**
 * AppShell — single-column layout wrapper for the entire application.
 *
 * Per D-06: single column, max-w-2xl to keep content readable at all widths.
 * Per D-08/D-09: "Donation Itemizer" h1 heading + "Know what your donations
 * are worth." tagline in the header.
 *
 * The LegalDisclaimer is rendered directly inside the shell (not passed as
 * a slot) because it's always visible and is part of the visual foundation
 * rather than page-specific content.
 *
 * Accessibility:
 * - <header> and <main> landmarks are present for screen reader navigation
 * - Heading hierarchy: h1 in header, children use h2+ for their headings
 * - Color contrast: brand-700 on warm-50 background meets WCAG AA 4.5:1
 */
import type { ReactNode } from 'react'
import { LegalDisclaimer } from './LegalDisclaimer'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-warm-50">
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

      {/* Legal disclaimer is always visible below the header — per D-16 */}
      <div className="px-4 md:px-6 lg:px-8">
        <LegalDisclaimer />
      </div>

      <main className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
