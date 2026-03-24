---
phase: 02-core-ui
verified: 2026-03-24T00:00:00Z
status: human_needed
score: 17/17 must-haves verified
human_verification:
  - test: "Full end-to-end workflow on mobile and desktop"
    expected: "All 19 steps from Plan 04 Task 3 pass: search items, add to event, toggle condition, drag FMV slider, adjust quantity, see live totals update, threshold flags appear at $250/$500/$5K, inline edit/delete work, keyboard navigation works in combobox"
    why_human: "Visual, interactive, and real-time behavior cannot be verified programmatically"
  - test: "Responsive layout at 375px mobile width"
    expected: "Single-column layout with no horizontal scroll; all controls readable and tappable"
    why_human: "Requires browser viewport resizing and visual inspection"
  - test: "Screen reader announcements for live total and threshold flags"
    expected: "aria-live=polite on grand total announces updates; role=alert on threshold flags announces immediately"
    why_human: "Requires AT (VoiceOver/NVDA) to verify announcement behavior"
---

# Phase 2: Core UI Verification Report

**Phase Goal:** Users can find items, set condition and quantity, log multiple donation events, and see a live-updating deduction total with contextual IRS compliance flags — all on mobile and desktop
**Verified:** 2026-03-24
**Status:** human_needed — all automated checks pass; 3 items require human testing
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can toggle between Poor/Good/Excellent and FMV range updates immediately | VERIFIED | `ConditionToggle.tsx` calls `resolveFMV()` + `updateItem` atomically on change; pattern confirmed |
| 2 | User can drag a slider to select FMV within the condition range, defaulting to mid | VERIFIED | `FMVRangePicker.tsx` uses `onChange` (not `onMouseUp`); default on add is `fmv_selected: range.mid` in both ItemSearch and CatalogBrowser |
| 3 | User can adjust quantity with +/- buttons or direct number entry (1-99) | VERIFIED | `QuantityEditor.tsx` uses `Math.max(1,...)` / `Math.min(99,...)` for buttons; clamps on blur/Enter for direct entry; local string state avoids premature clamping |
| 4 | Poor-condition items show strikethrough total and red IRC 170(f)(16) warning | VERIFIED | `ItemCard/index.tsx` applies `line-through text-brand-400` when `!deductible`; aside with `role="alert" bg-red-50` contains "IRC section 170(f)(16)" |
| 5 | Items valued over $5,000 show amber qualified appraisal warning | VERIFIED | `ItemCard/index.tsx` checks `deductible && lineTotal > 5000`; renders `bg-amber-50 border-amber-200` aside with "Form 8283 Section B" text |
| 6 | Items with irsNote show the note text below the item name | VERIFIED | `ItemCard/index.tsx` renders `{item.irsNote && <p>...{item.irsNote}</p>}` |
| 7 | User sees a live-updating grand total that changes as items are added or modified | VERIFIED | `TotalsDashboard/index.tsx` subscribes to `selectGrandTotal` via `useDonationStore`; `aria-live="polite" aria-atomic="true"` on the total paragraph |
| 8 | User sees breakdown of totals by item category | VERIFIED | `CategoryBreakdown.tsx` receives `selectTotalsByCategory` result from parent; renders non-empty entries |
| 9 | User sees breakdown of totals by donation date | VERIFIED | `EventBreakdown.tsx` renders formatted date + org + per-event total using O(1) Map lookup from `selectEventThresholdFlags` |
| 10 | Amber warning appears when aggregate total exceeds $500 mentioning Form 8283 Section A | VERIFIED | `ThresholdFlags.tsx` subscribes to `selectAggregateThresholdFlags`; renders `role="alert"` aside with "Form 8283 Section A required" when `requiresForm8283SectionA` |
| 11 | Amber warning appears naming specific items valued over $5,000 requiring qualified appraisal | VERIFIED | `ThresholdFlags.tsx` renders "Qualified appraisal required" aside with `flags.highValueItemName` interpolated; `selectAggregateThresholdFlags` finds first `fmv_selected > 5000` item |
| 12 | Threshold flags appear/disappear reactively as totals cross thresholds | VERIFIED | `ThresholdFlags` returns null when neither flag active; no animation classes; immediate DOM insertion |
| 13 | User can create a new donation event with date and organization name | VERIFIED | `AddEventForm.tsx` dispatches `addEvent({ date, organization })` on submit with required date guard |
| 14 | User can see all donation events listed with their items | VERIFIED | `DonationEventList/index.tsx` maps events to `<DonationEventCard>`; `DonationEventCard` maps `event.items` to `<ItemCard>` |
| 15 | User can edit the date and organization of an existing event inline | VERIFIED | `EventHeader.tsx` toggles edit mode showing date/org inputs; `handleEditSave` dispatches `updateEvent(event.id, { date, organization })` |
| 16 | User can delete an entire donation event with inline confirmation | VERIFIED | `EventHeader.tsx` toggles `isDeleting` showing `<DeleteConfirmation>`; `DeleteConfirmation` uses `useRef`+`useEffect` for programmatic focus; `onConfirm` calls `removeEvent` |
| 17 | User can type a partial item name and see matching results in a dropdown | VERIFIED | `ItemSearch.tsx` filters via `getAllItems(taxYear).filter(...)` with `useMemo`; ARIA combobox pattern with `role="option"` list; keyboard: ArrowDown/Up/Enter/Escape |

