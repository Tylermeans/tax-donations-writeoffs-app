/**
 * App — root component assembling the full UI stack.
 *
 * Layout order (flipped per user request — events first, totals at bottom):
 *   1. EmptyState (when no events) + DonationEventList (always — has Add CTA)
 *   2. TotalsDashboard — aggregate FMV totals, category & date breakdowns
 *   3. ThresholdFlags — IRS compliance warnings ($250 / $500 / $5,000)
 *   4. Export toolbar — Export PDF, Save Backup, Restore Backup
 *
 * This puts the primary action (adding donations) at the top where users
 * land, and the summary/export controls at the bottom after they've entered data.
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
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    setStorageAvailable(detectLocalStorage())
  }, [])

  const events = useDonationStore((state) => state.events)
  const hasEvents = events.length > 0

  return (
    <>
      {!storageAvailable && <StorageWarningBanner />}
      <AppShell>
        <div className="space-y-6">
          {/* 1. Empty state guide (when no events) + donation event list */}
          {!hasEvents && <EmptyState />}
          <DonationEventList />

          {/* 2. Totals dashboard — only when events exist */}
          {hasEvents && <TotalsDashboard />}

          {/* 3. IRS threshold flags — only when events exist */}
          {hasEvents && <ThresholdFlags />}

          {/* 4. Export toolbar — at the bottom after all content */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {hasEvents && <ExportButton />}
              {hasEvents && <ExportJSONButton />}
            </div>
            <div>
              <ImportBackupButton />
            </div>
          </div>
        </div>
      </AppShell>
    </>
  )
}

export default App
