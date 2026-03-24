# Architecture Patterns

**Domain:** Pure-frontend charitable donation itemizer (React + Vite)
**Researched:** 2026-03-23

---

## Recommended Architecture

A single-page React application with no backend. All state lives in memory during the session and is persisted to localStorage between sessions. A hardcoded FMV data module acts as the app's "database." PDF generation runs entirely in the browser using @react-pdf/renderer. There are no network requests at runtime.

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                   React App                       │  │
│  │                                                   │  │
│  │  ┌─────────────┐     ┌──────────────────────┐   │  │
│  │  │  FMV Data   │────▶│   App State (Zustand) │   │  │
│  │  │  Module     │     │   DonationLog         │   │  │
│  │  │  (static    │     │   ActiveEvent         │   │  │
│  │  │   import)   │     │   UIState             │   │  │
│  │  └─────────────┘     └──────────┬───────────┘   │  │
│  │                                 │                   │  │
│  │                    ┌────────────▼─────────────┐   │  │
│  │                    │      UI Layer             │   │  │
│  │                    │  DonationEventList        │   │  │
│  │                    │  ItemCatalog / Search     │   │  │
│  │                    │  ItemCard                 │   │  │
│  │                    │  FMVRangePicker           │   │  │
│  │                    │  TotalsDashboard          │   │  │
│  │                    │  ThresholdFlags           │   │  │
│  │                    │  ExportButton             │   │  │
│  │                    └────────────┬─────────────┘   │  │
│  │                                 │                   │  │
│  │              ┌──────────────────▼──────────────┐  │  │
│  │              │  PDF Pipeline                    │  │  │
│  │              │  (@react-pdf/renderer)           │  │  │
│  │              │  DonationReport (PDF Document)   │  │  │
│  │              └─────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐                                      │
│  │ localStorage │  ←── persisted via useEffect watcher │
│  └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `App` | Root layout, route-like view switching | All top-level sections |
| `DonationEventList` | Renders the list of donation events; add/remove event controls | App state (donation events array) |
| `DonationEventCard` | Single event: date, org name, items table for that event | App state, ItemCatalog |
| `ItemCatalog` | Searchable/browsable item picker; shows FMV lookup result | FMV Data Module, App state |
| `ItemSearch` | Type-ahead search input filtering the catalog | FMV Data Module (read only) |
| `ItemCard` | Single added item row: condition toggle, quantity controls, FMV picker, line total | App state (mutates single item) |
| `FMVRangePicker` | Slider or segmented control scoped to low/mid/high range | ItemCard, FMV Data Module |
| `ConditionToggle` | Poor / Good / Excellent selector per item; adjusts multiplier | ItemCard, FMV Data Module |
| `TotalsDashboard` | Sticky/fixed panel showing grand total, per-category totals, per-event totals | App state (derived totals, read only) |
| `ThresholdFlags` | Contextual IRS compliance alerts ($250/$500/$5k) | Derived totals (read only) |
| `ExportButton` | Triggers PDF generation; shows loading state | PDF Pipeline, App state |
| `DonorInfoForm` | Donor name, tax year (shown at start or in settings) | App state |
| `FMV Data Module` | Static year-keyed catalog with condition multipliers | ItemCatalog, FMVRangePicker (imported) |
| `PDF Pipeline` | @react-pdf/renderer document tree built from app state snapshot | App state (snapshot at export time) |
| `usePersistedState` hook | Sync Zustand store → localStorage on every change; rehydrate on mount | Zustand store, localStorage |

---

## Data Flow

### Write Path (user adds an item)

```
User types in ItemSearch
  → FMV Data Module returns matching catalog entries (synchronous)
  → User selects item
  → ItemCard rendered with default condition = "good"
  → FMV Data Module returns [low, mid, high] for item + condition + tax year
  → fmv_selected defaults to mid value
  → Zustand action addItem(eventId, item) called
  → Store updates → React re-renders ItemCard, TotalsDashboard, ThresholdFlags
  → useEffect watcher serializes store → localStorage
```

### Read Path (app loads)

```
App mounts
  → usePersistedState hook reads localStorage["donation-itemizer-v1"]
  → Validates schema version; runs migration if version mismatch
  → Hydrates Zustand store
  → React renders from store state
```

### Export Path

```
User clicks ExportButton
  → App state snapshot passed to PDF Pipeline component
  → @react-pdf/renderer builds DonationReport React tree (Page, View, Text, etc.)
  → pdf() call generates Blob in browser
  → URL.createObjectURL triggers download
  → No server involved
```

### FMV Resolution Path (pure, no network)

