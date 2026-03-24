/**
 * App — root component assembling the full Phase 2 UI stack.
 *
 * Layout order (per UI-SPEC Main Content Stack):
 *   1. TotalsDashboard — aggregate FMV totals, category & date breakdowns
 *   2. ThresholdFlags  — IRS compliance warnings ($250 / $500 / $5,000)
 *   3. DonationEventList — event cards (or EmptyState when no events exist)
 *
 * TotalsDashboard and ThresholdFlags are suppressed until at least one
 * donation event exists so the empty state is uncluttered.
 *
 * StorageWarningBanner renders outside AppShell (at root level) so it spans
 * the full viewport width per the decision logged in STATE.md.
 */
import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { EmptyState } from './components/EmptyState'
import { StorageWarningBanner } from './components/StorageWarningBanner'
import { TotalsDashboard } from './components/TotalsDashboard'
import { ThresholdFlags } from './components/TotalsDashboard/ThresholdFlags'
import { DonationEventList } from './components/DonationEventList'
import { detectLocalStorage } from './storage/detect'
import { useDonationStore } from './store'

function App() {
  // localStorage availability — checked once on mount.
  // false means the app is running without persistence (private browsing, quota full, etc.)
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    // Run detection after mount so it always reflects the real browser state
    setStorageAvailable(detectLocalStorage())
  }, [])

  // Read events to decide whether to show the dashboard and event list or empty state
  const events = useDonationStore((state) => state.events)
  const hasEvents = events.length > 0

  return (
    <>
      {/* Storage warning renders outside AppShell so it spans the full width */}
      {!storageAvailable && <StorageWarningBanner />}
      <AppShell>
        <div className="space-y-6">
          {/* 1. TotalsDashboard — only when events exist */}
          {hasEvents && <TotalsDashboard />}

          {/* 2. ThresholdFlags — IRS warnings, conditional on thresholds being hit */}
          {hasEvents && <ThresholdFlags />}

          {/* 3. Event list OR empty state — never both */}
          {hasEvents ? <DonationEventList /> : <EmptyState />}
        </div>
      </AppShell>
    </>
  )
}

export default App
