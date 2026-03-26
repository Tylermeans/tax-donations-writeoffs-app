/**
 * Tests for derived state selectors.
 *
 * Key business rules under test:
 * - Poor-condition items are excluded from totals unless fmv_selected > $500 (IRC §170(f)(16))
 * - $250 threshold is per-event (not aggregate) — written acknowledgment requirement
 * - $500 threshold is aggregate grand total — triggers Form 8283 Section A
 * - $5,000 threshold is per-item (single item value) — triggers qualified appraisal requirement
 */
import { describe, it, expect } from 'vitest'
import type { DonationItem } from '../types'
import {
  isDeductible,
  selectGrandTotal,
  selectTotalsByCategory,
  selectEventThresholdFlags,
  selectAggregateThresholdFlags,
} from '../selectors'
import type { DonationStore } from '../index'

// ---------------------------------------------------------------------------
// Helpers to build test state
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<DonationItem> = {}): DonationItem {
  return {
    id: crypto.randomUUID(),
    catalogSlug: 'shirts-casual',
    name: 'Casual Shirt',
    category: 'clothing',
    quantity: 1,
    condition: 'good',
    fmv_low: 4,
    fmv_mid: 6,
    fmv_high: 9,
    fmv_selected: 6,
    ...overrides,
  }
}

function makeState(events: DonationStore['events']): DonationStore {
  return {
    schemaVersion: 1,
    taxYear: 2025,
    events,
    setTaxYear: () => {},
    addEvent: () => {},
    removeEvent: () => {},
    updateEvent: () => {},
    addItem: () => {},
    updateItem: () => {},
    removeItem: () => {},
    replaceAll: () => {},
  }
}

// ---------------------------------------------------------------------------
// isDeductible
// ---------------------------------------------------------------------------

describe('isDeductible', () => {
  it('returns true for good-condition items', () => {
    expect(isDeductible(makeItem({ condition: 'good', fmv_selected: 6 }))).toBe(true)
  })

  it('returns true for excellent-condition items', () => {
    expect(isDeductible(makeItem({ condition: 'excellent', fmv_selected: 20 }))).toBe(true)
  })

  it('returns false for poor-condition items at or below $500', () => {
    expect(isDeductible(makeItem({ condition: 'poor', fmv_selected: 8 }))).toBe(false)
    expect(isDeductible(makeItem({ condition: 'poor', fmv_selected: 500 }))).toBe(false)
  })

  it('returns true for poor-condition items above $500 (antique exception)', () => {
    expect(isDeductible(makeItem({ condition: 'poor', fmv_selected: 501 }))).toBe(true)
    expect(isDeductible(makeItem({ condition: 'poor', fmv_selected: 600 }))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// selectGrandTotal
// ---------------------------------------------------------------------------

describe('selectGrandTotal', () => {
  it('returns 0 when there are no events', () => {
    expect(selectGrandTotal(makeState([]))).toBe(0)
  })

  it('sums fmv_selected * quantity for all deductible items', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ fmv_selected: 10, quantity: 2 }), // 20
          makeItem({ fmv_selected: 30, quantity: 1 }), // 30
        ],
      },
    ])
    expect(selectGrandTotal(state)).toBe(50)
  })

  it('excludes poor-condition items at or below $500', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ fmv_selected: 10, quantity: 1, condition: 'good' }), // 10 — included
          makeItem({ fmv_selected: 8, quantity: 1, condition: 'poor' }), // excluded
        ],
      },
    ])
    expect(selectGrandTotal(state)).toBe(10)
  })

  it('includes poor-condition items above $500', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ fmv_selected: 10, quantity: 1, condition: 'good' }),   // 10
          makeItem({ fmv_selected: 600, quantity: 1, condition: 'poor' }),   // 600 — included
        ],
      },
    ])
    expect(selectGrandTotal(state)).toBe(610)
  })

  it('multiplies fmv_selected by quantity correctly', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 15, quantity: 4 })], // 60
      },
    ])
    expect(selectGrandTotal(state)).toBe(60)
  })
})

// ---------------------------------------------------------------------------
// selectTotalsByCategory
// ---------------------------------------------------------------------------

describe('selectTotalsByCategory', () => {
  it('groups deductible totals by category', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ category: 'clothing', fmv_selected: 10, quantity: 2 }), // 20
          makeItem({ category: 'furniture', fmv_selected: 50, quantity: 1 }), // 50
          makeItem({ category: 'clothing', fmv_selected: 5, quantity: 1 }), // 5
        ],
      },
    ])
    const result = selectTotalsByCategory(state)
    expect(result['clothing']).toBe(25)
    expect(result['furniture']).toBe(50)
  })

  it('excludes poor-condition items from category totals', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ category: 'clothing', fmv_selected: 10, quantity: 1, condition: 'good' }),
          makeItem({ category: 'clothing', fmv_selected: 8, quantity: 1, condition: 'poor' }),
        ],
      },
    ])
    const result = selectTotalsByCategory(state)
    expect(result['clothing']).toBe(10)
  })
})

