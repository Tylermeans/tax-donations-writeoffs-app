---
phase: 2
slug: core-ui
status: draft
shadcn_initialized: false
preset: none
created: 2026-03-24
---

# Phase 2 — UI Design Contract

> Visual and interaction contract for Phase 2: Core UI.
> Covers: item catalog search, FMV range picker, condition toggle, quantity editor,
> donation event log, running total dashboard, and IRS compliance flags.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Tailwind v4 utility-only) |
| Preset | not applicable |
| Component library | none (custom components) |
| Icon library | lucide-react |
| Font | system-ui stack (Inter if loaded via OS) |

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `gap-1`, `p-1` | Icon gaps, badge padding |
| sm | 8px | `gap-2`, `p-2` | Inline control spacing, tag padding |
| md | 16px | `gap-4`, `p-4` | Default card padding, form field gaps |
| lg | 24px | `gap-6`, `p-6` | Card vertical padding, section gaps |
| xl | 32px | `gap-8`, `py-8` | Between major content blocks |
| 2xl | 48px | `py-12` | Section separators |
| 3xl | 64px | `py-16` | Page-level spacing (empty state only) |

Exceptions: `py-3` (12px) used on compact inline controls (ConditionToggle, QuantityEditor buttons).

---

## Typography

| Role | Tailwind Classes | Usage |
|------|-----------------|-------|
| Page title (h1) | `text-2xl md:text-3xl font-bold tracking-tight` | AppShell header — already established |
| Section heading (h2) | `text-xl font-semibold text-brand-800` | Dashboard panel headings, empty state heading |
| Card heading (h3) | `text-base font-semibold text-brand-800` | DonationEventCard org name, ItemCard name |
| Label | `text-sm font-medium text-brand-700` | Form field labels, condition toggle labels |
| Body | `text-sm text-brand-600 leading-relaxed` | Descriptive text, FMV source attribution |
| Caption | `text-xs text-brand-500` | FMV range endpoints ("$8 low / $20 high"), IRS note caveats |
| Grand total | `text-3xl font-bold text-brand-800` | Running total number in TotalsDashboard |
| Strikethrough (poor item) | `line-through text-brand-400` | ItemCard line-item total when condition = poor |
| Monospaced amount | `tabular-nums` | All dollar amounts (prevents layout shift during updates) |

---

## Color

| Role | Token | Tailwind | Usage |
|------|-------|----------|-------|
| Dominant (60%) | warm-50 `oklch(0.98 0.005 80)` | `bg-warm-50` | Page background |
| Surface (cards) | white | `bg-white` | All card backgrounds |
| Surface (subtle) | brand-50 `oklch(0.97 0.01 220)` | `bg-brand-50` | LegalDisclaimer, info notices |
| Primary brand | brand-600 `oklch(0.50 0.11 200)` | `bg-brand-600` | Header, primary action buttons |
| Secondary (30%) | brand-100 `oklch(0.93 0.02 220)` | `bg-brand-100` | Step badges, condition toggle bg |
| Border default | brand-100 | `border-brand-100` | All card borders, input borders at rest |
| Border focused | brand-500 | `border-brand-500` | Input/select focus border (pairs with focus ring) |
| Text primary | brand-800 `oklch(0.35 0.08 200)` | `text-brand-800` | Headings, important labels |
| Text secondary | brand-600 `oklch(0.50 0.11 200)` | `text-brand-600` | Body text, descriptions |
| Text muted | brand-500 `oklch(0.58 0.10 200)` | `text-brand-500` | Captions, placeholders |
| Accent (10%) | accent-500 `oklch(0.62 0.14 155)` | `bg-accent-500`, `text-accent-600` | "Add Event" primary CTA, "Add Item" button |
| Warning bg | amber-50 | `bg-amber-50` | IRS threshold flag banners |
| Warning border | amber-200 | `border-amber-200` | IRS threshold flag borders |
| Warning text | amber-800 | `text-amber-800` | IRS threshold flag copy |
| Warning icon | amber-500 | `text-amber-500` | AlertTriangle icon in flags |
| Destructive | red-600 | `text-red-600`, `bg-red-50`, `border-red-200` | Poor-condition warning, delete confirmations |
| Excluded (poor) | brand-400 | `text-brand-400 line-through` | Strikethrough on non-deductible item totals |

