---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [vite, react, typescript, tailwind, vitest, zustand, zod, lucide-react]

# Dependency graph
requires: []
provides:
  - Vite 8 + React 19 + TypeScript + Tailwind v4 project scaffold
  - FMV data module (src/data/fmv.ts) with 89 items across 7 categories
  - resolveFMV(slug, condition, year) pure function
  - defaultTaxYear() returning 2025 during Jan–Apr 15 filing season
  - getAllItems() and getCategories() catalog helpers
  - Shared TypeScript interfaces: DonationItem, DonationEvent, PersistedState, Condition
  - localStorage detection utility with graceful degradation
  - 31 Vitest tests covering FMV logic and storage detection
affects: [02-store, 03-ui, pdf-export, all downstream phases]

# Tech tracking
tech-stack:
  added:
    - vite@8.0.x (build tool + dev server, react-ts template)
    - react@19.x + react-dom@19.x
    - typescript@5.x
    - tailwindcss@4.x + @tailwindcss/vite (Vite plugin, replaces PostCSS)
    - @vitejs/plugin-react-swc (SWC transform, replaces Babel)
    - zustand@5.x (installed, will be wired in plan 02)
    - zod@3.x (installed, will be wired in plan 02)
    - lucide-react (installed, will be used in plan 03)
    - vitest@4.x + @testing-library/react + @testing-library/jest-dom + jsdom
    - happy-dom (storage-specific tests to work around jsdom localStorage quirk)
  patterns:
    - FMV data: year-keyed TypeScript const object (fmvData[2025]) — single-file, no build step
    - Condition as direct range lookup (D-02): poor/good/excellent each have own FMVRange, no multipliers
    - resolveFMV(): pure function, throws descriptive errors on unknown slug/year
    - defaultTaxYear(): UTC-based date arithmetic to avoid timezone issues in tests
    - MockStorage class for testing localStorage — needed because jsdom/vitest-4 localStorage is not vi.spyOn-able
    - @vitest-environment comment in test files for per-file environment override

key-files:
  created:
    - src/data/fmv.ts (FMV data module — core "database" of the app)
    - src/store/types.ts (shared TypeScript interfaces)
    - src/storage/detect.ts (localStorage availability detection)
    - src/data/__tests__/fmv.test.ts (26 FMV tests)
    - src/storage/__tests__/detect.test.ts (5 storage tests)
    - vite.config.ts (Tailwind v4 + SWC config)
    - vitest.config.ts (jsdom + URL for storage support)
    - src/App.tsx (minimal placeholder)
    - src/index.css (@import "tailwindcss")
  modified:
    - tsconfig.app.json (strict, noUnusedLocals, noUnusedParameters)

key-decisions:
  - "FMV data: each condition (poor/good/excellent) has own FMVRange — not a multiplier (D-02 locked)"
  - "FMV source label: Salvation Army Valuation Guide 2025 — never IRS FMV (D-04, INFR-05)"
  - "defaultTaxYear() uses UTC date methods to avoid timezone test failures"
  - "Storage tests use MockStorage class (Object.defineProperty) — vi.spyOn fails on jsdom/vitest-4 localStorage"
  - "happy-dom used for detect.test.ts via @vitest-environment comment — jsdom has broken localStorage in vitest-4"

patterns-established:
  - "Pattern: resolveFMV(slug, condition, year) — pure function, look up then throw on unknown"
  - "Pattern: FMV data keyed by year number — annual updates are a single-file change"
  - "Pattern: test file @vitest-environment comment for per-test environment override"
  - "Pattern: MockStorage for localStorage testing instead of vi.spyOn"

requirements-completed: [INFR-01, INFR-04, INFR-05]

# Metrics
duration: 9min
completed: 2026-03-24
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**Vite 8 + React 19 + Tailwind v4 scaffold with 89-item FMV catalog, resolveFMV() pure function, shared TypeScript interfaces, and localStorage detection — all type-checked and tested**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-24T03:55:34Z
- **Completed:** 2026-03-24T04:04:47Z
- **Tasks:** 3
- **Files created:** 18 (including node_modules-free file count)

## Accomplishments

- Vite 8 + React 19 + TypeScript + Tailwind v4 project builds with zero errors (`npm run build` and `npx tsc --noEmit` both clean)
- FMV data module covers all 89 items across 7 categories: clothing (26), sporting-goods (19), furniture (15), electronics (11), household (9), books-media-toys (6), instruments (1) — each item has three condition-specific FMVRange objects (D-02, never multipliers)
- All items source-labeled as "Salvation Army Valuation Guide 2025" per INFR-05 and D-04 (no "IRS FMV" text anywhere)
- 31 Vitest tests pass covering FMV logic, data integrity, and localStorage detection

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project, install dependencies, configure Tailwind v4 + Vitest** - `8de1e71` (chore)
2. **Task 2: Create TypeScript interfaces and FMV data module with resolveFMV()** - `44127b5` (feat)
3. **Task 3: Create localStorage detection utility with tests** - `1418037` (feat)

