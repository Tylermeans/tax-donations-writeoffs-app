/**
 * Tests for the Zustand donation store CRUD actions.
 * Verifies that addEvent, addItem, updateItem, removeItem, and removeEvent
 * all correctly mutate the store state.
 *
 * localStorage: A global MockStorage is installed in src/test-setup.ts before
 * module imports so the persist middleware always finds a functional Storage object.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useDonationStore } from '../index'

// Reset to a clean initial state before each test so cases are isolated
beforeEach(() => {
  useDonationStore.setState({
    schemaVersion: 1,
    taxYear: new Date().getUTCFullYear(),
    events: [],
  })
})

describe('store initialization', () => {
  it('initializes with schemaVersion 1', () => {
    expect(useDonationStore.getState().schemaVersion).toBe(1)
  })

  it('initializes with empty events array', () => {
    expect(useDonationStore.getState().events).toEqual([])
  })

  it('initializes taxYear to current year', () => {
    const year = useDonationStore.getState().taxYear
    expect(year).toBe(new Date().getUTCFullYear())
  })
})

describe('addEvent', () => {
  it('creates an event with generated id', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-15', organization: 'Goodwill' })
    const { events } = useDonationStore.getState()
    expect(events).toHaveLength(1)
    expect(events[0].id).toBeTruthy()
    expect(typeof events[0].id).toBe('string')
  })

  it('sets the provided date and organization on the event', () => {
    useDonationStore.getState().addEvent({ date: '2025-03-20', organization: 'Salvation Army' })
    const event = useDonationStore.getState().events[0]
    expect(event.date).toBe('2025-03-20')
    expect(event.organization).toBe('Salvation Army')
  })

  it('initializes items as empty array', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'Goodwill' })
    expect(useDonationStore.getState().events[0].items).toEqual([])
  })

  it('generates unique ids for multiple events', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'A' })
    useDonationStore.getState().addEvent({ date: '2025-02-01', organization: 'B' })
    const { events } = useDonationStore.getState()
    expect(events[0].id).not.toBe(events[1].id)
  })
})

describe('removeEvent', () => {
  it('removes the event with the given id', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'Goodwill' })
    const eventId = useDonationStore.getState().events[0].id
    useDonationStore.getState().removeEvent(eventId)
    expect(useDonationStore.getState().events).toHaveLength(0)
  })

  it('only removes the targeted event when multiple exist', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'A' })
    useDonationStore.getState().addEvent({ date: '2025-02-01', organization: 'B' })
    const events = useDonationStore.getState().events
    useDonationStore.getState().removeEvent(events[0].id)
    const remaining = useDonationStore.getState().events
    expect(remaining).toHaveLength(1)
    expect(remaining[0].organization).toBe('B')
  })
})

describe('addItem', () => {
  it('adds item to the correct event', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'Goodwill' })
    const eventId = useDonationStore.getState().events[0].id

    useDonationStore.getState().addItem(eventId, {
      catalogSlug: 'shirts-casual',
      name: 'Casual Shirt',
      category: 'clothing',
      quantity: 3,
      condition: 'good',
      fmv_low: 4,
      fmv_mid: 6,
      fmv_high: 9,
      fmv_selected: 6,
    })

    const items = useDonationStore.getState().events[0].items
    expect(items).toHaveLength(1)
    expect(items[0].name).toBe('Casual Shirt')
  })

  it('generates a unique id for each item', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'Goodwill' })
    const eventId = useDonationStore.getState().events[0].id
    const baseItem = {
      catalogSlug: 'shirts-casual',
      name: 'Casual Shirt',
      category: 'clothing',
      quantity: 1,
      condition: 'good' as const,
      fmv_low: 4,
      fmv_mid: 6,
      fmv_high: 9,
      fmv_selected: 6,
    }
    useDonationStore.getState().addItem(eventId, baseItem)
    useDonationStore.getState().addItem(eventId, baseItem)
    const items = useDonationStore.getState().events[0].items
    expect(items[0].id).not.toBe(items[1].id)
  })

  it('does not affect other events', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'A' })
    useDonationStore.getState().addEvent({ date: '2025-02-01', organization: 'B' })
    const events = useDonationStore.getState().events

    useDonationStore.getState().addItem(events[0].id, {
      catalogSlug: 'shirts-casual',
      name: 'Casual Shirt',
      category: 'clothing',
      quantity: 1,
      condition: 'good',
      fmv_low: 4,
      fmv_mid: 6,
      fmv_high: 9,
      fmv_selected: 6,
    })

    expect(useDonationStore.getState().events[1].items).toHaveLength(0)
  })
})

describe('updateItem', () => {
  it('patches specific fields without overwriting others', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'Goodwill' })
    const eventId = useDonationStore.getState().events[0].id
    useDonationStore.getState().addItem(eventId, {
      catalogSlug: 'shirts-casual',
      name: 'Casual Shirt',
      category: 'clothing',
      quantity: 1,
      condition: 'good',
      fmv_low: 4,
      fmv_mid: 6,
      fmv_high: 9,
      fmv_selected: 6,
    })
    const itemId = useDonationStore.getState().events[0].items[0].id
    useDonationStore.getState().updateItem(eventId, itemId, { quantity: 5, condition: 'excellent' })
    const updated = useDonationStore.getState().events[0].items[0]
    expect(updated.quantity).toBe(5)
    expect(updated.condition).toBe('excellent')
    // Unchanged fields survive the patch
    expect(updated.name).toBe('Casual Shirt')
    expect(updated.fmv_selected).toBe(6)
  })
})

describe('removeItem', () => {
  it('removes the specific item from the correct event', () => {
    useDonationStore.getState().addEvent({ date: '2025-01-01', organization: 'Goodwill' })
    const eventId = useDonationStore.getState().events[0].id
    useDonationStore.getState().addItem(eventId, {
      catalogSlug: 'shirts-casual',
      name: 'Casual Shirt',
      category: 'clothing',
      quantity: 1,
      condition: 'good',
      fmv_low: 4,
      fmv_mid: 6,
      fmv_high: 9,
      fmv_selected: 6,
    })
    const itemId = useDonationStore.getState().events[0].items[0].id
    useDonationStore.getState().removeItem(eventId, itemId)
    expect(useDonationStore.getState().events[0].items).toHaveLength(0)
  })
})