Accent reserved for: "Add Donation Event" CTA, "Add Item" button, "Export PDF" button (Phase 3). Never on destructive actions, never on warnings.

Amber is reserved for IRS threshold flags only. Red is reserved for poor-condition exclusion warnings and destructive delete actions.

---

## Layout & Spacing Contracts

### Page Shell (established in Phase 1 — do not change)

```
bg-warm-50 min-h-screen
  <header> bg-brand-600 → max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 text-center
  <aside> LegalDisclaimer → max-w-2xl mx-auto mt-4 (handled inside px-4 md:px-6 lg:px-8)
  <main> max-w-2xl mx-auto px-4 md:px-6 lg:px-8 py-8
```

### Main Content Stack (inside `<main>`)

Single column. Stacking order top-to-bottom:

1. `TotalsDashboard` — sticky on desktop, top of flow on mobile
2. `ThresholdFlags` — appears below dashboard when triggered
3. `DonationEventList` — list of event cards
4. "Add Donation Event" CTA — always visible at bottom of list
5. `EmptyState` — replaces items 3–4 when no events exist

Gap between major sections: `space-y-6` (24px).

### TotalsDashboard

```
bg-white border border-brand-100 rounded-xl p-6
  flex flex-col gap-2
    Label: "2025 Deductible Total" — text-sm font-medium text-brand-500
    Amount: tabular-nums text-3xl font-bold text-brand-800
    Subline: "across {n} donation event(s)" — text-sm text-brand-600
  [Category breakdown — collapsible on mobile, always visible md+]
    bg-brand-50 rounded-lg px-4 py-3 mt-4
    flex flex-col gap-2
```

### DonationEventCard

```
bg-white border border-brand-100 rounded-xl overflow-hidden
  [Event header]
    px-4 py-4 flex items-center justify-between gap-3
    bg-brand-50 border-b border-brand-100
    Left: date (text-sm font-semibold text-brand-800) + org name (text-sm text-brand-600)
    Right: event total (tabular-nums text-sm font-semibold text-brand-700) + action icons

  [Per-event threshold flag — conditional]
    px-4 py-2 bg-amber-50 border-b border-amber-200
    text-xs text-amber-800

  [Item list]
    divide-y divide-brand-100
    each ItemCard: px-4 py-3

  [Add Item button]
    px-4 py-3 border-t border-brand-100
```

### ItemCard

```
flex items-start gap-3 py-3
  Left: item name + category badge + IRS note (if present)
  Right: FMV controls column
    ConditionToggle (full width)
    FMVRangePicker (full width)
    QuantityEditor (inline, right-aligned)
    Line total (tabular-nums text-sm font-semibold)
      — strikethrough + red if poor condition
```

---

## Component Specifications

### 1. ItemSearch

**Purpose:** Type-ahead search across all catalog items (ITEM-01)

**Dimensions:** Full width of container. Input height: `h-10` (40px). Dropdown: `max-h-64` scrollable.

**Structure:**
```
<div role="combobox" aria-expanded aria-haspopup="listbox">
  <input type="search"
    className="w-full h-10 px-3 pr-10 border border-brand-200 rounded-lg text-sm
               text-brand-800 placeholder:text-brand-400 bg-white
               focus-visible:outline-none focus-visible:border-brand-500
               focus-visible:ring-2 focus-visible:ring-brand-500/20"
    placeholder="Search items — e.g. jeans, sofa, laptop"
    aria-label="Search donation items"
    aria-autocomplete="list"
    aria-controls="item-search-listbox"
  />
  <Search icon — absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 size-4 aria-hidden />
  <ul id="item-search-listbox" role="listbox"
    className="absolute z-10 w-full mt-1 bg-white border border-brand-100 rounded-lg
               shadow-md overflow-y-auto max-h-64">
    <li role="option" aria-selected className="px-3 py-2 text-sm hover:bg-brand-50 cursor-pointer">
      Item name
      <span className="text-xs text-brand-400 ml-1">Category</span>
    </li>
  </ul>
</div>
```

