# Phase 1: Foundation - Research

**Researched:** 2026-03-23
**Domain:** Vite + React + TypeScript scaffold, FMV data module, Zustand store, localStorage detection, app shell
**Confidence:** HIGH — all findings drawn from prior verified research (STACK.md, ARCHITECTURE.md, PITFALLS.md) plus product spec

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Primary FMV source is the Salvation Army valuation guide
- **D-02:** Each condition (Poor/Good/Excellent) has its own separate low/mid/high range — not a multiplier on a base range
- **D-03:** All FMV data lives in a single TypeScript file (`src/data/fmv.ts`) — easy annual update, single-file diff
- **D-04:** FMV values clearly labeled as "charity guide estimates" — never "IRS FMV"
- **D-05:** Visual tone is warm & approachable — soft colors, rounded corners, friendly feel (not sterile tax-tool aesthetic)
- **D-06:** Single-column layout throughout — stacks naturally on mobile, scrolls on desktop
- **D-07:** Color palette is blues & greens — trust/finance vibes but warmer than typical tax tools
- **D-08:** App name: "Donation Itemizer"
- **D-09:** Tagline: "Know what your donations are worth."
- **D-10:** Poor-condition items are blocked + warned: excluded from deductible total with strikethrough and IRC §170(f)(16) warning, unless item exceeds $500 with qualified appraisal
- **D-11:** $250 per-event threshold: inline warning on each donation event that exceeds $250 — "Written acknowledgment required"
- **D-12:** $500 aggregate threshold: dedicated dashboard card that appears when total non-cash exceeds $500 — "Form 8283 Section A required"
- **D-13:** $5,000 per-item threshold: inline warning directly on the item card — "Qualified appraisal required for this item"
- **D-14:** No donor info fields collected in v1 — users fill in donor details manually on the PDF
- **D-15:** Data model should NOT include donor fields yet — keep it clean
- **D-16:** Persistent legal disclaimer visible in the app UI (not just PDF export)
- **D-17:** When localStorage is unavailable: show warning banner but allow full app usage
- **D-18:** Empty state shows a quick-start guide: step-by-step (1. Add a donation date, 2. Search for items, 3. Export your summary)

### Claude's Discretion
- FMV data file internal structure (how to organize categories, type definitions)
- Zustand store slice design and selector implementation
- Tailwind configuration and exact color values within the blues/greens warm palette
- Component file organization

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFR-01 | App defaults to current tax year (2025) with data model structured for future year updates | Year-keyed FMV data structure (`fmvData[2025]`); smart default logic in store initialization; pitfall 11 addresses Jan–Apr filing-season edge case |
| INFR-02 | App is responsive from 375px to 1440px (mobile-first) | Tailwind v4 mobile-first utilities; single-column layout decision (D-06); card-per-item layout at mobile breakpoint |
| INFR-03 | App meets WCAG AA accessibility standards (contrast, focus states, aria labels, keyboard navigation) | CLAUDE.md accessibility requirements; Pitfall 9 aria-label patterns; `<button>` never `<div onClick>` rule |
| INFR-04 | No account or authentication required — fully client-side | Pure static Vite build; no backend; no env vars; Zustand persist to localStorage |
| INFR-05 | FMV data sourced from Salvation Army/Goodwill valuation guides, clearly labeled as charity guide estimates (not "IRS FMV") | D-04 locked; Pitfall 2 labeling rules; `source` field in FMV data structure |
</phase_requirements>

---

## Summary

Phase 1 establishes the complete technical foundation for all subsequent UI work. It has four distinct deliverables: (1) the Vite + React + TypeScript + Tailwind v4 project scaffold with correct configuration; (2) the FMV data module — a hardcoded TypeScript file containing all item FMV ranges keyed by year, category, and item slug, with a `resolveFMV()` pure function; (3) the Zustand v5 store with typed state, CRUD actions, derived selectors for totals and threshold flags, and persist middleware wired to localStorage; and (4) the app shell — a basic layout with the app name, tagline, legal disclaimer, empty state, and localStorage availability detection.

