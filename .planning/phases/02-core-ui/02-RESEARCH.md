# Phase 2: Core UI - Research

**Researched:** 2026-03-24
**Domain:** React interactive UI — item catalog search, FMV range picker, condition toggle, donation event management, running total dashboard, IRS compliance flags
**Confidence:** HIGH — all findings drawn from Phase 1 codebase (ground truth) and prior verified research documents

---

<user_constraints>
## User Constraints (from Phase 1 CONTEXT.md — carries forward)

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
- **D-14:** No donor info fields collected in v1
- **D-15:** Data model does NOT include donor fields yet
- **D-16:** Persistent legal disclaimer visible in the app UI
- **D-17:** When localStorage is unavailable: show warning banner but allow full app usage
- **D-18:** Empty state shows a quick-start guide: step-by-step illustration (1. Add a donation date, 2. Search for items, 3. Export your summary)

### Claude's Discretion
- FMV data file internal structure (how to organize categories, type definitions) — already established in Phase 1
- Zustand store slice design and selector implementation — already established in Phase 1
- Tailwind configuration and exact color values within the blues/greens warm palette — already established in Phase 1
- Component file organization

### Deferred Ideas (OUT OF SCOPE)
- None identified in Phase 1 CONTEXT.md
- AI-powered FMV lookup (AIFM-01, AIFM-02) — v2, not this phase
- Shareable URL (SHAR-01, SHAR-02) — v2
- Advanced compliance (COMP-01, COMP-02) — v2

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ITEM-01 | User can search items by name with type-ahead autocomplete across all categories | `getAllItems()` returns flat array with `searchTerms[]`; filter client-side with string includes |
| ITEM-02 | User can browse items by category when not searching | `getCategories()` returns category slugs; iterate `fmvData[year].categories[slug]` for items |
| ITEM-03 | User sees FMV low/mid/high range for each item based on condition | `resolveFMV(slug, condition, taxYear)` returns `FMVRange { low, mid, high }` |
| ITEM-04 | User can adjust FMV within the range via slider/picker, with average suggested as default | `FMVRange.mid` is the defined default; HTML `<input type="range">` maps directly |
| ITEM-05 | User can toggle item condition (Poor/Good/Excellent) and FMV range updates accordingly | Condition change triggers `updateItem()` store action + new `resolveFMV()` call |
| ITEM-06 | User sees contextual IRS compliance notes per item category | `ItemFMV.irsNote` field (required on all electronics); surface in ItemCard |
| ITEM-07 | Poor-condition items display §170(f)(16) warning and are excluded from total | `isDeductible()` selector already implements this; UI needs strikethrough + warning copy |
| LOG-01 | User can create multiple donation events with date and organization name | `addEvent()` store action accepts `{ date, organization }`; date input + org text field |
| LOG-02 | User can add items to a specific donation event | `addItem(eventId, item)` store action; item picker flow scoped to active event |
| LOG-03 | User can set quantity per item with inline +/- controls | `updateItem()` patch with `{ quantity: n }`; `<button>` elements only (not div) |
| LOG-04 | User can bulk-enter quantity for high-volume donations | Same `updateItem()` action; text input alongside +/- buttons for direct entry |
| LOG-05 | User can edit or remove items from a donation event | `removeItem(eventId, itemId)` action; edit triggers item detail re-render |
| LOG-06 | User can edit or delete entire donation events | `removeEvent(eventId)` action; edit re-opens event form (date, org) |
| DASH-01 | User sees a live-updating running total | `selectGrandTotal` selector; component subscribes to store slice |
| DASH-02 | User sees visual breakdown by donation date | `selectEventThresholdFlags` already returns per-event totals; reuse for breakdown |
| DASH-03 | User sees visual breakdown by item category | `selectTotalsByCategory` selector returns `Record<string, number>` |
| DASH-04 | User sees contextual IRS threshold flag when a single donation event exceeds $250 | `selectEventThresholdFlags` returns `requiresWrittenAcknowledgment` per event |
| DASH-05 | User sees contextual IRS threshold flag when aggregate non-cash total exceeds $500 | `selectAggregateThresholdFlags().requiresForm8283SectionA` |
| DASH-06 | User sees contextual IRS threshold flag when a single item exceeds $5,000 | `selectAggregateThresholdFlags().requiresQualifiedAppraisal` + `highValueItemName` |
| DASH-07 | Threshold flags appear contextually as totals change, not buried in help text | Zustand reactive selectors + conditional render; no page refresh needed |

