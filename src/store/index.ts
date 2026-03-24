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
      // Placeholder migrate for future schema changes.
      // When DonationItem fields change, increment `version` above and transform
      // old persisted state here before it reaches the application.
      migrate: (persistedState) => persistedState as DonationStore,
    }
  )
)