The most critical design decision already locked is that each condition (Poor/Good/Excellent) maps to its own separate low/mid/high range rather than a multiplier applied to a single base range. This is the architecturally correct interpretation per the Salvation Army guide format (which publishes explicit low–high ranges), and it is what makes `resolveFMV(slug, condition, year)` a simple lookup rather than a computation. The data file will be the heaviest manual task in this phase — transcribing ~80 items across 7 categories with condition-specific ranges.

The second most important concern is threshold scoping. The $250 written acknowledgment rule is per `DonationEvent` (per date + organization), while the $500 Form 8283 trigger is aggregate across all events. These must be computed in separate selectors from day one, or every downstream UI feature will be built on incorrect logic. The Zustand selectors must model this distinction explicitly.

**Primary recommendation:** Build in the order: TypeScript interfaces → FMV data file → `resolveFMV()` → Zustand store + selectors → localStorage detection → app shell. Each layer depends on the one before it, and the types must be stable before the store or any component references them.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 8.0.1 | Build tool / dev server | Fastest HMR; static `dist/` output; official `react-ts` template includes SWC and TypeScript. Node 20.19+ required |
| React | 19.2.4 | UI layer | Current stable; concurrent features (useTransition) useful for live total updates |
| TypeScript | 5.x | Type safety | Data model interfaces catch FMV range arithmetic errors at compile time |
| Tailwind CSS | 4.2.2 | Styling | v4 Vite plugin replaces PostCSS; single `@import "tailwindcss"` in CSS; no content globs; JIT-only |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.12 | Global state + localStorage persist | All app state; persist middleware with `version` + `migrate` |
| lucide-react | 0.577.0 | SVG icons | All icons per CLAUDE.md (no emoji icons) |
| zod | 3.x | Schema validation | localStorage deserialization guard on hydration |

### Dev Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| `@vitejs/plugin-react-swc` | SWC React transform | 10-20x faster HMR; included in scaffold |
| `@tailwindcss/vite` | Tailwind v4 Vite integration | Required — do not use PostCSS with v4 |
| Vitest | Unit testing | Used for `resolveFMV()` and selector tests; zero config in Vite project |

### Installation
```bash
# Scaffold
npm create vite@latest donation-itemizer -- --template react-ts
cd donation-itemizer

# Tailwind v4
npm install tailwindcss @tailwindcss/vite

# State
npm install zustand

# Validation (localStorage guard)
npm install zod

# Icons
npm install lucide-react
```

**vite.config.ts:**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**src/index.css:**
```css
@import "tailwindcss";
```

**tsconfig.app.json additions:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   └── fmv.ts              # Single file: fmvData constant + resolveFMV() + types
├── store/
│   ├── index.ts             # Zustand store definition + persist config
│   ├── selectors.ts         # Derived state: totals, category breakdown, threshold flags
│   └── types.ts             # DonationEvent, DonationItem, Condition, PersistedState
├── storage/
│   └── detect.ts            # localStorage availability test (write/read/remove)
├── components/
│   ├── AppShell.tsx         # Single-column layout wrapper, disclaimer banner, storage warning
│   └── EmptyState.tsx       # Quick-start guide (3-step illustration)
└── App.tsx                  # Root: mounts AppShell, wires store, runs storage test
```

Note: `src/data/fmv.ts` is a single file per D-03. The folder structure with `fmv/index.ts` suggested in ARCHITECTURE.md was the pre-decision version. The locked decision says single file.

### Pattern 1: Condition as Direct Range Lookup (not multiplier)

**What:** Each item has three explicit `FMVRange` objects — one per condition — rather than a single base range with multipliers.

**When to use:** Always. This is locked (D-02).

**Why:** The Salvation Army guide publishes condition-graded ranges directly. Using multipliers would mean inventing numbers not in the source guide, which creates audit exposure (Pitfall 10). Direct ranges are also simpler — `resolveFMV(slug, condition, year)` is a single object lookup.

```typescript
// Source: D-02 locked decision + Pitfall 10 prevention
type FMVRange = {
  low: number;   // dollars
  mid: number;   // dollars — suggested default for user picker
  high: number;  // dollars
};

