---
phase: 01-foundation
plan: "02"
subsystem: store-and-ui-shell
tags: [zustand, persist, selectors, threshold-logic, react-components, tailwind-v4, accessibility]
dependency_graph:
  requires: ["01-01"]
  provides: ["useDonationStore", "selectors", "AppShell", "EmptyState", "StorageWarningBanner", "LegalDisclaimer"]
  affects: ["02-*"]
tech_stack:
  added: ["zustand persist middleware", "@theme OKLCH tokens"]
  patterns: ["TDD red-green", "pure function selectors", "partialize for localStorage hygiene", "MockStorage global setup"]
key_files:
  created:
    - src/store/index.ts
    - src/store/selectors.ts
    - src/store/__tests__/store.test.ts
    - src/store/__tests__/selectors.test.ts
    - src/components/AppShell.tsx
    - src/components/EmptyState.tsx
    - src/components/StorageWarningBanner.tsx
    - src/components/LegalDisclaimer.tsx
    - src/test-setup.ts
  modified:
    - src/App.tsx
    - src/index.css
    - vitest.config.ts
decisions:
  - "Global MockStorage in test-setup.ts is installed before module imports so Zustand persist middleware always finds a functional Storage object"
  - "StorageWarningBanner rendered outside AppShell at root level so it spans full width above the branded header"
  - "isDeductible > 500 (not >= 501) matches the plan spec: poor items at exactly $500 are excluded, items above $500 are included"
metrics:
  duration: "~8 minutes"
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_created: 9
  files_modified: 3
  tests_added: 34
  tests_total: 65
---

# Phase 01 Plan 02: Store + App Shell Summary

**One-liner:** Zustand store with CRUD/persist/partialize and five derived selectors (grand total, categories, per-event $250 flag, aggregate $500 flag, per-item $5K flag) plus branded single-column app shell with legal disclaimer, storage warning, and 3-step empty state.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Zustand store + selectors (TDD) | `ddf4b3c` | src/store/index.ts, src/store/selectors.ts, 2 test files, src/test-setup.ts |
| 2 | App shell UI components | `47a80c6` | src/components/*, src/App.tsx, src/index.css |

## Verification Results

- `npx tsc --noEmit`: PASS (0 errors)
- `npx vitest run`: PASS (65 tests, 4 test files)
- `npm run build`: PASS (200KB JS + 14KB CSS, built in 100ms)
- No "IRS FMV" or "IRS value" in data values: PASS

## Decisions Made

### Global MockStorage test setup

The Zustand persist middleware captures the `localStorage` reference at module import time. Resetting `window.localStorage` inside individual test `beforeEach` blocks is too late — the middleware has already captured the original (non-functional jsdom) reference.

**Fix:** Added `src/test-setup.ts` registered in `vitest.config.ts` `setupFiles` so a `MockStorage` is installed on `window.localStorage` before any modules are imported. This is consistent with the pattern established for detect.ts tests in Plan 01-01.

### StorageWarningBanner placement

Rendered at the React fragment level in App.tsx (outside `<AppShell>`) so it spans the full viewport width as a top-of-page alert, rather than being constrained by AppShell's `max-w-2xl` content column.

### isDeductible threshold boundary

`item.fmv_selected > 500` (strictly greater than) per plan spec: poor-condition items at exactly $500 are excluded; items at $501+ are included. This matches IRC §170(f)(16) intent where the $500 threshold is a minimum to qualify.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Global localStorage mock for Zustand persist middleware**

- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** Zustand v5 `persist` middleware captures `localStorage` at module import time. Installing a mock in `beforeEach` is too late — the middleware already has a reference to the non-functional jsdom `localStorage`, causing `TypeError: storage.setItem is not a function` on every test.
- **Fix:** Created `src/test-setup.ts` with a full `MockStorage implements Storage` class and registered it in `vitest.config.ts` `setupFiles` so it runs before module imports.
- **Files modified:** `src/test-setup.ts` (created), `vitest.config.ts` (updated)
- **Commit:** `ddf4b3c`

## Self-Check: PASSED

All 11 expected files present. Both task commits (ddf4b3c, 47a80c6) verified in git log.