**Score:** 17/17 truths verified

---

## Required Artifacts

| Artifact | Status | Notes |
|----------|--------|-------|
| `src/components/ItemCard/ConditionToggle.tsx` | VERIFIED | Exports `ConditionToggle`; fieldset + sr-only legend; calls `resolveFMV` + `updateItem` atomically |
| `src/components/ItemCard/FMVRangePicker.tsx` | VERIFIED | Exports `FMVRangePicker`; `aria-label` + `aria-valuetext`; "Charity guide estimate" attribution present |
| `src/components/ItemCard/QuantityEditor.tsx` | VERIFIED | Exports `QuantityEditor`; `<Minus>` + `<Plus>` from lucide-react; `disabled={item.quantity <= 1}` |
| `src/components/ItemCard/index.tsx` | VERIFIED | Exports `ItemCard`; `<article aria-label>`; `isDeductible` wired; both compliance asides present |
| `src/components/TotalsDashboard/index.tsx` | VERIFIED | Exports `TotalsDashboard`; `selectGrandTotal`; `aria-live="polite"` + `aria-atomic="true"`; returns null when no events |
| `src/components/TotalsDashboard/CategoryBreakdown.tsx` | VERIFIED | Exports `CategoryBreakdown`; `uppercase tracking-wide` heading; returns null when empty |
| `src/components/TotalsDashboard/EventBreakdown.tsx` | VERIFIED | Exports `EventBreakdown`; `toLocaleDateString` with UTC-safe `T00:00:00` append |
| `src/components/TotalsDashboard/ThresholdFlags.tsx` | VERIFIED | Exports `ThresholdFlags`; two `role="alert"` asides; returns null when inactive; no animation classes |
| `src/components/DonationEventCard/index.tsx` | VERIFIED | Exports `DonationEventCard`; renders `<ItemCard>` per item; `showItemPicker` wired to `<ItemSearch>` + `<CatalogBrowser>` |
| `src/components/DonationEventCard/EventHeader.tsx` | VERIFIED | Exports `EventHeader`; `<Pencil>` + `<Trash2>`; `<time dateTime>`; inline edit with Save/Cancel; `updateEvent` + `removeEvent` |
| `src/components/DonationEventCard/EventThresholdFlag.tsx` | VERIFIED | Exports `EventThresholdFlag`; `role="alert"`; "written acknowledgment" text; returns null when not visible |
| `src/components/DonationEventCard/DeleteConfirmation.tsx` | VERIFIED | Exports `DeleteConfirmation`; `useRef<HTMLButtonElement>` + `useEffect` for programmatic focus; `bg-red-600` confirm button |
| `src/components/DonationEventList/index.tsx` | VERIFIED | Exports `DonationEventList`; `aria-label="Donation events"`; toggles `<AddEventForm>` vs CTA; returns null when empty |
| `src/components/AddEventForm.tsx` | VERIFIED | Exports `AddEventForm`; `<form>`; `aria-required="true"`; `aria-describedby="event-date-hint"`; dispatches `addEvent` |
| `src/components/ItemCatalog/ItemSearch.tsx` | VERIFIED | Exports `ItemSearch`; ARIA combobox pattern complete; `getAllItems` + `addItem` + `resolveFMV('good')` wired |
| `src/components/ItemCatalog/CatalogBrowser.tsx` | VERIFIED | Exports `CatalogBrowser`; `getCategories` + `getAllItems`; 7-icon map; drill-down detail view |
| `src/App.tsx` | VERIFIED | Imports `TotalsDashboard`, `ThresholdFlags`, `DonationEventList`; `space-y-6` wrapper; conditional rendering on `hasEvents`; no placeholder text |
| `src/store/index.ts` | VERIFIED | `updateEvent` action present; shallow-merges date/org patch; all other actions (`addItem`, `removeItem`, `updateItem`, `addEvent`, `removeEvent`) present |
| `src/store/selectors.ts` | VERIFIED | All four selectors present: `isDeductible`, `selectGrandTotal`, `selectTotalsByCategory`, `selectEventThresholdFlags`, `selectAggregateThresholdFlags` |