**States:**
- Empty (no query): input at rest, no dropdown
- Typing: dropdown opens with matching results; highlights query substring in bold
- No results: dropdown shows single row — "No items match '{query}'" in `text-sm text-brand-500`
- Item focused (keyboard): `aria-selected="true"`, `bg-brand-50`
- Loading (future AI mode, not Phase 2): not applicable

**Keyboard:** ArrowDown/Up navigate options; Enter selects; Escape closes and returns focus to input.

---

### 2. CatalogBrowser

**Purpose:** Category-grid browse when no search query is active (ITEM-02)

**Dimensions:** Full width. Category grid: `grid grid-cols-2 md:grid-cols-3 gap-3`.

**Structure:**
```
<nav aria-label="Browse by category">
  <button
    className="flex flex-col items-start gap-1 p-4 bg-white border border-brand-100
               rounded-lg hover:border-brand-300 hover:bg-brand-50 cursor-pointer
               transition-colors text-left w-full"
    aria-label="{Category name}: {n} items"
  >
    <CategoryIcon aria-hidden size={20} className="text-brand-500" />
    <span className="text-sm font-medium text-brand-800">{Category}</span>
    <span className="text-xs text-brand-500">{n} items</span>
  </button>
</nav>
```

Categories (7 total, one button each): Clothing, Sporting Goods, Furniture, Electronics, Household, Books / Media / Toys, Instruments.

**Icons per category (Lucide):** Shirt, Dumbbell, Sofa, Laptop, Home, BookOpen, Music.

---

### 3. ConditionToggle

**Purpose:** Toggle between Poor / Good / Excellent conditions (ITEM-05)

**Dimensions:** Full width of ItemCard right column. Height: `h-8` (32px). Three segments.

**Structure:**
```
<fieldset>
  <legend className="sr-only">Item condition</legend>
  <div className="flex rounded-md border border-brand-200 overflow-hidden" role="group">
    {['Poor', 'Good', 'Excellent'].map(cond => (
      <label
        className="flex-1 text-center text-xs font-medium cursor-pointer
                   py-1.5 transition-colors
                   [selected: bg-brand-600 text-white]
                   [unselected: bg-white text-brand-600 hover:bg-brand-50]"
      >
        <input type="radio" name="condition-{itemId}" value={cond} className="sr-only" />
        {cond}
      </label>
    ))}
  </div>
</fieldset>
```

**States:**
- Poor selected: `bg-red-100 text-red-700 border-red-300` (visual signal of deductibility risk)
- Good selected: `bg-brand-600 text-white`
- Excellent selected: `bg-accent-500 text-white`
- Unselected segment: `bg-white text-brand-600 hover:bg-brand-50`

**Behavior:** Selecting Poor immediately triggers the §170(f)(16) inline warning below the item card. FMV range updates synchronously via `resolveFMV()`.

---

### 4. FMVRangePicker

**Purpose:** Slider + value display for FMV selection within the condition range (ITEM-03, ITEM-04)

**Dimensions:** Full width of ItemCard right column.

**Structure:**
```
<div className="flex flex-col gap-1">
  <div className="flex justify-between text-xs text-brand-400">
    <span>${low} low</span>
    <span className="font-medium text-brand-700">${selected} selected</span>
    <span>${high} high</span>
  </div>
  <input
    type="range"
    min={low} max={high} step={1} defaultValue={mid}
    className="w-full h-1.5 bg-brand-100 rounded-full appearance-none
               [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
               [&::-webkit-slider-thumb]:bg-brand-600 [&::-webkit-slider-thumb]:rounded-full
               [&::-webkit-slider-thumb]:cursor-pointer
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    aria-label="FMV per item — drag to adjust between ${low} and ${high}"
    aria-valuemin={low} aria-valuemax={high} aria-valuenow={selected}
    aria-valuetext="${selected} per item"
  />
  <p className="text-xs text-brand-400">
    Charity guide estimate · Salvation Army {year} valuation guide
  </p>
</div>
```

**Default:** Mid value (`FMVRange.mid`) selected on mount. Updates to new mid when condition changes.