</phase_requirements>

---

## Summary

Phase 2 builds all interactive UI on top of the fully-tested Phase 1 foundation. The data layer (`src/data/fmv.ts`), TypeScript interfaces (`src/store/types.ts`), Zustand store (`src/store/index.ts`), and all threshold selectors (`src/store/selectors.ts`) are complete and green (65/65 tests passing). The store exposes exactly the actions Phase 2 needs: `addEvent`, `removeEvent`, `addItem`, `updateItem`, `removeItem`. All derived state (grand total, category breakdown, per-event thresholds, aggregate thresholds) is already implemented and tested in selectors.

The primary Phase 2 work is purely UI construction: building the item catalog search/browse UI, the per-event `DonationEventCard` with its `ItemCard` sub-components (condition toggle, FMV slider, quantity editor), and the `TotalsDashboard` with its `ThresholdFlags`. Every selector these components need already exists. The `App.tsx` has a clearly marked placeholder comment: `// Phase 2 will replace this placeholder with the real event list`.

The single-column `max-w-2xl` layout, brand color tokens (oklch blue-teal scale + warm-50 background + accent greens), WCAG-AA focus rings, and `prefers-reduced-motion` convention are established in `AppShell.tsx` and `src/index.css`. New components must follow these patterns.

**Primary recommendation:** Build components in the dependency order: `ItemSearch` + `CatalogBrowser` → `ConditionToggle` + `FMVRangePicker` + `QuantityEditor` → `ItemCard` → `DonationEventCard` + `DonationEventList` → `TotalsDashboard` + `ThresholdFlags`. Wire into `App.tsx` last.

---

## Standard Stack

### Core (all installed, no new packages needed for Phase 2)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI component layer | Already installed; `useCallback`/`useMemo` for search filtering performance |
| Tailwind CSS | 4.2.2 | Styling | Already configured; brand/accent/warm tokens in `src/index.css` |
| Zustand | 5.0.12 | Store + selectors | All Phase 2 data operations already wired |
| lucide-react | ^1.0.1 | Icons | Already installed; per CLAUDE.md no emoji icons |
| TypeScript | ~5.9.3 | Type safety | Strict mode; `DonationItem`, `DonationEvent`, `Condition` types are ground truth |

### No New Dependencies Required

Phase 2 is pure UI composition against the existing store. The installed stack covers everything:
- Type-ahead search: native array `.filter()` on `getAllItems()` — no search library needed at ~80-120 item catalog size
- FMV range slider: native `<input type="range">` — no slider library needed
- Date input: native `<input type="date">` — STACK.md explicitly calls out that moment.js/date-fns are NOT needed
- Condition toggle: three-button radio group — Tailwind button styles
- Quantity editor: `<button>` elements + optional `<input type="number">` for bulk

### If `react-hook-form` Is Needed

The donation event creation form (date + organization name) is a natural RHF use case. `react-hook-form` (7.72.0) and `zod` (^4.3.6) are both in `package.json` — `zod` is already installed, `react-hook-form` is not but was planned in STACK.md. For a two-field form, `useState` is equally valid; either approach is acceptable at this scope.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `<input type="range">` | rc-slider or @radix-ui/react-slider | Only needed if design requires multi-thumb or advanced styling beyond what CSS handles. Native input is sufficient here |
| Array `.filter()` for search | Fuse.js fuzzy search | Fuse.js adds fuzzy matching (typo tolerance); useful if catalog grows large. For 80-120 items with `searchTerms[]` arrays, substring filter is fast enough and simpler |
| Native `<input type="date">` | react-datepicker | Native date input works across all target browsers and requires no extra bundle. Avoid libraries unless UX requirement demands a calendar popup |

---

## Architecture Patterns

### Phase 2 Project Structure (adding to Phase 1 foundation)

