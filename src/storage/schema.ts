/**
 * Zod v4 schema that mirrors PersistedState exactly.
 *
 * Why this exists: Zustand's persist middleware reads raw localStorage JSON on
 * hydration. Without validation, corrupt or stale data (from a previous schema
 * version or a third-party tool writing to the same key) can crash the app at
 * runtime. safeParse() lets us fail gracefully — log a warning and reset to a
 * known-good empty state instead of throwing.
 *
 * Schema version: zod@^4.3.6 is installed (v4, not v3). Import from 'zod' — it
 * resolves to v4 in this project. The v4 API is identical to v3 for the primitives
 * used here (z.object, z.string, z.number, z.enum, z.literal, z.array, z.infer).
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Primitive schemas
// ---------------------------------------------------------------------------

/**
 * Mirrors: export type Condition = 'poor' | 'good' | 'excellent' from src/data/fmv.ts
 * Using z.enum() so the literal union is validated at runtime.
 */
export const ConditionSchema = z.enum(['poor', 'good', 'excellent'])

// ---------------------------------------------------------------------------
// DonationItem schema
// ---------------------------------------------------------------------------

/**
 * Mirrors: DonationItem interface from src/store/types.ts.
 * Field constraints enforce data integrity — e.g. quantity must be a positive
 * integer (can't have half an item), FMV fields must be non-negative numbers.
 */
export const DonationItemSchema = z.object({
  id: z.string(),
  catalogSlug: z.string(),
  name: z.string(),
  category: z.string(),
  // Positive integer — users enter whole item counts, never decimals
  quantity: z.number().int().positive(),
  condition: ConditionSchema,
  // FMV dollar amounts — must be zero or positive, never negative
  fmv_low: z.number().nonnegative(),
  fmv_mid: z.number().nonnegative(),
  fmv_high: z.number().nonnegative(),
  fmv_selected: z.number().nonnegative(),
  // irsNote is not present on all items (e.g. items without §170 notes)
  irsNote: z.string().optional(),
})

// ---------------------------------------------------------------------------
// DonationEvent schema
// ---------------------------------------------------------------------------

/**
 * Mirrors: DonationEvent interface from src/store/types.ts.
 * The date regex enforces YYYY-MM-DD format — ISO date strings without time zone,
 * which is how the app stores dates internally to avoid timezone off-by-one issues.
 */
export const DonationEventSchema = z.object({
  id: z.string(),
  // Enforces YYYY-MM-DD — rejects ISO timestamps or other date formats
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  organization: z.string(),
  items: z.array(DonationItemSchema),
})

// ---------------------------------------------------------------------------
// PersistedState schema (top-level)
// ---------------------------------------------------------------------------

/**
 * Mirrors: PersistedState interface from src/store/types.ts.
 *
 * schemaVersion: z.literal(1) — must be exactly the number 1.
 *   Using literal (not z.number) catches old data from a different schema version
 *   or malformed data where the version field is missing or mistyped.
 *
 * taxYear: clamped to a reasonable range (2020–2035) to guard against garbage data.
 *   Floor of 2020 matches the earliest year this app would plausibly be used.
 *   Ceiling of 2035 is far enough to not be a practical limit during v1 lifetime.
 *
 * events: array of DonationEvent — zero events is valid (empty state).
 */
export const PersistedStateSchema = z.object({
  schemaVersion: z.literal(1),
  taxYear: z.number().int().min(2020).max(2035),
  events: z.array(DonationEventSchema),
})

// ---------------------------------------------------------------------------
// Exported type
// ---------------------------------------------------------------------------

/**
 * TypeScript type inferred from the Zod schema — stays in sync with schema
 * automatically when fields are added or constrained.
 * Callers that receive a validated parse result can use this type instead of
 * the broader PersistedState interface.
 */
export type ValidatedPersistedState = z.infer<typeof PersistedStateSchema>