type ItemFMV = {
  label: string;         // display name: "Jeans"
  category: string;      // "clothing"
  searchTerms: string[]; // ["jeans", "denim", "pants"] — for type-ahead
  poor: FMVRange;        // direct range, not a multiplier
  good: FMVRange;
  excellent: FMVRange;
  irsNote?: string;      // category-level IRS note (electronics depreciation, etc.)
  source: string;        // "Salvation Army Valuation Guide 2025" — satisfies INFR-05, D-04
  lastVerified: string;  // ISO date — addresses Pitfall 3
};
```

### Pattern 2: resolveFMV() as Pure Function

**What:** A pure function that takes item slug, condition, and tax year and returns an `FMVRange`. No side effects, no store access.

**When to use:** Any time FMV values are needed — item add, condition change, range picker render.

```typescript
// Source: ARCHITECTURE.md Pattern 2
// Condition 'poor' returns the item's poor range directly — no multiplication
export function resolveFMV(
  slug: string,
  condition: Condition,
  taxYear: number
): FMVRange {
  const yearData = fmvData[taxYear];
  if (!yearData) throw new Error(`No FMV data for year ${taxYear}`);

  for (const category of Object.values(yearData.categories)) {
    if (slug in category) {
      return category[slug][condition];
    }
  }
  throw new Error(`Item slug not found: ${slug}`);
}
```

### Pattern 3: Dual-Level Threshold Selectors

**What:** Separate selectors for per-event $250 threshold vs. aggregate $500 and $5K thresholds. These are NOT the same computation.

**When to use:** Always — the scoping distinction is an IRS compliance requirement (Pitfall 1 is the most severe pitfall in the domain).

```typescript
// Source: PITFALLS.md Pitfall 1 — per-event $250 vs aggregate $500

// Per-event: flag each event that exceeds $250
export const selectEventThresholdFlags = (state: DonationStore) =>
  state.events.map(event => ({
    eventId: event.id,
    eventTotal: event.items
      .filter(item => item.condition !== 'poor' || item.fmv_selected > 500)
      .reduce((sum, item) => sum + item.fmv_selected * item.quantity, 0),
    requiresAcknowledgment: false, // computed below
  })).map(e => ({
    ...e,
    requiresAcknowledgment: e.eventTotal > 250,
  }));

// Aggregate: flag when total across all events exceeds $500
export const selectAggregateThresholdFlags = (state: DonationStore) => {
  const grandTotal = selectGrandTotal(state);
  return {
    requiresForm8283SectionA: grandTotal > 500,
    requiresAppraisal: state.events
      .flatMap(e => e.items)
      .some(item => item.fmv_selected > 5000),
  };
};
```

### Pattern 4: Poor-Condition Exclusion from Grand Total

**What:** Poor-condition items are excluded from all deductible totals unless `fmv_selected > 500`. They remain in the store and display with a strikethrough, but selectors skip them.

**When to use:** In `selectGrandTotal`, `selectTotalsByCategory`, and all threshold selectors.

```typescript
// Source: D-10, Pitfall 5 — IRC §170(f)(16) compliance
const isDeductible = (item: DonationItem): boolean =>
  item.condition !== 'poor' || item.fmv_selected > 500;

export const selectGrandTotal = (state: DonationStore) =>
  state.events
    .flatMap(e => e.items)
    .filter(isDeductible)
    .reduce((sum, item) => sum + item.fmv_selected * item.quantity, 0);
