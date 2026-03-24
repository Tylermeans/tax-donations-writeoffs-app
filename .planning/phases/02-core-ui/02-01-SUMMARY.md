---
phase: 02-core-ui
plan: 01
subsystem: item-card
tags: [components, item-controls, fmv, condition, compliance, accessibility]
dependency_graph:
  requires:
    - src/store/index.ts (useDonationStore, updateItem, removeItem)
    - src/store/selectors.ts (isDeductible)
    - src/store/types.ts (DonationItem interface)
    - src/data/fmv.ts (resolveFMV, Condition type, FMVRange interface)
  provides:
    - src/components/ItemCard/ConditionToggle.tsx (ConditionToggle component)
    - src/components/ItemCard/FMVRangePicker.tsx (FMVRangePicker component)
    - src/components/ItemCard/QuantityEditor.tsx (QuantityEditor component)
    - src/components/ItemCard/index.tsx (ItemCard composite)
  affects:
    - Any component that renders a donation item (EventCard, search results)
tech_stack:
  added: []
  patterns:
    - Controlled radio inputs via hidden input + styled label for ConditionToggle
    - Local string state for QuantityEditor input to allow natural digit typing before commit
    - role=alert on compliance warning asides for immediate AT announcement
    - Tailwind arbitrary variants [&::-webkit-slider-thumb] for native range thumb styling
key_files:
  created:
    - src/components/ItemCard/ConditionToggle.tsx
    - src/components/ItemCard/FMVRangePicker.tsx
    - src/components/ItemCard/QuantityEditor.tsx
    - src/components/ItemCard/index.tsx
  modified: []
decisions:
  - "QuantityEditor uses local string state (not direct store value) to allow typing multi-digit numbers without premature clamping"
  - "ItemCard does not hold updateItem from store directly — sub-components own their update dispatch to avoid prop drilling"
  - "FMVRangePicker passes taxYear prop for source attribution line, even though the slider range comes from the stored item values"
metrics:
  duration: "~20 minutes"
  completed: "2026-03-24"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 02 Plan 01: ItemCard Components Summary

**One-liner:** Four-component ItemCard system with condition-gated FMV range picker, quantity stepper, and live IRS compliance warnings for §170(f)(16) exclusion and $5K appraisal threshold.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Build atomic item controls | `b944b6d` | ConditionToggle.tsx, FMVRangePicker.tsx, QuantityEditor.tsx |
| 2 | Build ItemCard composite with compliance warnings | `75b7bd2` | index.tsx |

## What Was Built

### ConditionToggle (src/components/ItemCard/ConditionToggle.tsx)

Three-segment radio toggle implemented as a `<fieldset>` with a visually hidden `<legend>` for screen reader group labeling. Hidden `<input type="radio">` elements wrapped in styled `<label>` elements give the visual control. On condition change, calls `resolveFMV()` to get the full new FMV range and writes `condition`, `fmv_low`, `fmv_mid`, `fmv_high`, and `fmv_selected` atomically to avoid any transient inconsistency.

Color states: Poor = red-100/red-700, Good = brand-600/white, Excellent = brand-500/white. Unselected = white/brand-600 with hover:brand-50.

### FMVRangePicker (src/components/ItemCard/FMVRangePicker.tsx)

Native `<input type="range">` with Tailwind arbitrary variants for cross-browser slider thumb styling (WebKit + Firefox). Updates `fmv_selected` on every `onChange` event (not `onMouseUp`) so the line total in ItemCard responds live during drag. ARIA attributes: `aria-label` with range bounds, `aria-valuetext` with current dollar value.

Source attribution line always shows: "Charity guide estimate · Salvation Army {taxYear} valuation guide".

### QuantityEditor (src/components/ItemCard/QuantityEditor.tsx)

Inline +/- stepper using Lucide `<Minus>` and `<Plus>` icons. Decrement disabled at quantity=1, increment disabled at quantity=99. Direct number input uses local string state to allow multi-digit typing without premature clamping — value commits to store on blur or Enter keypress, clamped to 1–99.

### ItemCard (src/components/ItemCard/index.tsx)

Composite `<article>` element with responsive layout (flex-col mobile, flex-row md+). Computes `lineTotal = fmv_selected * quantity`. Applies `line-through text-brand-400` to non-deductible item totals. Shows two conditional compliance warnings:

1. **Poor-condition exclusion** (`!isDeductible(item)`): red aside with `role="alert"` citing IRC §170(f)(16) — immediately announced by screen readers when condition switches to Poor.
2. **$5K per-item threshold** (`isDeductible && lineTotal > 5000`): amber aside with `role="alert"` requiring qualified appraisal and Form 8283 Section B.

Remove button (X icon) fires `removeItem(eventId, item.id)` with `aria-label="Remove {item.name}"`.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria from both tasks pass. `npx tsc --noEmit` exits clean.

## Self-Check: PASSED

| Check | Result |
|-------|--------|
| src/components/ItemCard/ConditionToggle.tsx | FOUND |
| src/components/ItemCard/FMVRangePicker.tsx | FOUND |
| src/components/ItemCard/QuantityEditor.tsx | FOUND |
| src/components/ItemCard/index.tsx | FOUND |
| .planning/phases/02-core-ui/02-01-SUMMARY.md | FOUND |
| Commit b944b6d (Task 1) | FOUND |
| Commit 75b7bd2 (Task 2) | FOUND |
| `npx tsc --noEmit` | PASS (0 errors) |