```
Item name + condition + tax year
  → FMV Data Module lookup: fmvData[taxYear][categoryKey][itemKey]
  → Returns { low, mid, high } base values
  → Condition multiplier applied: poor=0.6, good=1.0, excellent=1.3
  → Result: { fmv_low, fmv_mid, fmv_high }
```

---

## Data Model

### FMV Data Module Shape (year-keyed, condition-adjusted)

```typescript
// src/data/fmv/index.ts
// Adding a new tax year = adding one key at the top level.

type FMVRange = {
  low: number;
  mid: number;
  high: number;
};

type ConditionMultipliers = {
  poor: number;    // e.g. 0.6
  good: number;    // e.g. 1.0
  excellent: number; // e.g. 1.3
};

type ItemFMV = {
  label: string;        // display name
  category: string;     // "clothing" | "furniture" | "electronics" | ...
  searchTerms: string[]; // aliases for type-ahead: ["jeans", "denim pants"]
  baseRange: FMVRange;  // values at "good" condition from charity guides
  multipliers: ConditionMultipliers;
  irsNote?: string;     // e.g. "Electronics require additional documentation"
};

type CategoryFMV = Record<string, ItemFMV>; // keyed by item slug

type YearFMV = {
  year: number;
  source: string;       // "Salvation Army 2025 Valuation Guide"
  categories: Record<string, CategoryFMV>; // keyed by category slug
};

// Top-level export
export const fmvData: Record<number, YearFMV> = {
  2025: { ... },
  // 2026: { ... } — add when guides publish
};
```

### Condition multiplier application

```typescript
// Derived at lookup time, not stored in the data file.
// This keeps the data file clean and multiplier logic testable.
function resolveFMV(item: ItemFMV, condition: Condition): FMVRange {
  const m = item.multipliers[condition];
  return {
    low: Math.round(item.baseRange.low * m),
    mid: Math.round(item.baseRange.mid * m),
    high: Math.round(item.baseRange.high * m),
  };
}
```

### localStorage Schema

```typescript
// Key: "donation-itemizer-v1"
// Increment version suffix when schema changes (triggers migration).

interface PersistedState {
  schemaVersion: 1;             // bump when shape changes
  donorInfo: {
    name: string;
    taxYear: number;
  };
  events: DonationEvent[];      // full event + items array
}

// DonationEvent mirrors the spec data model:
interface DonationEvent {
  id: string;                   // uuid
  date: string;                 // ISO 8601: "2025-03-15"
  organization: string;
  items: DonationItem[];
}

interface DonationItem {
  id: string;
  catalogSlug: string;          // foreign key into FMV data module
  name: string;
  category: string;
  quantity: number;
  condition: "poor" | "good" | "excellent";
  fmv_low: number;
  fmv_mid: number;
  fmv_high: number;
  fmv_selected: number;         // user's chosen value within range
  irsNote?: string;
}
```

### Schema migration pattern

```typescript
// src/storage/migrate.ts
// Version number lives alongside schema, not in the key name.
// This avoids orphaned keys on version bump.

const MIGRATIONS: Record<number, (old: any) => any> = {
  // 1 → 2: example future migration
  // 2: (v1) => ({ ...v1, newField: defaultValue }),
};

export function migrateStorage(raw: any): PersistedState {
  let state = raw;
  let v = state.schemaVersion ?? 0;
  while (v < CURRENT_VERSION) {
    state = MIGRATIONS[v + 1](state);
    v++;
  }
  return state;
}
```

---

## State Management

**Recommendation: Zustand over useReducer + Context.**

Rationale: this app has multiple independent concerns (donation events, UI state, donor info) that would require either deep prop drilling or multiple Contexts with the useReducer approach. Zustand provides a flat, hook-based store that avoids re-render cascades when unrelated slices update — critical for the live-updating TotalsDashboard which re-renders on every quantity change.

```typescript
// src/store/index.ts — store slice structure

interface DonationStore {
  // Data
  donorInfo: DonorInfo;
  events: DonationEvent[];
  taxYear: number;

  // Derived (computed, not stored)
  // Access via selectors, not store slices

  // Actions
  setDonorInfo: (info: Partial<DonorInfo>) => void;
  addEvent: (event: Omit<DonationEvent, "id" | "items">) => void;
  removeEvent: (eventId: string) => void;
  addItem: (eventId: string, item: Omit<DonationItem, "id">) => void;
  updateItem: (eventId: string, itemId: string, patch: Partial<DonationItem>) => void;
  removeItem: (eventId: string, itemId: string) => void;
}

// Selectors live outside the store — keep store actions pure
// src/store/selectors.ts
export const selectGrandTotal = (state: DonationStore) =>
  state.events.flatMap(e => e.items).reduce((sum, item) =>
    sum + item.fmv_selected * item.quantity, 0);

export const selectTotalsByCategory = (state: DonationStore) => { ... };
export const selectTotalsByEvent = (state: DonationStore) => { ... };
export const selectThresholdFlags = (state: DonationStore) => { ... };
```

