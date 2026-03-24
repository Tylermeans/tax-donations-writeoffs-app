---
phase: 02-core-ui
plan: 03
subsystem: ui
tags: [react, zustand, tailwind, lucide-react, typescript]

# Dependency graph
requires:
  - phase: 02-core-ui/02-01
    provides: ItemCard component rendered inside DonationEventCard
  - phase: 01-foundation
    provides: Zustand store with DonationEvent/DonationItem types, selectors, theme tokens

provides:
  - DonationEventCard with EventHeader (inline edit + delete confirmation), EventThresholdFlag, ItemCard list, Add item CTA
  - DeleteConfirmation inline pattern with programmatic focus via useRef+useEffect
  - EventThresholdFlag amber per-event $250 IRS written acknowledgment warning
  - DonationEventList — ordered event card list with Add Donation Event CTA toggle
  - AddEventForm — controlled form dispatching addEvent with date validation
  - updateEvent store action for shallow-merge edits to event date/organization

affects: [02-04-item-search, 03-export]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - UTC-safe date parsing: append T00:00:00 to YYYY-MM-DD before Date constructor
    - Inline delete confirmation: swap icon for confirmation UI in-place, focus confirm button on mount
    - Programmatic focus for AT: useRef+useEffect to move focus on component mount rather than role="alert"
    - Parent computes event total and passes to child header (no extra store subscription)
    - data-event-card attribute on wrapper divs for useEffect querySelector focus management

key-files:
  created:
    - src/components/DonationEventCard/index.tsx
    - src/components/DonationEventCard/EventHeader.tsx
    - src/components/DonationEventCard/EventThresholdFlag.tsx
    - src/components/DonationEventCard/DeleteConfirmation.tsx
    - src/components/DonationEventList/index.tsx
    - src/components/AddEventForm.tsx
  modified:
    - src/store/index.ts

key-decisions:
  - "updateEvent added to store using shallow-merge (not delete/re-add) to preserve items during edit"
  - "EventHeader inline edit uses local state for date/org initialized from event; dispatches updateEvent on save"
  - "DeleteConfirmation uses programmatic focus (useRef+useEffect) not role=alert — moves user to action position"
  - "DonationEventList returns null when empty — App.tsx renders EmptyState at correct spacing level"
  - "eventTotal computed inline in DonationEventCard from isDeductible — avoids extra store selector subscription"
  - "data-event-card + querySelector in DonationEventList useEffect for post-add focus management"

patterns-established:
  - "Inline confirmation pattern: swap icon with DeleteConfirmation component + programmatic focus on mount"
  - "UTC-safe date display: new Date(isoDate + 'T00:00:00') for local-timezone rendering"
  - "Event total computed at card level, passed as prop to header — co-located data, no prop drilling"

requirements-completed: [LOG-01, LOG-02, LOG-06, DASH-04]

# Metrics
duration: 3min
completed: 2026-03-24
---

# Phase 2 Plan 03: Donation Event Management UI Summary

**Full donation event CRUD UI: DonationEventCard with inline edit/delete, per-event $250 IRS threshold flag, DonationEventList with Add CTA, AddEventForm with date validation, and updateEvent store action**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-24T12:49:52Z
- **Completed:** 2026-03-24T12:52:57Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Built complete DonationEventCard composing EventHeader, EventThresholdFlag, ItemCard list, and Add item CTA with Plan-04 item picker toggle stub
- Implemented inline edit mode in EventHeader with date/org inputs and Save/Cancel, backed by new updateEvent store action that shallow-merges patches without losing event items
- DeleteConfirmation inline pattern with programmatic focus (useRef + useEffect) moves keyboard/AT users to the confirm button immediately on mount
- EventThresholdFlag renders amber IRS warning band when per-event deductible total exceeds $250 per IRS Publication 1771
- DonationEventList renders event cards and toggles AddEventForm vs accent CTA button, with post-add focus management routing user to new event's Add item button
- AddEventForm validates required date field, dispatches addEvent, resets fields, and calls onComplete to collapse the form

## Task Commits

1. **Task 1: DonationEventCard with header, threshold flag, and delete confirmation** - `21270c6` (feat)
2. **Task 2: DonationEventList and AddEventForm** - `6bd2f9e` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/components/DonationEventCard/index.tsx` — Container card: EventHeader + EventThresholdFlag + ItemCard list + Add item CTA with showItemPicker toggle
- `src/components/DonationEventCard/EventHeader.tsx` — View mode (date/org/total + edit/delete) and edit mode (inline date+org inputs + Save/Cancel)
- `src/components/DonationEventCard/EventThresholdFlag.tsx` — Amber role=alert band for $250 per-event IRS threshold
- `src/components/DonationEventCard/DeleteConfirmation.tsx` — Inline confirm/cancel with programmatic focus via useRef+useEffect
- `src/components/DonationEventList/index.tsx` — Ordered event list, returns null when empty, Add Donation Event CTA/form toggle, post-add focus management
- `src/components/AddEventForm.tsx` — Controlled form: date (required + aria-required + aria-describedby hint), organization (optional), dispatches addEvent
- `src/store/index.ts` — Added updateEvent action: shallow-merges date/org patch into matching event

## Decisions Made

- **updateEvent via shallow-merge, not delete/re-add:** Re-adding an event would clear all items. Shallow-merge preserves items and is simpler than reconstruct-and-insert.
- **Programmatic focus over role="alert" for DeleteConfirmation:** Moving focus to the confirm button serves both AT announcement and correct cursor position — a single mechanism does both jobs.
- **DonationEventList returns null when empty:** App.tsx handles EmptyState rendering at the correct spacing level (py-16 full-page empty state). Embedding EmptyState here would result in wrong vertical rhythm.
- **eventTotal computed inline in DonationEventCard:** The event data is already available as a prop; running isDeductible inline avoids an extra selector subscription and keeps the computation co-located with the flag visibility check.
- **data-event-card attribute + querySelector for post-add focus:** Using a data attribute as a stable DOM hook for the focus effect avoids coupling to internal component class names or structure.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Self-Check: PASSED

All 7 files confirmed on disk. Task commits 21270c6 and 6bd2f9e confirmed in git log.

## Next Phase Readiness

- Plan 04 (ItemSearch) can now wire its item picker into `DonationEventCard` — the `showItemPicker` local state and toggle button are already in place, just awaiting the `<ItemSearch>` render target
- `DonationEventList` is ready to be composed into `App.tsx` alongside the existing `EmptyState` and `TotalsDashboard` components
- All TypeScript interfaces remain stable; no changes to DonationEvent or DonationItem shapes

---
*Phase: 02-core-ui*
*Completed: 2026-03-24*