```

### Pattern 5: Zustand Persist with Schema Version

**What:** Zustand `persist` middleware wrapping only the data layer (`events`, `taxYear`). UI state is excluded. `version` field enables future migrations.

**When to use:** App initialization.

```typescript
// Source: STACK.md, ARCHITECTURE.md
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useDonationStore = create<DonationStore>()(
  persist(
    (set, get) => ({
      taxYear: defaultTaxYear(), // smart default: see Pitfall 11
      events: [],
      // ... actions
    }),
    {
      name: 'donation-itemizer',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, version) => {
        // Handle future schema migrations here
        return persistedState as DonationStore;
      },
      // Only persist data layer — never UI state
      partialize: (state) => ({
        taxYear: state.taxYear,
        events: state.events,
      }),
    }
  )
);
```

### Pattern 6: Smart Tax Year Default

**What:** Defaults to prior year during Jan 1–Apr 15 (filing season), current year otherwise.

**When to use:** Store initialization.

```typescript
// Source: PITFALLS.md Pitfall 11
function defaultTaxYear(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const day = now.getDate();
  const isFilingSeason = month < 4 || (month === 4 && day <= 15);
  return isFilingSeason ? now.getFullYear() - 1 : now.getFullYear();
}
```

### Pattern 7: localStorage Availability Detection

**What:** Write/read/remove test on mount. Shows persistent warning banner if unavailable. Never blocks app usage (D-17).

**When to use:** App mount (in App.tsx or AppShell.tsx).

```typescript
// Source: PITFALLS.md Pitfall 4 + D-17
export function detectLocalStorage(): boolean {
  try {
    const testKey = '__ls_test__';
    localStorage.setItem(testKey, '1');
    localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
```

### Anti-Patterns to Avoid

- **Multiplier-based FMV:** Locked decision D-02 requires separate ranges per condition. Never compute `baseRange * multiplier`.
- **Single threshold selector:** Never conflate the per-event $250 flag with the aggregate $500 flag in one computation. They are different IRS rules.
- **Persisting derived totals:** Never store `grandTotal`, `totalsByCategory`, or any threshold flag in localStorage. These are always recomputed from raw events.
- **Persisting UI state:** The `partialize` option in persist must exclude modal state, active tab, search strings, etc.
- **`<div onClick>` for controls:** All interactive controls must be `<button>` elements (WCAG AA, Pitfall 9, CLAUDE.md).
- **"IRS FMV" label:** Any FMV value display must be labeled as "charity guide estimate" — never "IRS value" or "IRS FMV" (D-04, Pitfall 2).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage persistence + migrations | Custom `useLocalStorage` hook | Zustand `persist` middleware | Handles schema `version`, `migrate` callback, `QuotaExceededError`, serialization safety |
| Schema validation on hydration | Manual type guards | `zod.safeParse()` | Catches stale/malformed persisted data from previous schema versions with full type inference |
| TypeScript interfaces for store state | Inferred or inline types | `src/store/types.ts` dedicated file | Shared across store, selectors, PDF pipeline, and future UI components — must be a single source of truth |
| Annual FMV updates | Database, CMS, or API | Year-keyed object in `fmv.ts` | Single file diff per year; no migration; no network; type-safe |

**Key insight:** The FMV data module is the "database" for this app. It must be structured for a single-file annual update (`fmvData[2025]` → add `fmvData[2026]`) without any schema migration or store changes.

---

## Common Pitfalls

### Pitfall 1: Conflating Per-Event $250 with Aggregate $500 Threshold
**What goes wrong:** Computing both threshold flags from `selectGrandTotal` — the $250 acknowledgment fires on the wrong events, and the $500 Form 8283 card appears too early or too late.
**Why it happens:** Developers model a single running total. The per-organization, per-date scoping of the $250 rule is easy to miss.
**How to avoid:** Two separate selectors: `selectEventThresholdFlags` (maps over events, flags each event > $250) and `selectAggregateThresholdFlags` (grand total > $500, any item > $5,000).
**Warning signs:** Test: three events at $180/$280/$200 (total $660) — only event 2 should show the $250 flag; Form 8283 card should appear because aggregate > $500.

### Pitfall 2: FMV Labeled as IRS-Authoritative
**What goes wrong:** Any use of "IRS FMV," "IRS-approved value," or "IRS value" in UI copy, tooltips, or placeholders.
**Why it happens:** The Salvation Army guide is sometimes described as "IRS-recognized" by third-party aggregators.
**How to avoid:** All FMV displays use "estimated thrift-store range (Salvation Army Valuation Guide 2025)." Add `source` field to every `ItemFMV` entry. Legal disclaimer visible near the total panel (D-16).
**Warning signs:** Grep for "IRS" adjacent to any dollar value in the codebase.

### Pitfall 3: Poor-Condition Items Silently Included in Total
**What goes wrong:** A $8 "Poor" shirt is included in the deductible total. IRC §170(f)(16) makes this an automatic disallowance.
**How to avoid:** `isDeductible()` helper filters poor-condition items under $500 from all selectors. Poor items display with strikethrough styling and §170(f)(16) warning inline (D-10).
**Warning signs:** Add one Poor-condition item at $8 FMV — grand total should not include it.

### Pitfall 4: localStorage Failure Without Warning
**What goes wrong:** Safari Private tab silently fails all localStorage writes. User enters 40 items, closes tab, loses everything.
**How to avoid:** `detectLocalStorage()` on mount — if it fails, show a persistent `StorageWarningBanner` component. Never block app usage (D-17).
**Warning signs:** Open in Safari Private, verify banner appears before any items are added.

### Pitfall 5: Wrong Tax Year Default During Filing Season
**What goes wrong:** User filing 2025 taxes in February 2026 sees "2026" as the default tax year.
**How to avoid:** `defaultTaxYear()` returns `currentYear - 1` if between Jan 1 and Apr 15.
**Warning signs:** Run app in January or February — verify default shows 2025, not 2026.

### Pitfall 6: FMV Data Missing Source Annotation
**What goes wrong:** Future maintainer can't tell which guide version was used for the 2025 values, so they can't diff against a 2026 update.
**How to avoid:** Each year entry in `fmvData` includes `source: "Salvation Army Valuation Guide 2025"` and `lastVerified: "2026-03-23"`. Document the source URL in a code comment at the top of `fmv.ts`.

---

## Code Examples

Verified patterns from official sources and locked decisions:

### FMV Data File Structure (`src/data/fmv.ts`)
```typescript
// Source: D-02 (separate ranges per condition), D-03 (single file), D-04 (source label)
// Update path: add a new year key at the top level. No store migration needed.
// Source URL: https://www.salvationarmyusa.org/usn/ways-to-give/give-stuff/valuation-guide/
// Last verified against: Salvation Army Valuation Guide, accessed 2026-03-23

export type Condition = 'poor' | 'good' | 'excellent';

export type FMVRange = {
  low: number;
  mid: number;  // suggested default for range picker
  high: number;
};

export type ItemFMV = {
  label: string;
  category: string;
  searchTerms: string[];
  poor: FMVRange;
  good: FMVRange;
  excellent: FMVRange;
  irsNote?: string;
  source: string;
  lastVerified: string; // ISO date
};

type CategoryFMV = Record<string, ItemFMV>;

export type YearFMV = {
  year: number;
  source: string;
  lastVerified: string;
  categories: Record<string, CategoryFMV>;
};

export const fmvData: Record<number, YearFMV> = {
  2025: {
    year: 2025,
    source: 'Salvation Army Valuation Guide 2025',
    lastVerified: '2026-03-23',
    categories: {
      clothing: {
        'shirts-casual': {
          label: 'Shirts (casual)',
          category: 'clothing',
          searchTerms: ['shirt', 'casual shirt', 't-shirt', 'tshirt', 'tee'],
          poor:      { low: 1,  mid: 2,  high: 4  },
          good:      { low: 4,  mid: 6,  high: 9  },
          excellent: { low: 9,  mid: 11, high: 14 },
          source: 'Salvation Army Valuation Guide 2025',
          lastVerified: '2026-03-23',
        },
        // ... remaining clothing items
      },
      // ... remaining categories
    },
  },
  // 2026: { ... } — add when Salvation Army publishes updated guide
};

export function resolveFMV(
  slug: string,
  condition: Condition,
  taxYear: number
): FMVRange {
  const yearData = fmvData[taxYear];
  if (!yearData) {
    throw new Error(`No FMV data for tax year ${taxYear}. Check fmv.ts.`);
  }
  for (const category of Object.values(yearData.categories)) {
    if (slug in category) {
      return category[slug][condition];
    }
  }
  throw new Error(`Item slug "${slug}" not found in FMV data for ${taxYear}.`);
}
```

### TypeScript Interfaces (`src/store/types.ts`)
```typescript
// Source: donation-itemizer-spec.md data model + D-14 (no donor fields in v1)
// PDF pipeline will consume DonationEvent and DonationItem directly in Phase 3

export type Condition = 'poor' | 'good' | 'excellent';

export interface DonationItem {
  id: string;            // uuid (crypto.randomUUID())
  catalogSlug: string;   // foreign key into fmvData
  name: string;          // display name
  category: string;
  quantity: number;
  condition: Condition;
  fmv_low: number;       // stored at add time from resolveFMV()
  fmv_mid: number;
  fmv_high: number;
  fmv_selected: number;  // user's chosen value within range; defaults to mid
  irsNote?: string;      // passed through from ItemFMV.irsNote if present
}

export interface DonationEvent {
  id: string;
  date: string;          // ISO 8601: "2025-03-15"
  organization: string;
  items: DonationItem[];
}

// PersistedState is what zustand persist writes to localStorage
// schemaVersion must be bumped when DonationItem or DonationEvent shape changes
export interface PersistedState {
  schemaVersion: 1;
  taxYear: number;
  events: DonationEvent[];
}
```

### Zustand Store (`src/store/index.ts`)
```typescript
// Source: ARCHITECTURE.md state management pattern, STACK.md zustand persist
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DonationEvent, DonationItem, PersistedState } from './types'

// Only data layer is persisted — UI state lives outside this store
interface DonationStore extends PersistedState {
  // Actions
  setTaxYear: (year: number) => void;
  addEvent: (event: Omit<DonationEvent, 'id' | 'items'>) => void;
  removeEvent: (eventId: string) => void;
  addItem: (eventId: string, item: Omit<DonationItem, 'id'>) => void;
  updateItem: (eventId: string, itemId: string, patch: Partial<DonationItem>) => void;
  removeItem: (eventId: string, itemId: string) => void;
}

function defaultTaxYear(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return (month < 4 || (month === 4 && day <= 15))
    ? now.getFullYear() - 1
    : now.getFullYear();
}

export const useDonationStore = create<DonationStore>()(
  persist(
    (set) => ({
      schemaVersion: 1,
      taxYear: defaultTaxYear(),
      events: [],

      setTaxYear: (year) => set({ taxYear: year }),

      addEvent: (eventData) => set((state) => ({
        events: [...state.events, {
          ...eventData,
          id: crypto.randomUUID(),
          items: [],
        }],
      })),

      removeEvent: (eventId) => set((state) => ({
        events: state.events.filter(e => e.id !== eventId),
      })),

      addItem: (eventId, itemData) => set((state) => ({
        events: state.events.map(event =>
          event.id === eventId
            ? { ...event, items: [...event.items, { ...itemData, id: crypto.randomUUID() }] }
            : event
        ),
      })),

      updateItem: (eventId, itemId, patch) => set((state) => ({
        events: state.events.map(event =>
          event.id === eventId
            ? {
                ...event,
                items: event.items.map(item =>
                  item.id === itemId ? { ...item, ...patch } : item
                ),
              }
            : event
        ),
      })),

      removeItem: (eventId, itemId) => set((state) => ({
        events: state.events.map(event =>
          event.id === eventId
            ? { ...event, items: event.items.filter(i => i.id !== itemId) }
            : event
        ),
      })),
    }),
    {
      name: 'donation-itemizer',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Only persist data layer — taxYear and events; not UI state
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        taxYear: state.taxYear,
        events: state.events,
      }),
      migrate: (persistedState, _version) => {
        // Version 1 → 2 migration goes here when schema changes
        return persistedState as DonationStore;
      },
    }
  )
);
```

### Selectors (`src/store/selectors.ts`)
```typescript
// Source: ARCHITECTURE.md selector pattern, PITFALLS.md Pitfall 1 (threshold scoping)
import type { DonationStore, DonationItem } from './types'