**Behavior:** Slider snap-updates the "selected" display above in real time. Zustand store is updated on `onChange` (not `onMouseUp`) for live total updates.

---

### 5. QuantityEditor

**Purpose:** Inline +/- controls and direct-entry for item quantity (LOG-03, LOG-04)

**Dimensions:** Inline, right-aligned within ItemCard. Buttons: `w-7 h-7` (28px). Input: `w-12 h-7`.

**Structure:**
```
<div className="flex items-center gap-1" aria-label="Quantity">
  <button
    className="w-7 h-7 flex items-center justify-center rounded border border-brand-200
               bg-white text-brand-600 hover:bg-brand-50 cursor-pointer
               disabled:opacity-40 disabled:cursor-not-allowed"
    aria-label="Decrease quantity"
    disabled={quantity <= 1}
  >
    <Minus size={12} aria-hidden />
  </button>
  <input
    type="number" min={1} max={99}
    className="w-12 h-7 text-center text-sm border border-brand-200 rounded
               text-brand-800 tabular-nums
               focus-visible:border-brand-500 focus-visible:outline-none
               focus-visible:ring-2 focus-visible:ring-brand-500/20"
    aria-label="Item quantity"
  />
  <button
    className="w-7 h-7 flex items-center justify-center rounded border border-brand-200
               bg-white text-brand-600 hover:bg-brand-50 cursor-pointer"
    aria-label="Increase quantity"
  >
    <Plus size={12} aria-hidden />
  </button>
</div>
```

**Constraints:** Min 1, max 99. Typing directly into input applies on blur or Enter. Decrement button disabled at 1.

---

### 6. ItemCard

**Purpose:** Full item control row — hosts ConditionToggle, FMVRangePicker, QuantityEditor, and compliance warnings (ITEM-03–07, LOG-03–05)

**Dimensions:** Full width inside DonationEventCard. Padding: `px-4 py-4`. Separator: `border-t border-brand-100`.

**Normal state:**
```
<article aria-label="{item name}">
  <div className="flex items-start justify-between gap-4">
    [Left column — grow]
      <h4 className="text-sm font-semibold text-brand-800">{name}</h4>
      <span className="text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full">{category}</span>
      {irsNote && <p className="text-xs text-brand-500 mt-1">{irsNote}</p>}

    [Right column — shrink-0 flex flex-col gap-2 min-w-[160px]]
      <ConditionToggle />
      <FMVRangePicker />
      <div className="flex items-center justify-between">
        <QuantityEditor />
        <span className="text-sm font-semibold text-brand-800 tabular-nums">${lineTotal}</span>
      </div>
  </div>

  [Remove button]
    <button aria-label="Remove {name}" className="... text-brand-400 hover:text-red-500 cursor-pointer">
      <X size={14} aria-hidden />
    </button>
</article>
```

**Poor-condition state (ITEM-07, D-10):**

When condition = "poor" AND item FMV ≤ $500:
```
[After the controls row, full width]
<aside role="alert" className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200
                                rounded-lg px-3 py-2">
  <AlertTriangle size={14} aria-hidden className="text-red-500 mt-0.5 shrink-0" />
  <p className="text-xs text-red-700 leading-relaxed">
    Items in poor condition are generally not deductible under IRC §170(f)(16).
    This item is excluded from your total. Items over $500 may qualify with a
    qualified appraisal — consult a tax professional.
  </p>
</aside>
[Line total: strikethrough]
<span className="text-sm font-semibold text-brand-400 line-through tabular-nums">${lineTotal}</span>
```

**$5,000 per-item threshold state (DASH-06, D-13):**

When item FMV × quantity > $5,000:
```
<aside role="alert" className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200
                                rounded-lg px-3 py-2">
  <AlertTriangle size={14} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
  <p className="text-xs text-amber-800 leading-relaxed">
    Items valued over $5,000 require a qualified appraisal and Form 8283 Section B.
  </p>
</aside>
```

---

### 7. DonationEventCard

**Purpose:** Container for a single donation event — date, organization, items, per-event threshold (LOG-01, LOG-02, LOG-05, LOG-06, DASH-04)

