---
phase: 03-export-and-persistence
plan: 01
subsystem: persistence
tags: [zod, zustand, localStorage, json, file-download, file-import, react, typescript]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: store types (PersistedState, DonationItem, DonationEvent), Zustand persist middleware already wired, defaultTaxYear()
  - phase: 02-core-ui
    provides: AppShell color palette (brand-* classes) used for button styling

provides:
  - src/storage/schema.ts — Zod v4 schema for PersistedState validation (PersistedStateSchema, ValidatedPersistedState)
  - src/storage/backup.ts — exportJSON (Blob/anchor download) and importJSON (FileReader + Zod) utilities
  - src/store/index.ts — replaceAll action for atomic bulk import + Zod-guarded migrate callback
  - src/components/ExportJSONButton.tsx — Save Backup button ready for UI wiring
  - src/components/ImportBackupButton.tsx — Restore Backup button with file picker, validation, inline feedback

affects: [03-02-PLAN.md — UI wiring plan imports these components; future schema migrations use PersistedStateSchema as guard]

# Tech tracking
tech-stack:
  added: []  # No new dependencies — zod already installed at ^4.3.6
  patterns:
    - Zod v4 safeParse guard in Zustand migrate callback — graceful reset instead of crash on corrupt localStorage
    - Blob + URL.createObjectURL + anchor click for file download (no library needed)
    - FileReader.readAsText + Zod safeParse for file import with typed error callbacks
    - Hidden file input controlled via useRef — allows full button styling freedom
    - Inline error/success state with useEffect auto-dismiss (no alert())

key-files:
  created:
    - src/storage/schema.ts
    - src/storage/backup.ts
    - src/components/ExportJSONButton.tsx
    - src/components/ImportBackupButton.tsx
  modified:
    - src/store/index.ts

key-decisions:
  - "Zod v4 (not v3) — project has zod@^4.3.6 installed; import from 'zod' resolves to v4"
  - "exportedAt timestamp added to backup payload — helps users identify the most recent backup file"
  - "FileReader + Zod callbacks pattern (not Promise) — consistent with FileReader event-based API"
  - "Auto-dismiss feedback at 5s via useEffect cleanup — avoids stale state on unmount"
  - "replaceAll forces schemaVersion: 1 as const — prevents imported data from setting an invalid version"

patterns-established:
  - "Pattern: Zod safeParse in Zustand migrate — import PersistedStateSchema and call safeParse(persistedState); reset to defaultTaxYear()/empty on failure"
  - "Pattern: Hidden file input for styled file picker — <input type=file class=sr-only tabIndex=-1> triggered by button.click() via useRef"
  - "Pattern: Inline feedback with auto-dismiss — useState({ type, message }) + useEffect(setTimeout 5000) + cleanup return"

requirements-completed: [PERS-01, PERS-02, PERS-03, PERS-04]

# Metrics
duration: 4min
completed: 2026-03-26
---

# Phase 3 Plan 01: Export and Persistence Summary

**Zod v4 schema guard on localStorage hydration + JSON export (Blob/anchor download) + JSON import (FileReader + Zod validation) with two standalone button components**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-26T18:33:14Z
- **Completed:** 2026-03-26T18:37:29Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Zod v4 PersistedStateSchema mirrors PersistedState exactly — guards hydration from corrupt localStorage instead of crashing
- replaceAll store action enables atomic import; Zod-guarded migrate replaces placeholder stub
- exportJSON and importJSON utility functions isolated from React for independent testability
- ExportJSONButton and ImportBackupButton ready to wire into the UI (Plan 02)

## Task Commits

Each task was committed atomically:

1. **Task 1: Zod v4 schema + replaceAll store action + migrate guard** - `6dbd724` (feat)
2. **Task 2: JSON backup utilities + Export/Import button components** - `2790c59` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/storage/schema.ts` — Zod v4 schema: ConditionSchema, DonationItemSchema, DonationEventSchema, PersistedStateSchema, ValidatedPersistedState type
- `src/storage/backup.ts` — exportJSON (Blob + anchor download with Firefox fix + URL revoke) and importJSON (FileReader + safeParse + error callbacks)
- `src/store/index.ts` — Added replaceAll action to interface + implementation; replaced placeholder migrate with Zod-guarded version that resets to clean empty state on validation failure
- `src/components/ExportJSONButton.tsx` — Save Backup button with Download lucide icon, aria-label, cursor-pointer, focus-visible ring
- `src/components/ImportBackupButton.tsx` — Restore Backup button with hidden file input, Zod-validated import, inline error/success feedback (no alert()), confirm dialog before data replacement

## Decisions Made

- Zod v4 (not v3) — project has `zod@^4.3.6` installed; `import { z } from 'zod'` resolves to v4. API is identical for the primitives used here.
- `exportedAt` ISO timestamp added to backup payload alongside the PersistedState fields — helps users identify the most recent backup when managing multiple files.
- FileReader + callbacks pattern (not Promise) — consistent with the FileReader event-based API; caller (ImportBackupButton) handles UI state without async/await complexity.
- `replaceAll` forces `schemaVersion: 1 as const` — prevents an imported backup from setting an invalid schema version even if the file was manually edited.
- Inline feedback with `useEffect` auto-dismiss at 5 seconds — avoids stale state on component unmount via cleanup `clearTimeout`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- ExportJSONButton and ImportBackupButton are standalone components ready to wire into AppShell or a settings section in Plan 02.
- PersistedStateSchema is available for import in any future migration logic.
- No blockers for Plan 02.

---
*Phase: 03-export-and-persistence*
*Completed: 2026-03-26*