---

## Key Link Verification

| From | To | Via | Status |
|------|----|-----|--------|
| `ConditionToggle.tsx` | `src/store/index.ts` | `updateItem(eventId, item.id, { condition, fmv_low, fmv_mid, fmv_high, fmv_selected })` | WIRED |
| `FMVRangePicker.tsx` | `src/store/index.ts` | `updateItem(eventId, item.id, { fmv_selected: Number(e.target.value) })` | WIRED |
| `QuantityEditor.tsx` | `src/store/index.ts` | `updateItem(eventId, item.id, { quantity: ... })` on increment/decrement/blur/Enter | WIRED |
| `ItemCard/index.tsx` | `src/store/selectors.ts` | `isDeductible(item)` imported and called for both compliance warning conditions | WIRED |
| `TotalsDashboard/index.tsx` | `src/store/selectors.ts` | `useDonationStore(selectGrandTotal)` + `useDonationStore(selectTotalsByCategory)` | WIRED |
| `ThresholdFlags.tsx` | `src/store/selectors.ts` | `useDonationStore(selectAggregateThresholdFlags)` | WIRED |
| `DonationEventCard/index.tsx` | `src/components/ItemCard/index.tsx` | `{event.items.map(item => <ItemCard ...>)}` | WIRED |
| `AddEventForm.tsx` | `src/store/index.ts` | `useDonationStore((s) => s.addEvent)` called on form submit | WIRED |
| `EventHeader.tsx` | `src/store/index.ts` | `removeEvent` + `updateEvent` both extracted and called | WIRED |
| `ItemSearch.tsx` | `src/data/fmv.ts` | `getAllItems(taxYear)` for filtering; `resolveFMV(slug, 'good', taxYear)` on select | WIRED |
| `ItemSearch.tsx` | `src/store/index.ts` | `useDonationStore((s) => s.addItem)` called in `handleSelect` | WIRED |
| `CatalogBrowser.tsx` | `src/data/fmv.ts` | `getCategories(taxYear)` + `getAllItems(taxYear)` + `resolveFMV` on select | WIRED |
| `App.tsx` | `TotalsDashboard/index.tsx` | `{hasEvents && <TotalsDashboard />}` | WIRED |
| `App.tsx` | `DonationEventList/index.tsx` | `{hasEvents ? <DonationEventList /> : <EmptyState />}` | WIRED |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ITEM-01 | 02-04 | Type-ahead autocomplete search across all categories | SATISFIED | `ItemSearch.tsx` — combobox with `getAllItems` filter + keyboard nav |
| ITEM-02 | 02-04 | Browse items by category when not searching | SATISFIED | `CatalogBrowser.tsx` — 7-category grid with drill-down lists |
| ITEM-03 | 02-01 | FMV low/mid/high range shown per item per condition | SATISFIED | `FMVRangePicker.tsx` — displays `$X low`, `$X selected`, `$X high`; updates on condition change |
| ITEM-04 | 02-01 | User can adjust FMV via slider, average as default | SATISFIED | `FMVRangePicker.tsx` — `<input type="range">`; items added with `fmv_selected: range.mid` |
| ITEM-05 | 02-01 | Toggle condition, FMV range updates accordingly | SATISFIED | `ConditionToggle.tsx` — `resolveFMV()` called on change, all FMV fields reset atomically |
| ITEM-06 | 02-01 | Contextual IRS compliance notes per item category | SATISFIED | `ItemCard/index.tsx` — `{item.irsNote && <p>...}` renders catalog-sourced notes |
| ITEM-07 | 02-01 | Poor-condition warning citing IRC §170(f)(16) | SATISFIED | `ItemCard/index.tsx` — red `role="alert"` aside with "IRC section 170(f)(16)" text |
| LOG-01 | 02-03 | Create multiple donation events with date and org | SATISFIED | `AddEventForm.tsx` — dispatches `addEvent({ date, organization })`; date is required |
| LOG-02 | 02-03, 02-04 | Add items to a specific donation event | SATISFIED | `DonationEventCard` toggles `showItemPicker` → `ItemSearch` + `CatalogBrowser` both call `addItem(eventId, ...)` |
| LOG-03 | 02-01 | Set quantity per item with +/- controls | SATISFIED | `QuantityEditor.tsx` — increment/decrement buttons with disabled guards |
| LOG-04 | 02-01, 02-04 | Bulk-enter quantity for high-volume donations | SATISFIED | `QuantityEditor.tsx` — `<input type="number">` direct entry with clamp on blur/Enter; supports up to 99 |
| LOG-05 | 02-01 | Edit or remove items from a donation event | SATISFIED | `ItemCard/index.tsx` — remove button calls `removeItem(eventId, item.id)`; controls update via `updateItem` |
| LOG-06 | 02-03 | Edit or delete entire donation events | SATISFIED | `EventHeader.tsx` — inline edit (date/org) with `updateEvent`; inline delete with `DeleteConfirmation` + `removeEvent` |
| DASH-01 | 02-02 | Live-updating running total | SATISFIED | `TotalsDashboard/index.tsx` — `useDonationStore(selectGrandTotal)` with `aria-live="polite"` |
| DASH-02 | 02-02 | Visual breakdown by donation date | SATISFIED | `EventBreakdown.tsx` — per-event date + org + total rows |
| DASH-03 | 02-02 | Visual breakdown by item category | SATISFIED | `CategoryBreakdown.tsx` — per-category total with capitalized slug labels |
| DASH-04 | 02-03 | $250 per-event threshold flag | SATISFIED | `EventThresholdFlag.tsx` — amber band with "written acknowledgment" when `eventTotal > 250` |
| DASH-05 | 02-02 | $500 aggregate threshold flag (Form 8283 Section A) | SATISFIED | `ThresholdFlags.tsx` — "Form 8283 Section A required" when `requiresForm8283SectionA` |
| DASH-06 | 02-01, 02-02 | $5,000 per-item threshold flag (qualified appraisal) | SATISFIED | Both `ItemCard` (per-line-total) and `ThresholdFlags` (per-unit-fmv) surface this warning — see note below |
| DASH-07 | 02-02 | Threshold flags appear contextually as totals change | SATISFIED | All flags are reactive Zustand subscriptions; `ThresholdFlags` returns null when inactive; no animation delay |

