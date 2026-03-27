/**
 * App — root component with welcome gate + main UI stack.
 *
 * First-time users see a WelcomeGate with intro + disclaimer acceptance.
 * Acceptance is persisted in localStorage so returning users go straight
 * to the app. If localStorage is unavailable, the gate shows every session.
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
import { WelcomeGate, hasAcceptedDisclaimer } from './components/WelcomeGate'
import { detectLocalStorage } from './storage/detect'
import { useDonationStore } from './store'

function App() {
  const [accepted, setAccepted] = useState(hasAcceptedDisclaimer)
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    setStorageAvailable(detectLocalStorage())
  }, [])

  // Show welcome gate until user accepts
  if (!accepted) {
    return <WelcomeGate onAccept={() => setAccepted(true)} />
  }

  return <MainApp storageAvailable={storageAvailable} />
}

/** Main app content — separated so useDonationStore hook only mounts after acceptance */
function MainApp({ storageAvailable }: { storageAvailable: boolean }) {
  const events = useDonationStore((state) => state.events)
  const hasEvents = events.length > 0

  return (
    <>
      {!storageAvailable && <StorageWarningBanner />}
      <AppShell>
        <div className="space-y-6">
          {!hasEvents && <EmptyState />}
          <DonationEventList />

          {hasEvents && <TotalsDashboard />}
          {hasEvents && <ThresholdFlags />}

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