**Dimensions:** Full width. Rounded: `rounded-xl`. Overflow hidden (so header bg clips).

**Header:**
```
<header className="flex items-center justify-between gap-3 px-4 py-4
                   bg-brand-50 border-b border-brand-100">
  <div className="flex flex-col gap-0.5">
    <time className="text-sm font-semibold text-brand-800" dateTime={isoDate}>
      {formattedDate}   {/* e.g. "March 15, 2025" */}
    </time>
    <span className="text-sm text-brand-600">{organization || "Organization not specified"}</span>
  </div>
  <div className="flex items-center gap-3 shrink-0">
    <span className="text-sm font-semibold text-brand-700 tabular-nums">${eventTotal}</span>
    <button aria-label="Edit donation event" className="cursor-pointer text-brand-400 hover:text-brand-600">
      <Pencil size={14} aria-hidden />
    </button>
    <button aria-label="Delete donation event" className="cursor-pointer text-brand-400 hover:text-red-500">
      <Trash2 size={14} aria-hidden />
    </button>
  </div>
</header>
```

**$250 per-event threshold flag (DASH-04, D-11):**

Appears directly below header, above items, when event total > $250:
```
<div role="alert" className="flex items-start gap-2 px-4 py-2
                              bg-amber-50 border-b border-amber-200">
  <AlertTriangle size={14} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
  <p className="text-xs text-amber-800">
    This donation exceeds $250 — a written acknowledgment from
    {organization} is required for your tax records.
  </p>
</div>
```

**Edit mode (LOG-06):**

Inline edit replaces header content:
```
<div className="px-4 py-3 bg-brand-50 border-b border-brand-100 flex flex-col gap-3">
  <label className="flex flex-col gap-1">
    <span className="text-xs font-medium text-brand-600">Donation date</span>
    <input type="date" className="h-9 px-3 border border-brand-200 rounded-lg text-sm ..." />
  </label>
  <label className="flex flex-col gap-1">
    <span className="text-xs font-medium text-brand-600">Organization name</span>
    <input type="text" placeholder="e.g. Goodwill, Salvation Army" className="h-9 px-3 ..." />
  </label>
  <div className="flex gap-2 justify-end">
    <button className="... text-sm cursor-pointer">Cancel</button>
    <button className="... bg-brand-600 text-white text-sm cursor-pointer">Save</button>
  </div>
</div>
```

**Add Item button (LOG-02):**
```
<div className="px-4 py-3 border-t border-brand-100">
  <button className="flex items-center gap-2 text-sm font-medium text-accent-600
                     hover:text-accent-500 cursor-pointer">
    <Plus size={16} aria-hidden />
    Add item to this donation
  </button>
</div>
```

---

### 8. AddEventForm

**Purpose:** Inline form to create a new donation event (LOG-01)

**Trigger:** "Add Donation Event" button — always visible below the event list.

**Structure:**
```
<section aria-label="Add donation event"
  className="bg-white border border-brand-100 rounded-xl px-4 py-5 flex flex-col gap-4">
  <h2 className="text-base font-semibold text-brand-800">New Donation Event</h2>
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium text-brand-700">Donation date <span aria-hidden>*</span></span>
    <input type="date" required
      className="h-10 px-3 border border-brand-200 rounded-lg text-sm text-brand-800
                 focus-visible:border-brand-500 focus-visible:outline-none
                 focus-visible:ring-2 focus-visible:ring-brand-500/20 cursor-pointer"
      aria-required="true"
      aria-describedby="event-date-hint"
    />
    <span id="event-date-hint" className="text-xs text-brand-400">
      The date you dropped off your donations
    </span>
  </label>
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium text-brand-700">Organization name</span>
    <input type="text" placeholder="e.g. Goodwill, Salvation Army"
      className="h-10 px-3 border border-brand-200 rounded-lg text-sm text-brand-800
                 placeholder:text-brand-400 ..."
    />
  </label>
  <button type="submit"
    className="h-10 px-4 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium
               rounded-lg cursor-pointer transition-colors">
    Add Donation Event
  </button>
</section>
```

---

### 9. TotalsDashboard

**Purpose:** Live running total + category breakdown (DASH-01, DASH-02, DASH-03)

