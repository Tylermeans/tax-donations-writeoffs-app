/**
 * App — root component that wires together the store, storage detection,
 * and the app shell.
 *
 * Responsibilities:
 * 1. Detect localStorage availability on mount and show a warning banner if unavailable
 * 2. Read events from the Zustand store to decide whether to show EmptyState
 * 3. Render AppShell as the visual container for all content
 *
 * Phase 2 will replace the placeholder "Donation events will appear here" div
 * with the real event list UI.
 */
import { useState, useEffect } from 'react'
import { AppShell } from './components/AppShell'
import { EmptyState } from './components/EmptyState'
import { StorageWarningBanner } from './components/StorageWarningBanner'
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

  // Read events from the store — when empty, show the getting-started guide
  const events = useDonationStore((state) => state.events)

  return (
    <>
      {/* Storage warning renders outside AppShell so it spans the full width */}
      {!storageAvailable && <StorageWarningBanner />}
      <AppShell>
        {events.length === 0 ? (
          <EmptyState />
        ) : (
          // Phase 2 will replace this placeholder with the real event list
          <div className="text-brand-700 text-center py-4">
            Donation events will appear here
          </div>
        )}
      </AppShell>
    </>
  )
}

export default App