```
src/
├── data/
│   └── fmv.ts                   # EXISTS — getAllItems(), resolveFMV(), getCategories()
├── store/
│   ├── index.ts                 # EXISTS — addEvent/removeEvent/addItem/updateItem/removeItem
│   ├── selectors.ts             # EXISTS — selectGrandTotal, selectTotalsByCategory, etc.
│   └── types.ts                 # EXISTS — DonationItem, DonationEvent, PersistedState
├── storage/
│   └── detect.ts                # EXISTS — detectLocalStorage()
├── components/
│   ├── AppShell.tsx             # EXISTS — max-w-2xl, brand header
│   ├── EmptyState.tsx           # EXISTS — 3-step quick-start guide
│   ├── LegalDisclaimer.tsx      # EXISTS — persistent disclaimer
│   ├── StorageWarningBanner.tsx # EXISTS — private mode warning
│   ├── DonationEventList/
│   │   └── index.tsx            # NEW — list of events + "Add donation event" button
│   ├── DonationEventCard/
│   │   ├── index.tsx            # NEW — date, org name, item list, event total
│   │   ├── EventHeader.tsx      # NEW — editable date/org + delete event button
│   │   └── EventThresholdFlag.tsx # NEW — $250 written acknowledgment warning
│   ├── ItemCatalog/
│   │   ├── ItemSearch.tsx       # NEW — type-ahead search input
│   │   └── CatalogBrowser.tsx   # NEW — category tabs/accordion + item grid
│   ├── ItemCard/
│   │   ├── index.tsx            # NEW — single item row: all controls + line total
│   │   ├── ConditionToggle.tsx  # NEW — Poor/Good/Excellent three-button selector
│   │   ├── FMVRangePicker.tsx   # NEW — range slider + low/mid/high labels
│   │   └── QuantityEditor.tsx   # NEW — inline +/- buttons + bulk number input
│   └── TotalsDashboard/
│       ├── index.tsx            # NEW — sticky/fixed panel with grand total
│       ├── CategoryBreakdown.tsx # NEW — bar or list of totals by category
│       ├── EventBreakdown.tsx   # NEW — per-event subtotals
│       └── ThresholdFlags.tsx   # NEW — $500 aggregate + $5K item flags
└── App.tsx                      # MODIFY — replace placeholder div with DonationEventList
```

### Pattern 1: Selector Hook Subscription
**What:** Each display component subscribes to exactly the store slice it needs.
**When to use:** Any component that reads derived state (totals, flags).
**Why:** Prevents re-renders when unrelated store slices change.

```typescript
// Source: Architecture.md selector pattern — already proven in Phase 1 tests
// In TotalsDashboard/index.tsx
import { useDonationStore } from '../../store'
import { selectGrandTotal, selectTotalsByCategory } from '../../store/selectors'

export function TotalsDashboard() {
  // Each selector subscription is independent — only re-renders when that value changes
  const grandTotal = useDonationStore(selectGrandTotal)
  const byCategory = useDonationStore(selectTotalsByCategory)
  // ...
}
```

### Pattern 2: Type-Ahead Search with useMemo
**What:** Filter `getAllItems()` against the search query string on each keystroke.
**When to use:** `ItemSearch` component.
**Why:** `getAllItems()` is synchronous, pure, and returns ~100 items. `useMemo` prevents recomputing on unrelated re-renders.

```typescript
// Source: fmv.ts getAllItems() API (verified in tests)
import { useMemo, useState } from 'react'
import { getAllItems } from '../../data/fmv'
import { useDonationStore } from '../../store'

function ItemSearch({ eventId }: { eventId: string }) {
  const taxYear = useDonationStore((s) => s.taxYear)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return getAllItems(taxYear).filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.searchTerms.some((t) => t.toLowerCase().includes(q))
    )
  }, [query, taxYear])
  // ...
}
```

### Pattern 3: Condition Change Updates FMV in Store
**What:** When condition toggles, recompute the FMV range and patch the item via `updateItem()`.
**When to use:** `ConditionToggle` inside `ItemCard`.
**Why:** FMV values must stay in sync with the selected condition; store is the single source of truth.

```typescript
// Source: store/index.ts updateItem() + data/fmv.ts resolveFMV()
import { resolveFMV } from '../../../data/fmv'
import { useDonationStore } from '../../../store'
import type { Condition } from '../../../store/types'

function ConditionToggle({ eventId, item }: ConditionToggleProps) {
  const updateItem = useDonationStore((s) => s.updateItem)

  const handleConditionChange = (condition: Condition) => {
    const range = resolveFMV(item.catalogSlug, condition, /* taxYear */ 2025)
    updateItem(eventId, item.id, {
      condition,
      fmv_low: range.low,
      fmv_mid: range.mid,
      fmv_high: range.high,
      // Reset selected to mid when condition changes (per D-02, mid is default)
      fmv_selected: range.mid,
    })
  }
  // ...
}
```

### Pattern 4: Poor-Condition Item Visual Treatment
**What:** When `isDeductible(item)` returns false, render the item with strikethrough text on the line total and an inline §170(f)(16) warning.
**When to use:** Inside `ItemCard` rendering.
**Why:** D-10 is a locked decision; the compliance behavior is already implemented in `isDeductible()`.