// Poor-condition items under $500 are non-deductible per IRC §170(f)(16)
const isDeductible = (item: DonationItem): boolean =>
  item.condition !== 'poor' || item.fmv_selected > 500;

export const selectGrandTotal = (state: DonationStore): number =>
  state.events
    .flatMap(e => e.items)
    .filter(isDeductible)
    .reduce((sum, item) => sum + item.fmv_selected * item.quantity, 0);

export const selectTotalsByCategory = (state: DonationStore): Record<string, number> =>
  state.events
    .flatMap(e => e.items)
    .filter(isDeductible)
    .reduce((acc, item) => ({
      ...acc,
      [item.category]: (acc[item.category] ?? 0) + item.fmv_selected * item.quantity,
    }), {} as Record<string, number>);

// Per-event $250 threshold (written acknowledgment requirement)
// Scoped to each DonationEvent independently — NOT the grand total
export const selectEventThresholdFlags = (state: DonationStore) =>
  state.events.map(event => {
    const eventDeductibleTotal = event.items
      .filter(isDeductible)
      .reduce((sum, item) => sum + item.fmv_selected * item.quantity, 0);
    return {
      eventId: event.id,
      eventTotal: eventDeductibleTotal,
      requiresWrittenAcknowledgment: eventDeductibleTotal > 250,
    };
  });