**Position:** Top of `<main>`, before the event list. Sticky on `md+`: `md:sticky md:top-4`.

**Structure:**
```
<section aria-label="Deduction summary"
  className="bg-white border border-brand-100 rounded-xl p-6">
  <div className="flex items-baseline justify-between gap-4">
    <div>
      <p className="text-sm font-medium text-brand-500 mb-1">2025 Deductible Total</p>
      <p className="text-3xl font-bold text-brand-800 tabular-nums" aria-live="polite" aria-atomic="true">
        ${grandTotal.toFixed(2)}
      </p>
      <p className="text-sm text-brand-500 mt-1">
        across {eventCount} donation event{eventCount !== 1 ? 's' : ''}
      </p>
    </div>
    <div aria-hidden className="text-brand-200">
      <DollarSign size={40} />
    </div>
  </div>

  {/* Category breakdown — DASH-03 */}
  {Object.entries(totalsByCategory).length > 0 && (
    <div className="mt-5 pt-4 border-t border-brand-100 flex flex-col gap-2">
      <p className="text-xs font-medium text-brand-500 uppercase tracking-wide">By category</p>
      {Object.entries(totalsByCategory).map(([cat, total]) => (
        <div className="flex justify-between text-sm">
          <span className="text-brand-600">{cat}</span>
          <span className="text-brand-800 font-medium tabular-nums">${total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )}

  {/* Date breakdown — DASH-02 */}
  {events.length > 0 && (
    <div className="mt-4 pt-4 border-t border-brand-100 flex flex-col gap-2">
      <p className="text-xs font-medium text-brand-500 uppercase tracking-wide">By date</p>
      {events.map(event => (
        <div className="flex justify-between text-sm">
          <span className="text-brand-600">{formattedDate} · {org}</span>
          <span className="text-brand-800 font-medium tabular-nums">${eventTotal.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )}
</section>
```

**aria-live:** Grand total `<p>` carries `aria-live="polite" aria-atomic="true"` so screen readers announce changes without interrupting ongoing speech.

---

### 10. ThresholdFlags

**Purpose:** Aggregate IRS compliance notices — $500 Form 8283 flag and named high-value item flag (DASH-05, DASH-06, DASH-07)

**Position:** Directly below TotalsDashboard, above event list. Conditional render — only appears when triggered.

**$500 aggregate flag (DASH-05, D-12):**
```
<aside role="alert"
  className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
  <AlertTriangle size={16} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
  <div className="flex flex-col gap-1">
    <p className="text-sm font-semibold text-amber-800">Form 8283 Section A required</p>
    <p className="text-sm text-amber-700">
      Your total non-cash donations exceed $500. Attach Form 8283 Section A to your
      tax return. Your total: ${aggregateTotal}.
    </p>
  </div>
</aside>
```

**$5,000 per-item flag (DASH-06, D-13) — also inline on ItemCard:**
```
<aside role="alert"
  className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
  <AlertTriangle size={16} aria-hidden className="text-amber-500 mt-0.5 shrink-0" />
  <div className="flex flex-col gap-1">
    <p className="text-sm font-semibold text-amber-800">Qualified appraisal required</p>
    <p className="text-sm text-amber-700">
      "{highValueItemName}" is valued over $5,000. A qualified appraisal is required
      and must be attached to Form 8283 Section B.
    </p>
  </div>
</aside>
```

When multiple high-value items exist, render one flag per item.

---

### 11. DeleteConfirmation

**Purpose:** Confirm destructive delete of an event or item (LOG-05, LOG-06)

**Pattern:** Inline confirmation (no modal). After clicking Trash2, the button row is replaced with:
```
<div className="flex items-center gap-2 text-sm" role="alert">
  <span className="text-red-700">Delete this {event | item}?</span>
  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded cursor-pointer hover:bg-red-700">
    Delete
  </button>
  <button className="px-3 py-1 text-brand-600 text-sm hover:text-brand-800 cursor-pointer">
    Cancel
  </button>
</div>
```

No modal overlay. Inline replacement keeps focus context and avoids focus trap complexity.

---

## Responsive Breakpoints