```typescript
// Source: store/selectors.ts isDeductible() (already tested)
import { isDeductible } from '../../../store/selectors'

function ItemCard({ eventId, item }: ItemCardProps) {
  const deductible = isDeductible(item)
  const lineTotal = item.fmv_selected * item.quantity

  return (
    <div>
      {/* line total with strikethrough when not deductible */}
      <span className={deductible ? 'text-brand-800 font-semibold' : 'line-through text-warm-400'}>
        ${lineTotal.toFixed(2)}
      </span>
      {/* Inline §170(f)(16) warning — only shown for poor-condition items */}
      {!deductible && (
        <p role="alert" className="text-amber-700 text-xs mt-1">
          Items in poor condition are generally not deductible (IRC §170(f)(16)).
          Exception: items valued over $500 with a qualified appraisal.
        </p>
      )}
    </div>
  )
}
```

### Pattern 5: Contextual Threshold Flags (Reactive)
**What:** Flags render conditionally based on selector output, re-rendering automatically when totals cross thresholds.
**When to use:** `ThresholdFlags` (aggregate, inside `TotalsDashboard`) and `EventThresholdFlag` (per-event, inside `DonationEventCard`).
**Why:** DASH-07 requires flags appear "contextually as totals change" — Zustand reactive subscriptions handle this with no manual wiring.

```typescript
// Source: store/selectors.ts selectAggregateThresholdFlags() (already tested)
import { selectAggregateThresholdFlags, selectEventThresholdFlags } from '../../store/selectors'

function ThresholdFlags() {
  const flags = useDonationStore(selectAggregateThresholdFlags)

  return (
    <>
      {flags.requiresForm8283SectionA && (
        <div role="alert" aria-live="polite" className="...">
          Total non-cash donations exceed $500 — Form 8283 Section A required.
        </div>
      )}
      {flags.requiresQualifiedAppraisal && (
        <div role="alert" aria-live="polite" className="...">
          {flags.highValueItemName} exceeds $5,000 — qualified appraisal required (Form 8283 Section B).
        </div>
      )}
    </>
  )
}
```

### Anti-Patterns to Avoid

- **`<div onClick>` or `<span onClick>` for interactive controls:** Every +/- quantity button, condition toggle, and delete action must use `<button>`. Non-button elements are unreachable via keyboard Tab (Pitfall 9).
- **`useState` for FMV/condition in ItemCard:** FMV values belong in the Zustand store — local state doesn't persist, doesn't export, and diverges from truth (Architecture anti-pattern 2).
- **`<table>` for item list on mobile:** Use card-per-item layout on mobile (<640px). Tables overflow at 375px viewport (Pitfall 7).
- **Unlabeled slider:** `<input type="range">` must have `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` to be accessible (Pitfall 9).
- **Computing totals inside components:** Use existing selectors — never derive `grandTotal` or category sums in component code. Selectors are tested; inline derivation isn't.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Grand total | Custom sum in component | `selectGrandTotal(state)` selector | Already tested; handles `isDeductible` exclusions correctly |
| Category breakdown | Custom reduce in component | `selectTotalsByCategory(state)` | Already tested |
| Per-event $250 flag | Custom threshold check | `selectEventThresholdFlags(state)` | Already tested with multi-event scoping |
| Aggregate $500/$5K flags | Custom threshold check | `selectAggregateThresholdFlags(state)` | Already tested; scoping is critical and easy to get wrong |
| Poor-condition gate | Inline condition check | `isDeductible(item)` | Already tested; uses `> 500` strict boundary per IRC 170(f)(16) |
| FMV range lookup | Direct `fmvData[year][category][slug]` access | `resolveFMV(slug, condition, taxYear)` | Throws typed errors for invalid slugs; tested |
| Item search | Crawling raw `fmvData` structure | `getAllItems(taxYear)` | Returns flat array with `slug` attached; tested |
| Category list | Crawling raw `fmvData` structure | `getCategories(taxYear)` | Handles missing year gracefully (returns `[]`) |
| UUID generation | `Math.random()` string | `crypto.randomUUID()` | Already used in `addEvent()` and `addItem()`; consistent |
| Date formatting | Custom date parser | Native `Intl.DateTimeFormat` | STACK.md: no date library; ISO strings stored, format at display time |

**Key insight:** The entire data + state layer is pre-built and tested. Phase 2 is exclusively a rendering and interaction layer. Calling existing selectors is faster, safer, and produces consistent results.

