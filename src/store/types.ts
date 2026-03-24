/**
 * Shared TypeScript interfaces for the donation data model.
 * These are the canonical types used across the entire app.
 *
 * Condition is imported from fmv.ts (single source of truth — D-03) and
 * re-exported here so downstream code can import from one place.
 */
import type { Condition as ConditionType } from '../data/fmv'

// Re-export Condition so callers can import it from either location
export type { ConditionType as Condition }

export interface DonationItem {
  id: string
  catalogSlug: string
  name: string
  category: string
  quantity: number
  condition: ConditionType
  fmv_low: number
  fmv_mid: number
  fmv_high: number
  fmv_selected: number
  irsNote?: string
}

export interface DonationEvent {
  id: string
  date: string // ISO date string (YYYY-MM-DD)
  organization: string
  items: DonationItem[]
}

export interface PersistedState {
  schemaVersion: 1
  taxYear: number
  events: DonationEvent[]
}