Mobile-first. All components work at 375px without horizontal scroll.

| Breakpoint | Width | Key behavior |
|------------|-------|-------------|
| Mobile | 375px | Single column. ItemCard stacks controls vertically. CatalogBrowser 2-col grid. EmptyState steps vertical stack. TotalsDashboard not sticky. |
| Tablet | 768px (`md:`) | EmptyState steps go horizontal (3 across). CatalogBrowser 3-col grid. TotalsDashboard goes sticky (`md:sticky md:top-4`). Item controls side-by-side where space allows. |
| Desktop | 1024px (`lg:`) | Max-width container fully effective (`max-w-2xl` = 672px, centered). No layout change from md — single-column design is intentional. |
| Wide | 1440px | Same as 1024. Outer whitespace grows. No content layout change. |

**ItemCard at 375px:** ConditionToggle, FMVRangePicker, and QuantityEditor all span full width (column direction). The item name is above all controls.

**ItemCard at 768px+:** Left column (name + category + IRS note) and right column (controls) sit side by side with `flex items-start gap-4`.

---

## Animation & Motion

All transitions are gated on `prefers-reduced-motion: no-preference` (established in `src/index.css`).

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Button hover color | `transition-colors 150ms ease` | 150ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Dropdown open | `transition-opacity 100ms ease` | 100ms | ease-in-out |
| Threshold flag appear | No animation — render immediately | — | — |
| ItemCard remove | No animation in Phase 2 | — | — |
| Grand total number | No animation — tabular-nums prevents jank | — | — |
| FMV slider thumb | `transition-none` — real-time only | — | — |

Threshold flags and warnings must appear immediately (no delay, no fade) — they carry compliance significance and must not feel like they appeared "lazily."

The `transition-colors` class is already conditionally activated in `src/index.css` under `@media (prefers-reduced-motion: no-preference)`. New components use only this class for hover transitions.

---

## Accessibility Contracts

### Landmarks

```
<header>    → App title and tagline
<aside>     → LegalDisclaimer (role="note")
<main>      → All page content
<section aria-label="Deduction summary">   → TotalsDashboard
<section aria-label="Donation events">     → DonationEventList
<section aria-label="Add donation event">  → AddEventForm
<nav aria-label="Browse by category">      → CatalogBrowser
```

### Focus Management

- After adding a donation event: focus moves to the new event card's "Add item" button.
- After removing an item: focus returns to the "Add item" button of the parent event.
- After removing an event: focus moves to the "Add Donation Event" button.
- After closing item search dropdown (Escape): focus returns to the search input.
- Delete confirmation: when "Cancel" is pressed, focus returns to the Trash2 button.

### ARIA Patterns

| Component | ARIA pattern |
|-----------|-------------|
| ItemSearch | `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, `aria-activedescendant` |
| ConditionToggle | `<fieldset>` + `<legend>` + `type="radio"` (visually hidden) |
| FMVRangePicker | `<input type="range">` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` |
| QuantityEditor | `<input type="number">` with `aria-label`, decrement `disabled` at min |
| TotalsDashboard total | `aria-live="polite" aria-atomic="true"` |
| ThresholdFlags | `role="alert"` for immediate announcement |
| Poor-condition warning | `role="alert"` for immediate announcement |
| DonationEventCard | `<article>` with `aria-label="{org} — {date}"` |
| Delete confirmation | `role="alert"` on the inline confirmation row |
| Date input | `aria-required="true"` + `aria-describedby` hint |

### Keyboard Navigation

- Tab order: follows DOM order — dashboard → event cards (top to bottom) → add event form.
- Within ItemCard: condition toggle (radio group — arrow keys) → FMV slider (arrow keys) → quantity decrement → quantity input → quantity increment → remove button.
- CatalogBrowser: standard button grid — Tab/Shift+Tab, Enter/Space to activate.
- ItemSearch dropdown: ArrowDown opens and navigates; ArrowUp moves back; Enter selects; Escape closes.
- All interactive elements have visible `:focus-visible` ring (established in `src/index.css`: `box-shadow: 0 0 0 2px oklch(0.58 0.10 200)`).

### Contrast