---

## Common Pitfalls

### Pitfall 1: Condition Toggle Resetting `fmv_selected` to Wrong Value
**What goes wrong:** When the user changes condition, `fmv_selected` should reset to `fmv_mid` of the new range. If the handler only updates `condition` (not `fmv_low`/`fmv_mid`/`fmv_high`/`fmv_selected`), the displayed line total reflects the old range's value at the new condition.
**Why it happens:** `updateItem` takes a `Partial<DonationItem>` patch — easy to forget which fields need updating together.
**How to avoid:** In `ConditionToggle`, always patch all five fields atomically: `{ condition, fmv_low, fmv_mid, fmv_high, fmv_selected: range.mid }`.
**Warning signs:** Line total doesn't change when switching from Poor to Excellent on the same item.

### Pitfall 2: Item Search Results Showing Across All Events
**What goes wrong:** A shared search state at a parent level causes the search results panel to show for all events simultaneously when a user types in one event's search box.
**Why it happens:** Search query state lifted too high.
**How to avoid:** Search query state (`useState('')`) lives inside the `DonationEventCard` or its `ItemSearch` child — scoped to that event's interaction zone. Do not lift to `App.tsx` or `DonationEventList`.
**Warning signs:** Typing in one event's search box causes another event's item picker to open.

### Pitfall 3: FMV Slider Showing Values Outside the Current Range
**What goes wrong:** If the slider's `min`/`max` are not updated when condition changes, the slider thumb may sit at a position that visually implies a value outside the new range.
**Why it happens:** `<input type="range">` keeps its `value` even if `min`/`max` change without a corresponding `value` update.
**How to avoid:** Derive slider `min`/`max`/`value` directly from `item.fmv_low`, `item.fmv_high`, `item.fmv_selected` — these are always in sync because the condition toggle patches all four fields atomically (see Pitfall 1).
**Warning signs:** After toggling condition, slider thumb is at an extreme end rather than mid-range.

### Pitfall 4: Threshold Flag Missing When First Event Passes $250
**What goes wrong:** `selectEventThresholdFlags` returns an array keyed by `eventId`. If the `DonationEventCard` doesn't look up its own flag from this array by `eventId`, it may show the wrong event's flag (or none at all).
**Why it happens:** Mapping array results back to individual cards requires an `.find()` call.
**How to avoid:** In `DonationEventCard`, use `useDonationStore(selectEventThresholdFlags).find(f => f.eventId === event.id)` to get the correct flag for that event.
**Warning signs:** $250 warning appears on wrong event, or all events show/hide simultaneously.

### Pitfall 5: `aria-live` Region Not Present for Threshold Flags
**What goes wrong:** Threshold flags appear and disappear as totals change. Without `aria-live="polite"` on the alert container, screen reader users adding items receive no notification when a compliance threshold is crossed.
**Why it happens:** Visual change is obvious; assistive technology announcement requires explicit markup.
**How to avoid:** Wrap each threshold flag in an element with `role="alert"` or `aria-live="polite"`. These attributes cause screen readers to announce the content when it appears.
**Warning signs:** VoiceOver doesn't announce anything when $500 threshold is crossed.

### Pitfall 6: Mobile Item Cards With Unreadable Column Layout
**What goes wrong:** Showing all item fields (condition, quantity, FMV low, FMV high, selected, line total) side by side on a 375px screen either truncates text or causes horizontal scroll.
**Why it happens:** Desktop-first layout; mobile not tested.
**How to avoid:** On mobile, stack controls vertically within each item card. Use `flex-col` on `< sm` breakpoint and `flex-row` or grid on `sm:`. The line total is the one value that must always be prominent — give it its own row.
**Warning signs:** Any horizontal scrollbar on the main page at 375px.

### Pitfall 7: Delete Event Without Confirmation on Non-Empty Events
**What goes wrong:** User accidentally taps the delete icon on an event containing 10 items and loses all data. There is no undo.
**Why it happens:** Delete actions are destructive; optimistic delete without confirmation is common in quick implementations.
**How to avoid:** If the event has 1 or more items, show an inline confirmation ("Delete this event and its X items?") before calling `removeEvent()`. For empty events (just created), delete immediately. This is minimal friction for the most common case (empty event by mistake) and appropriate caution for the destructive case.
**Warning signs:** `removeEvent()` is called directly from a single button click with no guard.

---

## Code Examples

Verified patterns from the existing codebase:

