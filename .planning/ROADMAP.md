# Roadmap: Donation Itemizer

## Overview

Three phases that take the app from a bare TypeScript skeleton to a fully deployable, IRS-compliant donation itemizer. Phase 1 locks the data model and store so nothing else breaks. Phase 2 builds the entire interactive UI — item catalog, donation log, running totals, and compliance flags. Phase 3 adds PDF export and data persistence so users can export to their CPA and survive a browser close.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - FMV data module, TypeScript interfaces, Zustand store, and project scaffolding (completed 2026-03-24)
- [ ] **Phase 2: Core UI** - Item catalog, donation log, running total dashboard, and IRS compliance flags
- [ ] **Phase 3: Export and Persistence** - PDF export with Form 8283 annotations, localStorage persistence, and JSON backup

## Phase Details

### Phase 1: Foundation
**Goal**: The app scaffolding, data model, and state layer are in place so all subsequent UI work builds on a stable, type-safe foundation
**Depends on**: Nothing (first phase)
**Requirements**: INFR-01, INFR-02, INFR-03, INFR-04, INFR-05
**Success Criteria** (what must be TRUE):
  1. The Vite + React + TypeScript app builds and renders a shell at 375px and 1440px with no type errors
  2. FMV data module returns correct low/mid/high values for any item + condition + year combination via `resolveFMV()`
  3. Zustand store accepts donation events and items, and all derived selectors (running total, category breakdown, threshold flags) return correct values when driven by test data
  4. App defaults to tax year 2025, and the year-keyed data structure requires only a single file change to add a future year
  5. localStorage write test runs on mount and a private-mode warning banner is visible when storage is unavailable
**Plans:** 2/2 plans complete

Plans:
- [x] 01-01-PLAN.md — Scaffold Vite project, FMV data module with resolveFMV(), TypeScript interfaces, localStorage detection
- [x] 01-02-PLAN.md — Zustand store with selectors and threshold logic, app shell UI with branding and empty state

### Phase 2: Core UI
**Goal**: Users can find items, set condition and quantity, log multiple donation events, and see a live-updating deduction total with contextual IRS compliance flags — all on mobile and desktop
**Depends on**: Phase 1
**Requirements**: ITEM-01, ITEM-02, ITEM-03, ITEM-04, ITEM-05, ITEM-06, ITEM-07, LOG-01, LOG-02, LOG-03, LOG-04, LOG-05, LOG-06, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07
**Success Criteria** (what must be TRUE):
  1. User can type a partial item name and see matching results across all categories within one keystroke; user can also browse by category without searching
  2. User can toggle condition (Poor/Good/Excellent), adjust FMV within the published range via a slider that defaults to mid, and set quantity with inline +/- controls — and the line-item total updates immediately
  3. Poor-condition items under $500 display a strikethrough and an §170(f)(16) warning and are excluded from the deductible total
  4. User can create multiple donation events each with a date and organization name, add items to each event, and edit or delete items and entire events
  5. The running total panel updates live; the $250-per-event flag, $500-aggregate flag, and $5,000-per-item flag each appear at the correct threshold and are scoped correctly (per-event vs. aggregate)
**Plans:** 2/4 plans executed

Plans:
- [x] 02-01-PLAN.md — Item controls (ConditionToggle, FMVRangePicker, QuantityEditor) and ItemCard composite with compliance warnings
- [x] 02-02-PLAN.md — TotalsDashboard with category/date breakdowns and ThresholdFlags for aggregate IRS compliance
- [ ] 02-03-PLAN.md — DonationEventCard, DonationEventList, AddEventForm, and event management (create/edit/delete)
- [ ] 02-04-PLAN.md — ItemSearch combobox, CatalogBrowser grid, App.tsx integration, and visual verification

### Phase 3: Export and Persistence
**Goal**: Users can generate a PDF suitable for CPA handoff and their donation data survives browser close, with a JSON backup option guarding against localStorage loss
**Depends on**: Phase 2
**Requirements**: EXPO-01, EXPO-02, EXPO-03, EXPO-04, PERS-01, PERS-02, PERS-03, PERS-04
**Success Criteria** (what must be TRUE):
  1. User can click "Export PDF" and receive a downloadable PDF containing donor info, all donation events with dates and organization names, itemized quantities and FMV values, and grand totals
  2. PDF includes Form 8283 field reference callouts (Box 1a, 1b, etc.) and a legal disclaimer stating values are estimates from charity guides, not IRS-authoritative figures
  3. Closing and reopening the browser restores all donation data exactly as left — zero data loss in a standard browsing session
  4. User can export a JSON backup file and re-import it to fully restore a previous session's data
  5. localStorage schema includes a version field and a migration path so future data shape changes do not silently corrupt existing user data
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-03-24 |
| 2. Core UI | 2/4 | In Progress|  |
| 3. Export and Persistence | 0/TBD | Not started | - |