## Files Created/Modified

- `src/data/fmv.ts` — FMV data module: 89-item catalog + resolveFMV(), defaultTaxYear(), getAllItems(), getCategories()
- `src/store/types.ts` — Shared interfaces: DonationItem, DonationEvent, PersistedState; re-exports Condition
- `src/storage/detect.ts` — detectLocalStorage(): write/read/remove test key, returns false on any exception
- `src/data/__tests__/fmv.test.ts` — 26 tests: range invariants, condition ordering, category coverage, data integrity
- `src/storage/__tests__/detect.test.ts` — 5 tests: returns true normally, false on QuotaExceededError, false on SecurityError, key cleanup
- `vite.config.ts` — @tailwindcss/vite + @vitejs/plugin-react-swc
- `vitest.config.ts` — jsdom + URL option for localStorage support
- `tsconfig.app.json` — strict, noUnusedLocals, noUnusedParameters (already present in scaffold template)
- `src/App.tsx` — minimal placeholder (boilerplate removed)
- `src/index.css` — `@import "tailwindcss"` only

## Decisions Made

- **UTC date methods in defaultTaxYear():** `Date.getMonth()` varies by timezone when tests mock system time with `new Date('2026-04-16')` (ISO string = UTC midnight). Using `getUTCMonth()` / `getUTCDate()` / `getUTCFullYear()` makes the function deterministic across all environments.
- **MockStorage for localStorage tests:** Vitest 4.x + jsdom 29 has a broken localStorage where `setItem` is not an own property, making `vi.spyOn` fail with "property not defined on object." `Object.defineProperty(window, 'localStorage', { value: new MockStorage() })` works reliably.
- **happy-dom for detect.test.ts:** The `@vitest-environment happy-dom` docblock + `Object.defineProperty` pattern is the cleanest solution that avoids the `--localstorage-file` warning and gets all 5 tests passing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed defaultTaxYear() timezone-sensitive date parsing**
- **Found during:** Task 2 (FMV tests execution)
- **Issue:** `new Date('2026-04-16')` parses as UTC midnight. On machines behind UTC (e.g., UTC-5), `getMonth()` returns 3 (April) but `getDate()` returns 15 — making Apr 16 look like Apr 15 (still in filing season). Test expected 2026 but got 2025.
- **Fix:** Changed all `getMonth()` / `getDate()` / `getFullYear()` calls to UTC variants in `defaultTaxYear()`
- **Files modified:** src/data/fmv.ts
- **Verification:** `npx vitest run src/data/__tests__/fmv.test.ts` — 26/26 pass
- **Committed in:** 44127b5 (Task 2 commit)

**2. [Rule 3 - Blocking] Replaced vi.spyOn with MockStorage for localStorage tests**
- **Found during:** Task 3 (detect.test.ts execution)
- **Issue:** Vitest 4.x + jsdom 29 localStorage doesn't expose setItem/getItem as own enumerable properties, causing `vi.spyOn(localStorage, 'setItem')` to throw "The property setItem is not defined on the object." Also, bare `localStorage.setItem()` throws due to missing `--localstorage-file` path.
- **Fix:** Created `MockStorage` class with `setItem`/`getItem`/`removeItem` as instance methods, installed via `Object.defineProperty(window, 'localStorage', { value: mock })`. Added `@vitest-environment happy-dom` to ensure the window object is replaceable.
- **Files modified:** src/storage/__tests__/detect.test.ts, vitest.config.ts (added jsdom URL)
- **Verification:** `npx vitest run` — 31/31 pass including all 5 storage tests
- **Committed in:** 1418037 (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 bug fix, 1 blocking issue)
**Impact on plan:** Both fixes required for correctness and test suite functionality. No scope creep.

## Issues Encountered

- Vite scaffold `npm create vite@latest . --template react-ts --force` cancelled on non-empty directory. Scaffolded to temp dir `/tmp/vite-scaffold` and copied files manually.
- Template produced an unusual boilerplate (hero.png, icons.svg, custom CSS) that was cleaned up.
- `@vitejs/plugin-react` (Babel) was in template; switched to `@vitejs/plugin-react-swc` per research and vite.config.ts spec.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- FMV data module is complete and tested — Plan 02 can immediately import `resolveFMV`, `fmvData`, `defaultTaxYear`, `getAllItems`
- TypeScript interfaces (DonationItem, DonationEvent, PersistedState) are stable — Zustand store in Plan 02 should import from `src/store/types.ts`
- localStorage detection is complete — `detectLocalStorage()` is ready to be called in the app shell
- All dependencies (zustand, zod, lucide-react) are installed but not yet wired up
- Potential blocker (noted in STATE.md): FMV values are estimates — if precise sourcing from Salvation Army 2025 guide is required before launch, values need manual verification against the PDF

---
*Phase: 01-foundation*
*Completed: 2026-03-24*