### Store Action: Adding a Donation Event
```typescript
// Source: src/store/index.ts addEvent() (Phase 1, verified)
const addEvent = useDonationStore((s) => s.addEvent)

addEvent({
  date: '2025-11-15',        // ISO date string
  organization: 'Goodwill',  // free-text org name
})
// Store assigns id: crypto.randomUUID(), items: [] automatically
```

### Store Action: Adding an Item to an Event
```typescript
// Source: src/store/index.ts addItem() + src/data/fmv.ts resolveFMV() (Phase 1, verified)
const addItem = useDonationStore((s) => s.addItem)
const taxYear = useDonationStore((s) => s.taxYear)

// 1. Resolve FMV for chosen slug + condition + year
const range = resolveFMV('jeans', 'good', taxYear)
// range = { low: 6, mid: 9, high: 12 }

// 2. Build the item payload (id is assigned by the store)
addItem(eventId, {
  catalogSlug: 'jeans',
  name: 'Jeans',
  category: 'clothing',
  quantity: 1,
  condition: 'good',
  fmv_low: range.low,
  fmv_mid: range.mid,
  fmv_high: range.high,
  fmv_selected: range.mid,   // mid is the suggested default per D-02
  irsNote: undefined,        // undefined for non-electronics
})
```

### Selector: Grand Total (reactive)
```typescript
// Source: src/store/selectors.ts selectGrandTotal (Phase 1, verified)
import { useDonationStore } from '../../store'
import { selectGrandTotal } from '../../store/selectors'

// Re-renders only when grandTotal value changes
const grandTotal = useDonationStore(selectGrandTotal)
// Returns number — sum of fmv_selected * quantity for all isDeductible() items
```

### Selector: Per-Event Threshold Flag
```typescript
// Source: src/store/selectors.ts selectEventThresholdFlags (Phase 1, verified)
import { selectEventThresholdFlags } from '../../store/selectors'

function DonationEventCard({ event }: { event: DonationEvent }) {
  const allFlags = useDonationStore(selectEventThresholdFlags)
  const flag = allFlags.find((f) => f.eventId === event.id)

  return (
    <>
      {/* ... event content ... */}
      {flag?.requiresWrittenAcknowledgment && (
        <div role="alert" aria-live="polite" className="...">
          This donation exceeds $250 — written acknowledgment from {event.organization} required (IRS Pub. 1771).
        </div>
      )}
    </>
  )
}
```

### Token Usage: Established Brand Colors
```css
/* Source: src/index.css @theme (Phase 1, verified) */
/* Use these tokens in all Phase 2 components: */
bg-brand-600       /* header, primary buttons */
text-brand-700     /* body text on light background */
bg-warm-50         /* page background (already on AppShell) */
bg-white           /* card surfaces (as in EmptyState) */
border-brand-100   /* card borders (as in EmptyState) */
text-accent-500    /* success/add actions (green) */
text-accent-600    /* hover state for success actions */
```

### Accessible FMV Range Slider
```typescript
// Pattern: native range input with full ARIA (addresses Pitfall 9)
function FMVRangePicker({ item, eventId }: FMVRangePickerProps) {
  const updateItem = useDonationStore((s) => s.updateItem)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateItem(eventId, item.id, { fmv_selected: Number(e.target.value) })
  }

  return (
    <div>
      <input
        type="range"
        min={item.fmv_low}
        max={item.fmv_high}
        value={item.fmv_selected}
        step={1}
        onChange={handleChange}
        aria-label={`FMV for ${item.name}`}
        aria-valuemin={item.fmv_low}
        aria-valuemax={item.fmv_high}
        aria-valuenow={item.fmv_selected}
        className="cursor-pointer w-full"
      />
      <div className="flex justify-between text-xs text-brand-500 mt-1">
        <span>Low: ${item.fmv_low}</span>
        <span>Mid: ${item.fmv_mid}</span>
        <span>High: ${item.fmv_high}</span>
      </div>
    </div>
  )
}
```