---

## PDF Generation Pipeline

**Recommendation: @react-pdf/renderer over jsPDF.**

Rationale: The export must be a structured, multi-section document (donor info header, per-event tables, totals, IRS compliance callouts). @react-pdf/renderer's flexbox-based layout model maps directly to this. jsPDF requires manual coordinate math for tables and headers, which becomes fragile when item counts vary. @react-pdf/renderer generates from a React component tree — same mental model as the UI layer.

```typescript
// src/pdf/DonationReport.tsx — PDF document component
// This is a pure function of the app state snapshot.
// It never reads from Zustand directly — receives a plain data prop.

interface ReportData {
  donorInfo: DonorInfo;
  events: DonationEvent[];
  taxYear: number;
  grandTotal: number;
  totalsByCategory: CategoryTotals;
  thresholds: ThresholdFlags;
}

export function DonationReport({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page style={styles.page}>
        <ReportHeader donorInfo={data.donorInfo} taxYear={data.taxYear} />
        {data.events.map(event => (
          <EventSection key={event.id} event={event} />
        ))}
        <TotalsSection totals={data.totalsByCategory} grandTotal={data.grandTotal} />
        <IRSNoticeSection thresholds={data.thresholds} />
      </Page>
    </Document>
  );
}
```

---

## Patterns to Follow

### Pattern 1: Selector-Based Derived State
**What:** Compute totals, threshold flags, and category breakdowns in selector functions outside the store, not as stored state slices.
**When:** Whenever a value is derivable from other stored values.
**Why:** Prevents stale derived data, avoids double-updating, keeps store mutations minimal.

```typescript
// Good: compute at read time
const grandTotal = useStore(selectGrandTotal);

// Bad: maintain grandTotal in the store alongside items
```

### Pattern 2: FMV Lookup as Pure Function
**What:** `resolveFMV(itemSlug, condition, taxYear)` is a pure function with no side effects.
**When:** Any time FMV values are needed — item add, condition change, range picker render.
**Why:** Makes the lookup testable, predictable, and never out of sync with the displayed UI.

### Pattern 3: PDF Component Receives Snapshot, Not Live Store
**What:** Pass a plain data object to the PDF document component at export time.
**When:** Export button click.
**Why:** @react-pdf/renderer renders in a different context than the DOM. Keeping it decoupled from the Zustand store prevents subtle render-timing issues.

### Pattern 4: Schema Version Guard on Hydration
**What:** Always check `schemaVersion` when reading from localStorage before hydrating the store.
**When:** App mount.
**Why:** Prevents crashes when a user's saved data doesn't match the current schema after an app update.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Derived Totals in localStorage
**What:** Persisting `grandTotal`, `totalsByCategory`, etc. alongside the item data.
**Why bad:** Data goes stale if item data is mutated directly. Requires careful double-write discipline forever.
**Instead:** Persist only raw donation events and donor info. Recompute totals from selectors on every render.

### Anti-Pattern 2: FMV Values Embedded in Component State
**What:** Putting `fmv_low / fmv_mid / fmv_high` in `useState` inside an ItemCard.
**Why bad:** Values are lost on unmount, can't be exported, can't be persisted, diverges from the source-of-truth store.
**Instead:** FMV resolved values live in the Zustand store as part of each `DonationItem`.

### Anti-Pattern 3: Single Flat localStorage Key for Everything
**What:** Serializing the entire Zustand store including UI state, modal open flags, etc. into one key.
**Why bad:** UI ephemera (open modal, active tab) gets restored on reload, causing jarring UX. Also makes migrations harder.
**Instead:** Persist only the data layer (`donorInfo`, `events`, `taxYear`). UI state is re-initialized fresh each session.

### Anti-Pattern 4: @react-pdf/renderer in the Main Bundle Without Code-Split
**What:** Importing the PDF library at the top of `App.tsx`.
**Why bad:** @react-pdf/renderer adds ~300KB to the initial bundle. Most users never export.
**Instead:** Lazy-load the PDF component with `React.lazy` / dynamic `import()` triggered only when the user clicks Export.

```typescript
// Good: only load when needed
const DonationReport = React.lazy(() => import('./pdf/DonationReport'));
```

---

## Folder Structure