---

## Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `src/store/selectors.ts` line 121 vs `ItemCard/index.tsx` line 47 | `$5K check: selectors uses fmv_selected > 5000 (unit FMV); ItemCard uses lineTotal > 5000 (fmv_selected * quantity)` | Info | The aggregate `ThresholdFlags` banner triggers on a single item's unit FMV exceeding $5K (matching IRS per-item rule). The `ItemCard` amber aside triggers on the line total (qty × FMV), which is more conservative and user-helpful. Both are intentional per IRS semantics but the two thresholds diverge for high-quantity items. For example: 3 shirts at $2000 FMV each shows the ItemCard amber warning (lineTotal = $6000) but NOT the ThresholdFlags banner (unit FMV = $2000 < $5000). This is arguably correct per IRS rules but worth human review. |

No blocker anti-patterns found. No TODO/FIXME/placeholder stub comments in any phase 2 file. All `return null` instances are legitimate conditional renders. TypeScript passes with zero errors.

---

## Human Verification Required

### 1. Full End-to-End Workflow

**Test:** Run `npm run dev`, open http://localhost:5173. Complete the full workflow: (1) verify EmptyState shows on fresh load, (2) click "Add Donation Event", fill date and "Goodwill", submit, (3) click "Add item to this donation", type "jeans", click a result, (4) toggle condition to Poor and verify strikethrough + red warning, toggle back to Good, (5) drag FMV slider and verify live update, (6) use +/- quantity buttons and type a value directly, (7) add items until event total > $250 to verify amber event flag, (8) add items until grand total > $500 to verify Form 8283 ThresholdFlag, (9) verify TotalsDashboard shows correct grand total + category + date breakdowns, (10) click pencil icon to edit event inline, (11) click trash icon and verify focused delete confirmation, (12) open CatalogBrowser, verify 7 category tiles, click one, add an item.