### Accessible Quantity Editor
```typescript
// Pattern: +/- buttons with aria-labels + optional direct input (LOG-03, LOG-04)
function QuantityEditor({ item, eventId }: QuantityEditorProps) {
  const updateItem = useDonationStore((s) => s.updateItem)

  const setQty = (qty: number) => {
    if (qty < 1) return
    updateItem(eventId, item.id, { quantity: qty })
  }

  return (
    <div role="group" aria-label={`Quantity for ${item.name}`} className="flex items-center gap-2">
      <button
        onClick={() => setQty(item.quantity - 1)}
        aria-label={`Decrease quantity for ${item.name}`}
        className="cursor-pointer ..."
        disabled={item.quantity <= 1}
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      {/* Direct entry for bulk (LOG-04) */}
      <input
        type="number"
        min={1}
        value={item.quantity}
        onChange={(e) => setQty(Number(e.target.value))}
        aria-label={`Quantity for ${item.name}`}
        className="w-14 text-center ..."
      />
      <button
        onClick={() => setQty(item.quantity + 1)}
        aria-label={`Increase quantity for ${item.name}`}
        className="cursor-pointer ..."
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Complex DOM state for item cards | Zustand store + selector subscriptions | Phase 1 | Components are stateless shells; all data lives in store |
| Condition as FMV multiplier | Each condition has its own `FMVRange` (D-02) | Phase 1 design | `resolveFMV(slug, condition, year)` returns exact range; no arithmetic in UI |
| Tailwind v3 config file | Tailwind v4 `@theme` in CSS | Phase 1 | Brand tokens defined in `src/index.css`; no `tailwind.config.js` needed |

**Established in Phase 1 (carry forward into all Phase 2 components):**
- `prefers-reduced-motion`: all transitions must be inside the existing `@media (prefers-reduced-motion: no-preference)` block in `src/index.css`
- Focus rings: defined globally via `*:focus-visible` in `src/index.css` using `brand-500` color — do not override in components
- No `cursor-pointer` on non-clickable elements (informational cards like `EmptyState` steps do not have it)

---

## Open Questions

1. **TotalsDashboard position: sticky bottom strip vs. sidebar**
   - What we know: single-column layout (D-06); `max-w-2xl` wrapper
   - What's unclear: whether the running total should be a sticky footer at the bottom of the viewport (works well on mobile) or a fixed top/side panel (better for long event lists on desktop)
   - Recommendation: sticky bottom bar on mobile (`sm:` and below), switch to a top-of-`<main>` sticky card on `md:` and above. This keeps it visible while scrolling the event list on both form factors.

2. **Item catalog UI: modal/drawer vs. inline accordion**
   - What we know: item search and browse must be scoped per event (ITEM-01, ITEM-02); single-column layout
   - What's unclear: whether the item picker expands inline below the "Add item" button or opens a bottom sheet / modal
   - Recommendation: inline expand on desktop (no modal overhead); bottom-sheet-style slide-up panel on mobile (prevents the search box from being scrolled off-screen while browsing results). Can be implemented with a conditional absolute-positioned `<div>` — no modal library needed.

3. **Category browse UI: tabs vs. accordion vs. horizontal scroll chips**
   - What we know: 7 categories (clothing, sporting-goods, furniture, electronics, household, books-media-toys, instruments)
   - What's unclear: which pattern fits best in a `max-w-2xl` single column
   - Recommendation: horizontal scrollable chip row (overflow-x: auto, scrollbar-hidden) on mobile; wrapping chip grid on `md:`. Simpler than tabs; no JavaScript needed beyond state tracking the active category filter.

4. **Event date input: `<input type="date">` vs. text string with validation**
   - What we know: store accepts ISO date strings; `DonationEvent.date: string`
   - What's unclear: `<input type="date">` renders differently across browsers/OS (iOS shows a wheel picker; macOS shows a dropdown); some users find it awkward
   - Recommendation: Use `<input type="date">` for v1. Browser inconsistencies are a real concern but acceptable for a utility tool. Switching to a date picker library is a v2 improvement if user feedback surfaces friction.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |
| Current state | 65/65 tests passing (Phase 1 green) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ITEM-01 | Type-ahead filters by `label` and `searchTerms` | unit | `npx vitest run src/components/ItemCatalog/__tests__` | ❌ Wave 0 |
| ITEM-02 | Category browse shows correct items per category | unit | `npx vitest run src/components/ItemCatalog/__tests__` | ❌ Wave 0 |
| ITEM-03 | FMV range shows correct low/mid/high for condition | unit (via `resolveFMV`) | Already covered in `src/data/__tests__/fmv.test.ts` | ✅ |
| ITEM-04 | Slider defaults to `fmv_mid` on item add | unit | `npx vitest run src/components/ItemCard/__tests__` | ❌ Wave 0 |
| ITEM-05 | Condition toggle updates FMV range in store | unit | `npx vitest run src/components/ItemCard/__tests__` | ❌ Wave 0 |
| ITEM-06 | Electronics items display `irsNote` | unit | `npx vitest run src/components/ItemCard/__tests__` | ❌ Wave 0 |
| ITEM-07 | Poor-condition items show strikethrough + §170(f)(16) warning | unit | `npx vitest run src/components/ItemCard/__tests__` | ❌ Wave 0 |
| LOG-01 | Add event form creates event with date + org in store | unit | `npx vitest run src/components/DonationEventList/__tests__` | ❌ Wave 0 |
| LOG-02 | Item add scoped to correct event by eventId | unit | Already covered in `src/store/__tests__/store.test.ts` | ✅ |
| LOG-03 | +/- buttons adjust quantity; quantity never goes below 1 | unit | `npx vitest run src/components/ItemCard/__tests__` | ❌ Wave 0 |
| LOG-04 | Direct number input sets exact quantity | unit | `npx vitest run src/components/ItemCard/__tests__` | ❌ Wave 0 |
| LOG-05 | Remove item button removes item from correct event | unit | Already covered in `src/store/__tests__/store.test.ts` | ✅ |
| LOG-06 | Delete event removes event and all its items | unit | Already covered in `src/store/__tests__/store.test.ts` | ✅ |
| DASH-01 | Grand total updates live when items added/changed/removed | unit | Already covered in `src/store/__tests__/selectors.test.ts` | ✅ |
| DASH-02 | Per-event subtotals display correctly | unit | Already covered in `src/store/__tests__/selectors.test.ts` | ✅ |
| DASH-03 | Category breakdown totals are correct | unit | Already covered in `src/store/__tests__/selectors.test.ts` | ✅ |
| DASH-04 | $250 flag appears on correct event only | unit | Already covered in `src/store/__tests__/selectors.test.ts` | ✅ |
| DASH-05 | $500 flag appears when aggregate exceeds $500 | unit | Already covered in `src/store/__tests__/selectors.test.ts` | ✅ |
| DASH-06 | $5K flag appears when single item exceeds $5,000 | unit | Already covered in `src/store/__tests__/selectors.test.ts` | ✅ |
| DASH-07 | Flags render contextually (appear/disappear as totals change) | unit | `npx vitest run src/components/TotalsDashboard/__tests__` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** All 65 existing tests + new Phase 2 tests green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/ItemCatalog/__tests__/ItemSearch.test.tsx` — covers ITEM-01, ITEM-02
- [ ] `src/components/ItemCard/__tests__/ItemCard.test.tsx` — covers ITEM-03 through ITEM-07, LOG-03, LOG-04
- [ ] `src/components/DonationEventList/__tests__/DonationEventList.test.tsx` — covers LOG-01
- [ ] `src/components/TotalsDashboard/__tests__/TotalsDashboard.test.tsx` — covers DASH-07 (flag conditional render)