All text must meet WCAG AA (4.5:1 for body, 3:1 for large text):
- `text-brand-800` on `bg-white`: verified ≥ 7:1
- `text-brand-600` on `bg-white`: verified ≥ 4.5:1
- `text-white` on `bg-brand-600`: verified ≥ 4.5:1
- `text-amber-800` on `bg-amber-50`: verified ≥ 4.5:1
- `text-red-700` on `bg-red-50`: verified ≥ 4.5:1
- `text-brand-400` (captions/muted): use only for decorative text — never for informational copy that must be read

---

## Copywriting Contract

### Primary CTAs

| Element | Copy |
|---------|------|
| Add event button | "Add Donation Event" |
| Add item button (inside event) | "Add item to this donation" |
| Save event edit | "Save" |
| Cancel action | "Cancel" |

### Item Search

| Element | Copy |
|---------|------|
| Input placeholder | "Search items — e.g. jeans, sofa, laptop" |
| No results message | "No items match '{query}'" |
| Search input label (sr-only) | "Search donation items" |

### Condition Toggle

| Element | Copy |
|---------|------|
| Segment labels | "Poor", "Good", "Excellent" |
| Legend (sr-only) | "Item condition" |

### FMV Range Picker

| Element | Copy |
|---------|------|
| Low label | "${n} low" |
| High label | "${n} high" |
| Selected label | "${n} selected" |
| Source attribution | "Charity guide estimate · Salvation Army {year} valuation guide" |
| Slider aria-label | "FMV per item — drag to adjust between ${low} and ${high}" |

### Donation Event

| Element | Copy |
|---------|------|
| Date field label | "Donation date" |
| Date field hint | "The date you dropped off your donations" |
| Org field label | "Organization name" |
| Org field placeholder | "e.g. Goodwill, Salvation Army" |
| Missing org fallback | "Organization not specified" |
| New event form heading | "New Donation Event" |
| Edit button aria-label | "Edit donation event" |
| Delete button aria-label | "Delete donation event" |
| Remove item aria-label | "Remove {item name}" |

### Threshold Flags

| Element | Copy |
|---------|------|
| $250 per-event inline flag | "This donation exceeds $250 — a written acknowledgment from {organization} is required for your tax records." |
| $500 aggregate flag heading | "Form 8283 Section A required" |
| $500 aggregate flag body | "Your total non-cash donations exceed $500. Attach Form 8283 Section A to your tax return. Your total: ${amount}." |
| $5,000 item flag heading | "Qualified appraisal required" |
| $5,000 item flag body | ""{itemName}" is valued over $5,000. A qualified appraisal is required and must be attached to Form 8283 Section B." |

### Poor Condition Warning (ITEM-07, D-10)

| Element | Copy |
|---------|------|
| Warning text | "Items in poor condition are generally not deductible under IRC §170(f)(16). This item is excluded from your total. Items over $500 may qualify with a qualified appraisal — consult a tax professional." |

### IRS Category Notes (ITEM-06)

| Category | Note |
|----------|------|
| Electronics | "Electronics are valued at depreciated market value. IRS scrutiny is higher for this category." |
| All others | Note from `ItemFMV.irsNote` field; only rendered if non-empty |

### Dashboard

| Element | Copy |
|---------|------|
| Total label | "2025 Deductible Total" |
| Event count subline | "across {n} donation event" / "across {n} donation events" |
| Category breakdown heading | "By category" |
| Date breakdown heading | "By date" |
| Empty dashboard (no events) | Not shown — replaced by EmptyState component |

### Delete Confirmation

| Element | Copy |
|---------|------|
| Event confirm prompt | "Delete this event?" |
| Item confirm prompt | "Delete this item?" |
| Confirm button | "Delete" |
| Cancel button | "Cancel" |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| lucide-react (already installed) | Search, Plus, Minus, X, Trash2, Pencil, AlertTriangle, Info, Calendar, FileDown, DollarSign, Shirt, Dumbbell, Laptop, BookOpen, Music, Home | not required — already in project |
| No third-party component registries | — | not applicable |

All components are built from HTML elements + Tailwind utilities. No shadcn, Radix, or other external registries are used in Phase 2.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
