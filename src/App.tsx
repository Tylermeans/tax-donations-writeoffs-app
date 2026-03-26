/**
 * App — root component assembling the full Phase 2+3 UI stack.
 *
 * Layout order (per UI-SPEC Main Content Stack):
 *   1. TotalsDashboard — aggregate FMV totals, category & date breakdowns
 *   2. ThresholdFlags  — IRS compliance warnings ($250 / $500 / $5,000)
 *   3. Export toolbar  — Export PDF (primary), Save Backup, Restore Backup
 *   4. DonationEventList — event cards (or EmptyState when no events exist)
 *
 * TotalsDashboard and ThresholdFlags are suppressed until at least one
 * donation event exists so the empty state is uncluttered.
 *
 * ImportBackupButton renders outside the hasEvents guard — users should
 * always be able to restore a backup, including when no data exists yet.
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
import { ExportButton } from './components/ExportButton/ExportButton'
import { ExportJSONButton } from './components/ExportJSONButton'
import { ImportBackupButton } from './components/ImportBackupButton'
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

          {/*
            3. Export toolbar — Phase 3 controls.
            - Export PDF and Save Backup shown only when events exist (no point exporting empty data)
            - ImportBackupButton always shown — users can restore even when no events are present
            - Responsive: stacks vertically on mobile, row layout on md+ with space-between
          */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            {/* Left: primary export actions (hidden when no data) */}
            <div className="flex flex-wrap items-center gap-2">
              {hasEvents && <ExportButton />}
              {hasEvents && <ExportJSONButton />}
            </div>

            {/* Right: restore — always available */}
            <div>
              <ImportBackupButton />
            </div>
          </div>

          {/* 4. Event list OR empty state — never both */}
          {hasEvents ? <DonationEventList /> : <EmptyState />}
        </div>
      </AppShell>
    </>
  )
}

export default App