Note: All business logic tests (DASH-01 through DASH-06, LOG-02, LOG-05, LOG-06) are already covered by the Phase 1 selector and store tests. New Wave 0 tests cover only UI rendering behavior.

---

## Sources

### Primary (HIGH confidence)
- `src/store/index.ts` — Store actions API (addEvent, removeEvent, addItem, updateItem, removeItem)
- `src/store/selectors.ts` — All derived selectors (selectGrandTotal, selectTotalsByCategory, selectEventThresholdFlags, selectAggregateThresholdFlags, isDeductible)
- `src/store/types.ts` — Canonical TypeScript interfaces
- `src/data/fmv.ts` — getAllItems(), getCategories(), resolveFMV() APIs
- `src/index.css` — Brand token definitions (brand-*, accent-*, warm-*)
- `src/components/AppShell.tsx` — Layout pattern (max-w-2xl, single column, landmark structure)
- `src/components/EmptyState.tsx` — Established component pattern (card style, icon usage, typography)
- `.planning/research/STACK.md` — Verified stack versions and patterns
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, build order
- `.planning/research/PITFALLS.md` — Domain pitfalls (threshold scoping, accessibility, mobile layout)

### Secondary (MEDIUM confidence)
- `donation-itemizer-spec.md` — UX flow and item category seed list (product decisions, not implementation)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Locked design decisions D-01 through D-18

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries installed and verified in Phase 1; no new dependencies required
- Architecture: HIGH — component structure derived directly from running code; all store APIs verified by tests
- Pitfalls: HIGH — drawn from verified PITFALLS.md (IRS sources) + Phase 1 implementation lessons

**Research date:** 2026-03-24
**Valid until:** 2026-05-01 (stable stack; FMV research valid for full 2025 tax year)
