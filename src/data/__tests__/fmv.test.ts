import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  fmvData,
  resolveFMV,
  defaultTaxYear,
  getAllItems,
  getCategories,
} from '../fmv'

describe('resolveFMV', () => {
  it('returns a valid FMVRange with low <= mid <= high for a known good-condition item', () => {
    const range = resolveFMV('shirts-casual', 'good', 2025)
    expect(range).toHaveProperty('low')
    expect(range).toHaveProperty('mid')
    expect(range).toHaveProperty('high')
    expect(range.low).toBeLessThanOrEqual(range.mid)
    expect(range.mid).toBeLessThanOrEqual(range.high)
  })

  it('returns different ranges for different conditions (D-02: separate ranges, not multipliers)', () => {
    const poor = resolveFMV('shirts-casual', 'poor', 2025)
    const good = resolveFMV('shirts-casual', 'good', 2025)
    const excellent = resolveFMV('shirts-casual', 'excellent', 2025)
    // Each condition has a distinct range
    expect(good.mid).toBeGreaterThan(poor.mid)
    expect(excellent.mid).toBeGreaterThan(good.mid)
  })

  it('returns correct jeans ranges for all conditions', () => {
    const poor = resolveFMV('jeans', 'poor', 2025)
    const good = resolveFMV('jeans', 'good', 2025)
    const excellent = resolveFMV('jeans', 'excellent', 2025)
    expect(poor.low).toBeLessThanOrEqual(poor.high)
    expect(good.low).toBeLessThanOrEqual(good.high)
    expect(excellent.low).toBeLessThanOrEqual(excellent.high)
    // Condition ordering
    expect(good.mid).toBeGreaterThan(poor.mid)
    expect(excellent.mid).toBeGreaterThan(good.mid)
  })

  it('throws an error with "not found" message for an unknown item slug', () => {
    expect(() => resolveFMV('unknown-item', 'good', 2025)).toThrow(/not found/i)
  })

  it('throws an error with "No FMV data" message for an unsupported tax year', () => {
    expect(() => resolveFMV('shirts-casual', 'good', 2099)).toThrow(/No FMV data/i)
  })

  it('returns FMVRange for an electronics item (laptop)', () => {
    const range = resolveFMV('laptop', 'good', 2025)
    expect(range.low).toBeLessThanOrEqual(range.mid)
    expect(range.mid).toBeLessThanOrEqual(range.high)
  })

  it('returns FMVRange for a furniture item (sofa-couch)', () => {
    const range = resolveFMV('sofa-couch', 'good', 2025)
    expect(range.low).toBeLessThanOrEqual(range.mid)
    expect(range.mid).toBeLessThanOrEqual(range.high)
    // Sofa should be reasonably priced
    expect(range.mid).toBeGreaterThan(20)
  })
})

describe('fmvData[2025] category coverage', () => {
  const REQUIRED_CATEGORIES = [
    'clothing',
    'sporting-goods',
    'furniture',
    'electronics',
    'household',
    'books-media-toys',
    'instruments',
  ]

  it('has all 7 required category keys', () => {
    const categories = Object.keys(fmvData[2025].categories)
    for (const cat of REQUIRED_CATEGORIES) {
      expect(categories).toContain(cat)
    }
  })

  it('clothing category has at least 5 items', () => {
    const count = Object.keys(fmvData[2025].categories.clothing).length
    expect(count).toBeGreaterThanOrEqual(5)
  })

  it('sporting-goods category has at least 5 items', () => {
    const count = Object.keys(fmvData[2025].categories['sporting-goods']).length
    expect(count).toBeGreaterThanOrEqual(5)
  })

  it('electronics category has at least 5 items', () => {
    const count = Object.keys(fmvData[2025].categories.electronics).length
    expect(count).toBeGreaterThanOrEqual(5)
  })
})