**Expected:** All interactions work, all dollar amounts update live, all IRS flags appear/disappear reactively, no layout breakage.

**Why human:** Visual behavior, real-time reactivity, and interactive state changes cannot be verified programmatically.

### 2. Mobile Responsive Layout at 375px

**Test:** Open Chrome DevTools, set viewport to 375px width. Scroll through the full app with at least one event containing items.

**Expected:** Single-column layout throughout. ItemCard controls stack vertically (ConditionToggle, FMVRangePicker, QuantityEditor in a column). TotalsDashboard readable. No horizontal scroll bar. All buttons and inputs tappable at finger scale.

**Why human:** Responsive layout requires visual inspection at actual viewport dimensions.

### 3. Screen Reader Accessibility

**Test:** Enable VoiceOver (macOS) or NVDA (Windows). Navigate to the app, add an event and item, then adjust the FMV slider and toggle condition to Poor.

**Expected:** (a) Grand total is re-announced after FMV/quantity changes due to `aria-live="polite"`. (b) Poor-condition warning is immediately announced when condition switches to Poor due to `role="alert"`. (c) ThresholdFlags banners are announced when they appear. (d) ComboBox announces "X results available" when search dropdown opens. (e) DeleteConfirmation announces and focuses the Delete button when the inline confirmation appears.

**Why human:** Screen reader announcement behavior requires AT software to verify.

---

## Summary

All 17 observable truths are verified. All 19 required artifacts exist, are substantive, and are wired to the store and each other. All 20 requirement IDs (ITEM-01 through ITEM-07, LOG-01 through LOG-06, DASH-01 through DASH-07) are satisfied with direct code evidence. TypeScript passes with zero errors.

One informational finding: the `$5,000 per-item` check differs between `ThresholdFlags` (unit `fmv_selected`) and `ItemCard` (line total `fmv_selected * quantity`). Both behaviors are defensible under IRS rules but they diverge for multi-quantity high-value items. This deserves human review but does not block the phase goal.

Status is `human_needed` because visual layout, real-time interactivity, and screen reader behavior cannot be verified by code inspection alone. All automated checks pass.

---

_Verified: 2026-03-24_
_Verifier: Claude (gsd-verifier)_