// Aggregate thresholds — Form 8283 Section A ($500) and Section B ($5,000 per item)
export const selectAggregateThresholdFlags = (state: DonationStore) => {
  const grandTotal = selectGrandTotal(state);
  const highValueItem = state.events
    .flatMap(e => e.items)
    .find(item => item.fmv_selected > 5000);
  return {
    requiresForm8283SectionA: grandTotal > 500,
    requiresQualifiedAppraisal: highValueItem !== undefined,
    highValueItemName: highValueItem?.name,
  };
};
```

### localStorage Detection (`src/storage/detect.ts`)
```typescript
// Source: PITFALLS.md Pitfall 4, D-17 (warn but never block)
export function detectLocalStorage(): boolean {
  try {
    const key = '__donation_itemizer_ls_test__';
    localStorage.setItem(key, '1');
    const val = localStorage.getItem(key);
    localStorage.removeItem(key);
    return val === '1';
  } catch {
    // QuotaExceededError, SecurityError (Private mode Safari), or other
    return false;
  }
}
```

### App Shell Structure (`src/App.tsx`)
```typescript
// Source: D-05 through D-09, D-16, D-17, D-18
// Single-column layout, warm blues/greens, persistent disclaimer, storage check

import { useEffect, useState } from 'react'
import { detectLocalStorage } from './storage/detect'