describe('ItemFMV data integrity', () => {
  it('every item has a non-empty searchTerms array', () => {
    for (const [, categoryItems] of Object.entries(fmvData[2025].categories)) {
      for (const [slug, item] of Object.entries(categoryItems)) {
        expect(item.searchTerms, `${slug} missing searchTerms`).toBeDefined()
        expect(item.searchTerms.length, `${slug} has empty searchTerms`).toBeGreaterThan(0)
      }
    }
  })

  it('every item has source field containing "Salvation Army" or "Goodwill"', () => {
    for (const [, categoryItems] of Object.entries(fmvData[2025].categories)) {
      for (const [slug, item] of Object.entries(categoryItems)) {
        const hasValidSource =
          item.source.includes('Salvation Army') || item.source.includes('Goodwill')
        expect(hasValidSource, `${slug} source is "${item.source}"`).toBe(true)
      }
    }
  })

  it('every item has low <= mid <= high for all three conditions', () => {
    for (const [, categoryItems] of Object.entries(fmvData[2025].categories)) {
      for (const [slug, item] of Object.entries(categoryItems)) {
        for (const condition of ['poor', 'good', 'excellent'] as const) {
          const range = item[condition]
          expect(range.low, `${slug}.${condition}.low > mid`).toBeLessThanOrEqual(range.mid)
          expect(range.mid, `${slug}.${condition}.mid > high`).toBeLessThanOrEqual(range.high)
        }
      }
    }
  })

  it('electronics items all have irsNote field', () => {
    for (const [slug, item] of Object.entries(fmvData[2025].categories.electronics)) {
      expect(item.irsNote, `${slug} missing irsNote`).toBeDefined()
      expect(item.irsNote!.length, `${slug} has empty irsNote`).toBeGreaterThan(0)
    }
  })

  it('no item source field contains "IRS FMV" or "IRS value" (D-04)', () => {
    for (const [, categoryItems] of Object.entries(fmvData[2025].categories)) {
      for (const [slug, item] of Object.entries(categoryItems)) {
        expect(item.source, `${slug} has forbidden source text`).not.toMatch(/IRS FMV|IRS value/i)
      }
    }
  })
})

describe('getAllItems', () => {
  it('returns a flat array with length > 80 for 2025', () => {
    const items = getAllItems(2025)
    expect(items.length).toBeGreaterThan(80)
  })

  it('returns empty array for unsupported year', () => {
    const items = getAllItems(9999)
    expect(items).toEqual([])
  })

  it('each item in the result has a slug property', () => {
    const items = getAllItems(2025)
    for (const item of items) {
      expect(item.slug).toBeDefined()
      expect(item.slug.length).toBeGreaterThan(0)
    }
  })
})

describe('getCategories', () => {
  it('returns all 7 category slugs for 2025', () => {
    const cats = getCategories(2025)
    expect(cats.length).toBe(7)
  })

  it('returns empty array for unsupported year', () => {
    expect(getCategories(9999)).toEqual([])
  })
})

describe('defaultTaxYear', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns prior year when called during filing season (February)', () => {
    // Mock current date to Feb 15 of a known year
    vi.setSystemTime(new Date('2026-02-15'))
    expect(defaultTaxYear()).toBe(2025)
  })

  it('returns prior year on April 15 (last day of filing season)', () => {
    vi.setSystemTime(new Date('2026-04-15'))
    expect(defaultTaxYear()).toBe(2025)
  })

  it('returns current year on April 16 (filing season has ended)', () => {
    vi.setSystemTime(new Date('2026-04-16'))
    expect(defaultTaxYear()).toBe(2026)
  })

  it('returns current year in July (well after filing season)', () => {
    vi.setSystemTime(new Date('2026-07-04'))
    expect(defaultTaxYear()).toBe(2026)
  })

  it('returns prior year on January 1 (start of filing season)', () => {
    vi.setSystemTime(new Date('2026-01-01'))
    expect(defaultTaxYear()).toBe(2025)
  })
})