```
src/
├── data/
│   └── fmv/
│       ├── index.ts          # exports fmvData, resolveFMV
│       ├── 2025.ts           # year-keyed catalog entries
│       └── categories.ts     # category slug constants
├── store/
│   ├── index.ts              # Zustand store definition
│   ├── selectors.ts          # derived state selectors
│   └── types.ts              # DonationEvent, DonationItem, etc.
├── storage/
│   ├── persist.ts            # usePersistedState hook
│   └── migrate.ts            # schema version migrations
├── components/
│   ├── DonorInfoForm/
│   ├── DonationEventList/
│   ├── DonationEventCard/
│   ├── ItemCatalog/
│   │   ├── ItemSearch.tsx
│   │   └── CatalogBrowser.tsx
│   ├── ItemCard/
│   │   ├── ConditionToggle.tsx
│   │   ├── FMVRangePicker.tsx
│   │   └── QuantityEditor.tsx
│   ├── TotalsDashboard/
│   ├── ThresholdFlags/
│   └── ExportButton/
├── pdf/
│   ├── DonationReport.tsx    # root PDF document
│   ├── ReportHeader.tsx
│   ├── EventSection.tsx
│   ├── TotalsSection.tsx
│   └── IRSNoticeSection.tsx
└── App.tsx
```

---

## Suggested Build Order (Dependency Graph)

The following order respects component dependencies — each step can be built and tested before the next.

```
1. Data layer (no UI dependencies)
   └── src/data/fmv/ — static catalog + resolveFMV()
   └── src/store/types.ts — TypeScript interfaces

2. State layer
   └── src/store/index.ts — Zustand store + actions
   └── src/store/selectors.ts — derived totals
   └── src/storage/ — localStorage persistence hook + migrations

3. Core item UI (depends on data + state layers)
   └── ItemCard — condition toggle, quantity editor, FMV picker
   └── ItemCatalog — search and browse, triggers item add

4. Event management UI (depends on ItemCard being buildable)
   └── DonationEventCard — wraps ItemCatalog + item list for one event
   └── DonationEventList — manages add/remove events

5. Dashboard + compliance (depends on state selectors)
   └── TotalsDashboard — reads derived totals
   └── ThresholdFlags — reads threshold selectors

6. Donor info + layout shell
   └── DonorInfoForm
   └── App.tsx layout + routing between views

7. PDF pipeline (depends on complete data model)
   └── pdf/DonationReport and sub-components
   └── ExportButton with lazy-load + download trigger

8. Persistence integration
   └── Wire usePersistedState hook into App
   └── Test hydration + migration paths
```

**Key dependency constraint:** The PDF pipeline (step 7) depends on the complete `DonationItem` and `DonationEvent` shape being stable. Build and stabilize the data model in steps 1-2 before writing PDF layout code, or PDF component field references will break during schema changes.

---

## Scalability Considerations

| Concern | Current scale (v1) | If catalog grows significantly |
|---------|-------------------|-------------------------------|
| FMV catalog size | ~120 items, static import, trivial bundle impact | Split by category with dynamic import per tab |
| localStorage payload | Typical session: ~50 items across 5 events ≈ 15KB JSON | No concern; localStorage cap is 5MB |
| PDF render time | Synchronous, <1s for typical report | No concern; reports are bounded by real-world donation volumes |
| Re-render frequency | TotalsDashboard updates on every quantity change | Zustand slice subscriptions prevent full-tree re-renders |
| Annual FMV updates | Change one year-keyed file, ship | No architecture change needed |

---

## Sources

- [React Architecture Patterns and Best Practices for 2026 — Bacancy Technology](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)
- [React State Management in 2025: What You Actually Need — developerway.com](https://www.developerway.com/posts/react-state-management-2025)
- [State Management Trends in React 2025: Zustand, Jotai, XState — Makers Den](https://makersden.io/blog/react-state-management-in-2025)
- [@react-pdf/renderer vs jsPDF — npm-compare.com](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf)
- [Best JavaScript PDF libraries 2025 — Nutrient](https://www.nutrient.io/blog/javascript-pdf-libraries/)
- [Comparing open source PDF libraries 2025 — Joyfill](https://joyfill.io/blog/comparing-open-source-pdf-libraries-2025-edition)
- [React Folder Structure in 5 Steps 2025 — Robin Wieruch](https://www.robinwieruch.de/react-folder-structure/)
- [Modularizing React Applications with Established UI Patterns — Martin Fowler](https://martinfowler.com/articles/modularizing-react-apps.html)
- [Mastering State Persistence with Local Storage in React — Medium](https://medium.com/@roman_j/mastering-state-persistence-with-local-storage-in-react-a-complete-guide-1cf3f56ab15c)
- [Versioned migration of local data — LinkedIn](https://www.linkedin.com/pulse/versioned-migration-local-data-react-native-amal-jose-)