// ---------------------------------------------------------------------------
// selectEventThresholdFlags — per-event $250 threshold (D-11)
// ---------------------------------------------------------------------------

describe('selectEventThresholdFlags', () => {
  it('does not flag events with total <= $250', () => {
    const state = makeState([
      {
        id: 'evt1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 180, quantity: 1 })],
      },
    ])
    const flags = selectEventThresholdFlags(state)
    expect(flags[0].requiresWrittenAcknowledgment).toBe(false)
    expect(flags[0].eventTotal).toBe(180)
  })

  it('flags events with total > $250', () => {
    const state = makeState([
      {
        id: 'evt1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 280, quantity: 1 })],
      },
    ])
    const flags = selectEventThresholdFlags(state)
    expect(flags[0].requiresWrittenAcknowledgment).toBe(true)
    expect(flags[0].eventTotal).toBe(280)
  })

  it('flags only the events that cross $250, not all events (per-event scope)', () => {
    // Three events: $180 / $280 / $200 — only the $280 event should be flagged
    const state = makeState([
      {
        id: 'evt1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 180, quantity: 1 })],
      },
      {
        id: 'evt2',
        date: '2025-02-01',
        organization: 'Salvation Army',
        items: [makeItem({ fmv_selected: 280, quantity: 1 })],
      },
      {
        id: 'evt3',
        date: '2025-03-01',
        organization: 'Thrift Store',
        items: [makeItem({ fmv_selected: 200, quantity: 1 })],
      },
    ])
    const flags = selectEventThresholdFlags(state)
    expect(flags).toHaveLength(3)
    expect(flags.find(f => f.eventId === 'evt1')?.requiresWrittenAcknowledgment).toBe(false)
    expect(flags.find(f => f.eventId === 'evt2')?.requiresWrittenAcknowledgment).toBe(true)
    expect(flags.find(f => f.eventId === 'evt3')?.requiresWrittenAcknowledgment).toBe(false)
  })

  it('returns eventId matching the event', () => {
    const state = makeState([
      {
        id: 'test-event-id',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [],
      },
    ])
    const flags = selectEventThresholdFlags(state)
    expect(flags[0].eventId).toBe('test-event-id')
  })
})

// ---------------------------------------------------------------------------
// selectAggregateThresholdFlags — $500 aggregate (D-12) and $5K per-item (D-13)
// ---------------------------------------------------------------------------

describe('selectAggregateThresholdFlags', () => {
  it('requiresForm8283SectionA is false when grand total <= $500', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 100, quantity: 1 })],
      },
    ])
    expect(selectAggregateThresholdFlags(state).requiresForm8283SectionA).toBe(false)
  })

  it('requiresForm8283SectionA is true when grand total > $500', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ fmv_selected: 330, quantity: 1 }),
          makeItem({ fmv_selected: 330, quantity: 1 }),
        ],
      },
    ])
    // Grand total is $660 > $500
    expect(selectAggregateThresholdFlags(state).requiresForm8283SectionA).toBe(true)
  })

  it('requiresQualifiedAppraisal is false when no single item exceeds $5,000', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 4999, quantity: 1, condition: 'good' })],
      },
    ])
    expect(selectAggregateThresholdFlags(state).requiresQualifiedAppraisal).toBe(false)
  })

  it('requiresQualifiedAppraisal is true when a single item exceeds $5,000', () => {
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [makeItem({ fmv_selected: 5500, quantity: 1, condition: 'excellent' })],
      },
    ])
    const flags = selectAggregateThresholdFlags(state)
    expect(flags.requiresQualifiedAppraisal).toBe(true)
    expect(flags.highValueItemName).toBe('Casual Shirt')
  })

  it('ignores poor-condition items under $500 when computing aggregate', () => {
    // Only deductible items contribute to the $500 aggregate check
    const state = makeState([
      {
        id: '1',
        date: '2025-01-01',
        organization: 'Goodwill',
        items: [
          makeItem({ fmv_selected: 300, quantity: 1, condition: 'good' }), // 300 — deductible
          makeItem({ fmv_selected: 400, quantity: 1, condition: 'poor' }), // excluded (poor ≤ 500)
        ],
      },
    ])
    // Grand total is $300 — does NOT exceed $500
    expect(selectAggregateThresholdFlags(state).requiresForm8283SectionA).toBe(false)
  })
})
