/**
 * Zustand store for the donation itemizer.
 *
 * Persists only the data layer (schemaVersion, taxYear, events) to localStorage.
 * UI state (modals open, current tab, etc.) is intentionally excluded from partialize.
 *
 * The `version: 1` field and `migrate` callback provide a schema migration path
 * when DonationItem fields change in future tax years — increment version and
 * transform old persisted data in the migrate function.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DonationEvent, DonationItem, PersistedState } from './types'
import { defaultTaxYear } from '../data/fmv'
import { PersistedStateSchema } from '../storage/schema'

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface DonationStore extends PersistedState {
  // Actions — all CRUD operations return void and mutate state immutably
  setTaxYear: (year: number) => void
  addEvent: (event: Omit<DonationEvent, 'id' | 'items'>) => void
  removeEvent: (eventId: string) => void
  updateEvent: (eventId: string, patch: Partial<Pick<DonationEvent, 'date' | 'organization'>>) => void
  addItem: (eventId: string, item: Omit<DonationItem, 'id'>) => void
  updateItem: (eventId: string, itemId: string, patch: Partial<DonationItem>) => void
  removeItem: (eventId: string, itemId: string) => void
  /**
   * Atomically replaces the entire data layer (taxYear + events) from an
   * imported backup. Called by ImportBackupButton after Zod validation passes.
   * schemaVersion is always reset to 1 (the only supported version in v1).
   */
  replaceAll: (state: Pick<PersistedState, 'taxYear' | 'events'>) => void
}

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

export const useDonationStore = create<DonationStore>()(
  persist(
    (set) => ({
      // Initial state — schemaVersion is a literal type constant (always 1 in v1)
      schemaVersion: 1 as const,
      taxYear: defaultTaxYear(),
      events: [],

      setTaxYear: (year) => set({ taxYear: year }),

      // addEvent: generates a UUID for the new event and initializes items to []
      addEvent: (eventData) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              id: crypto.randomUUID(),
              items: [],
              ...eventData,
            },
          ],
        })),

      // removeEvent: filters out the event with the given id
      removeEvent: (eventId) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== eventId),
        })),

      // updateEvent: shallow-merges patch (date, organization) into the matching event.
      // Used by EventHeader inline edit — avoids delete/re-add which would lose items.
      updateEvent: (eventId, patch) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id !== eventId ? event : { ...event, ...patch }
          ),
        })),

      // addItem: finds the target event by eventId and appends the new item
      addItem: (eventId, itemData) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id !== eventId
              ? event
              : {
                  ...event,
                  items: [
                    ...event.items,
                    {
                      id: crypto.randomUUID(),
                      ...itemData,
                    },
                  ],
                }
          ),
        })),

      // updateItem: shallow-merges patch into the matching item (spread preserves unchanged fields)
      updateItem: (eventId, itemId, patch) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id !== eventId
              ? event
              : {
                  ...event,
                  items: event.items.map((item) =>
                    item.id !== itemId ? item : { ...item, ...patch }
                  ),
                }
          ),
        })),

      // removeItem: filters the item out of the correct event's items array
      removeItem: (eventId, itemId) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id !== eventId
              ? event
              : {
                  ...event,
                  items: event.items.filter((item) => item.id !== itemId),
                }
          ),
        })),

      // replaceAll: atomically replaces the entire data layer from an imported backup.
      // schemaVersion is always forced to 1 (the only schema version in v1).
      replaceAll: (partial) =>
        set(() => ({
          taxYear: partial.taxYear,
          events: partial.events,
          schemaVersion: 1 as const,
        })),
    }),
    {
      name: 'donation-itemizer',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Persist only the data layer — never persist UI state (keeps localStorage lean)
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        taxYear: state.taxYear,
        events: state.events,
      }),
      // Zod-guarded migrate: validates the raw localStorage value before hydrating.
      // If the stored data fails validation (corrupt, stale schema version, or
      // edited by a third-party tool), we reset to a clean empty state instead
      // of crashing. The warning helps developers diagnose issues in DevTools.
      // When DonationItem fields change in a future version, increment `version`
      // above and add transformation logic here before the safeParse call.
      migrate: (persistedState) => {
        const result = PersistedStateSchema.safeParse(persistedState)
        if (!result.success) {
          console.warn(
            '[DonationStore] localStorage data failed validation, resetting to empty state.',
            result.error
          )
          return {
            schemaVersion: 1 as const,
            taxYear: defaultTaxYear(),
            events: [],
          } as unknown as DonationStore
        }
        return result.data as unknown as DonationStore
      },
    }
  )
)