export function App() {
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Run storage test on mount — before any data operations
  useEffect(() => {
    setStorageAvailable(detectLocalStorage());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Storage warning — shown in private mode or when storage is blocked */}
      {!storageAvailable && (
        <div role="alert" className="...">
          Data won't be saved in this session. Private browsing mode detected.
        </div>
      )}

      {/* App header */}
      <header className="...">
        <h1>Donation Itemizer</h1>
        <p>Know what your donations are worth.</p>
      </header>

      {/* Persistent legal disclaimer — near totals, not fine print (D-16) */}
      <aside role="note" className="...">
        These estimates are based on Salvation Army and Goodwill valuation guides.
        FMV is determined by the IRS based on actual market conditions.
        Consult a tax professional for final deduction values.
      </aside>

      {/* Main content — empty state or donation log */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* EmptyState or DonationEventList rendered here in Phase 2 */}
      </main>
    </div>
  );
}
```

---

## FMV Item Catalog Scope

The item seed list from `donation-itemizer-spec.md` defines the full catalog to implement in `fmv.ts`:

| Category | Items | Notes |
|----------|-------|-------|
| Clothing | ~27 items | Shirts, pants, outerwear, shoes, accessories |
| Sporting Goods | ~20 items | Skis, bikes, golf, weights, camping |
| Furniture | ~15 items | Sofas, tables, chairs, beds, storage |
| Electronics | ~11 items | IRS requires depreciated value; add `irsNote` |
| Household | ~9 items | Dishes, cookware, linens, decor |
| Books / Media / Toys | ~6 items | Books, DVDs, games, toys |
| Instruments | 1 item (umbrella) | Guitar, keyboard noted as examples |

Total: ~89 items. All require three condition ranges (Poor/Good/Excellent = 3 FMVRange objects each). Values must be transcribed from the Salvation Army Valuation Guide — this is manual data entry work. Electronics must include an `irsNote` about depreciated value (ITEM-06 surfaces this in Phase 2 UI).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 + PostCSS + content globs | Tailwind v4 + `@tailwindcss/vite` plugin, single CSS import | v4 released Jan 2025 | No `tailwind.config.js` needed; no purge config; JIT-only |
| Zustand v4 with `useSyncExternalStore` issues under React 19 Strict Mode | Zustand v5 with native React 19 support | v5 released Oct 2024 | Required for React 19; use `zustand@5.0.12` |
| CRA (`create-react-app`) | Vite with SWC plugin | CRA unmaintained since 2023 | Never use CRA |
| FMV values as base range + multiplier | FMV as explicit per-condition ranges | D-02 locked | Simpler code, values match source guide exactly |

---

## Open Questions

1. **Salvation Army 2025 guide values — exact numbers**
   - What we know: The guide exists and covers all item categories needed
   - What's unclear: Exact low/mid/high values per item per condition require manual transcription from the guide PDF; these are data-entry gaps, not architecture gaps
   - Recommendation: Scaffold `fmv.ts` with types and a representative subset of items (5–10 items across 3 categories) to unblock Phase 2 UI development. Fill in remaining ~79 items as a parallel task or in a follow-on wave.

2. **Tailwind v4 color palette for warm blues/greens**
   - What we know: D-07 specifies blues & greens, warmer than typical tax tools; exact hex values are at Claude's discretion
   - What's unclear: v4 uses CSS variables with `@theme` — color tokens are defined in CSS, not in a JS config file
   - Recommendation: Define custom theme tokens in `src/index.css` using Tailwind v4 `@theme` block: `--color-brand-500: oklch(...)` etc. This is a discretionary decision resolved during implementation.

3. **`crypto.randomUUID()` browser support**
   - What we know: Supported in all modern browsers including Safari 15.4+; available in secure contexts (HTTPS + localhost)
   - What's unclear: Whether dev environment is always served over HTTPS or localhost
   - Recommendation: Use `crypto.randomUUID()` — Vite dev server uses localhost which is a secure context. If a polyfill is ever needed, a simple timestamp + random string is sufficient for this use case.

---

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` — Technology versions verified against npm as of 2026-03-23
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, data model, state management patterns
- `.planning/research/PITFALLS.md` — IRS sources (Pub 526, Pub 561, Form 8283 instructions, IRC §170, §6662) — all HIGH confidence
- `donation-itemizer-spec.md` — Product spec, item category seed list, data model interfaces
- `.planning/phases/01-foundation/01-CONTEXT.md` — All locked decisions (D-01 through D-18)

### Secondary (MEDIUM confidence)
- CLAUDE.md project instructions — accessibility, icon, and mobile-first requirements
- REQUIREMENTS.md — INFR-01 through INFR-05 requirement definitions

### Tertiary (LOW confidence — none)
No claims made on LOW confidence sources in this phase. All findings trace to verified project documents or prior HIGH-confidence research.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm in prior research (2026-03-23)
- Architecture: HIGH — patterns drawn from ARCHITECTURE.md and locked decisions
- Pitfalls: HIGH — IRS sources are authoritative; threshold scoping verified against Pub 526 and Form 8283 instructions
- FMV data values: MEDIUM — exact dollar ranges require manual transcription from Salvation Army guide; structure is HIGH confidence, values are data-entry work

**Research date:** 2026-03-23
**Valid until:** 2026-09-23 (stack stable; IRS thresholds checked annually against Pub 526 updates)
