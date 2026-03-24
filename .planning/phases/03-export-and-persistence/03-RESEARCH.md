# Phase 3: Export and Persistence - Research

**Researched:** 2026-03-24
**Domain:** @react-pdf/renderer v4 PDF generation, Zustand persist middleware v5, browser file download, JSON import/export
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EXPO-01 | User can generate a PDF summary of all donations matching IRS non-cash contribution format | @react-pdf/renderer v4 API confirmed: `usePDF` hook or `pdf().toBlob()` for browser download; lazy-load via `React.lazy` to keep initial bundle slim |
| EXPO-02 | PDF includes donor info, organization names, donation dates, item list with quantities and FMV, and totals | `DonationReport` receives a snapshot of store state; `selectGrandTotal` / `selectTotalsByCategory` selectors already exist for totals; `PersistedState` shape has all required fields |
| EXPO-03 | PDF includes Form 8283 field reference callouts where applicable | IRS Form 8283 (Dec 2025) Section A column map confirmed from official instructions; callout placement rules documented |
| EXPO-04 | PDF includes legal disclaimer ("This tool provides estimates only. Consult a qualified tax professional.") | Disclaimer text defined in Phase 1 (D-16); placement in PDF footer on every page |
| PERS-01 | User's donation data persists in localStorage across browser sessions | Zustand persist middleware already configured in `src/store/index.ts` with `name: 'donation-itemizer'`, `version: 1`, and `partialize` scoping; no new infrastructure needed |
| PERS-02 | localStorage schema includes version field for future migration support | `schemaVersion: 1` already in `PersistedState` interface; Zustand `version: 1` and `migrate` callback stub already present in store; needs Zod v4 parse guard wired |
| PERS-03 | User can export donation data as a JSON backup file (download) | Native `Blob` + `URL.createObjectURL` + anchor click pattern; no library needed |
| PERS-04 | User can import donation data from a previously exported JSON backup file | `<input type="file" accept=".json">` + `FileReader.readAsText` + Zod v4 schema validation before hydrating store |
</phase_requirements>

---

## Summary

Phase 3 completes the app by adding PDF export and data persistence insurance. The foundation is almost entirely in place from Phases 1 and 2: the Zustand store already has `persist` middleware wired with `version: 1` and a `partialize` selector, `src/storage/detect.ts` already handles localStorage availability, and all necessary selectors exist. The primary new work is: (1) building the `src/pdf/` component tree using `@react-pdf/renderer` v4, (2) lazy-loading that component to avoid a ~300KB bundle hit on initial load, (3) wiring a Zod v4 schema guard on store hydration, and (4) adding JSON export (download) and import (file picker + validate + hydrate) utility functions.

The Zustand persist middleware is already doing the heavy lifting for PERS-01 and PERS-02. The `migrate` callback is already stubbed in the store. What remains is adding a Zod v4 parse guard at the point where localStorage data is read back, so corrupt or schema-mismatched data fails gracefully rather than crashing. **Important**: the project has `zod@^4.3.6` installed (zod v4, not v3), so import patterns differ from what the STACK.md describes — use `import { z } from 'zod'` which resolves to v4 in this project.

The PDF layout follows the `@react-pdf/renderer` flexbox model. No server, no canvas, no rasterization. Built-in PDF fonts (Helvetica family) are available without `Font.register()`, which avoids a known v4 open issue where custom fonts can cause `usePDF` to hang in a loading state indefinitely.

**Primary recommendation:** Build in this order — (1) Zod v4 schema + JSON import/export utilities, (2) PDF document component tree, (3) ExportButton with lazy-load, (4) ImportBackupButton with file picker. Wire all four behind their respective UI triggers, not at app startup.

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@react-pdf/renderer` | NOT YET INSTALLED — must add | PDF generation in browser | Produces vector PDF (selectable text); flexbox layout handles variable item counts; no canvas; ~300KB — lazy-load required |
| `zustand` persist middleware | 5.0.12 (installed) | localStorage persistence | Already configured in `src/store/index.ts`; `version` + `migrate` stub already present |
| `zod` | 4.3.6 (installed — note: v4, not v3) | JSON schema validation for import | `.safeParse()` on raw localStorage/JSON file before hydrating store |

### Supporting (no new installs needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native `Blob` + `URL.createObjectURL` | Browser API | JSON backup download | No library needed; standard pattern for all modern browsers |
| `FileReader.readAsText` | Browser API | JSON backup import | No library needed; sync read of the uploaded file |
| `React.lazy` + `Suspense` | React 19 (installed) | Lazy-load PDF component | Defers ~300KB @react-pdf/renderer until user clicks Export |
| `lucide-react` | 1.0.1 (installed) | Download, Upload, FileText icons for export/import buttons | Already used throughout Phase 2 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-pdf/renderer` | `window.print()` + print CSS | Zero-dep, but user gets OS print dialog, not a file download; no guaranteed layout; cannot set filename |
| `@react-pdf/renderer` | `jsPDF` + `html2canvas` | Rasterized image PDF — text not selectable or searchable; ~2-5MB output; rejected in Phase 1 |
| `usePDF` hook | `pdf().toBlob()` imperative | `pdf()` is fine for button click; `usePDF` is better for download-link pattern; either works here |
| Zod schema guard | Manual type assertion | Type assertions crash on corrupt data; Zod returns `{ success: false }` and preserves app stability |

**Installation:**

```bash
npm install @react-pdf/renderer
```

That is the only new dependency for Phase 3. Everything else is already installed.

---

## Architecture Patterns

### Recommended Project Structure (new files for Phase 3)

```
src/
├── pdf/
│   ├── DonationReport.tsx        # root PDF Document — receives ReportData snapshot
│   ├── ReportHeader.tsx          # donor info (optional) + tax year + generated date
│   ├── EventSection.tsx          # one table per DonationEvent
│   ├── TotalsSection.tsx         # grand total + per-category breakdown
│   ├── IRSNoticeSection.tsx      # Form 8283 callouts + legal disclaimer
│   └── styles.ts                 # StyleSheet.create constants shared across PDF components
├── storage/
│   ├── detect.ts                 # ALREADY EXISTS — localStorage availability test
│   ├── schema.ts                 # NEW — Zod v4 schema for PersistedState; used by import
│   └── backup.ts                 # NEW — exportJSON() and importJSON() utilities
└── components/
    ├── ExportButton/
    │   └── ExportButton.tsx      # lazy-loads DonationReport, triggers usePDF download
    └── ImportBackupButton/
        └── ImportBackupButton.tsx # hidden file input, reads JSON, validates, hydrates store
```

### Pattern 1: Lazy-Loaded PDF Component

**What:** `DonationReport` and all of `@react-pdf/renderer` are only loaded when the user clicks Export.
**When to use:** Always — never import `@react-pdf/renderer` at the top of a screen component.
**Why:** The library is ~300KB. Most users land on the app, enter items, and may never export. Loading it on demand keeps Time-to-Interactive fast.

```typescript
// src/components/ExportButton/ExportButton.tsx
// Source: React docs + @react-pdf/renderer docs (react-pdf.org/advanced)

import React, { Suspense, useState } from 'react'

// Lazy import — @react-pdf/renderer is NOT loaded until ExportContent renders
const ExportContent = React.lazy(() => import('./ExportContent'))

export function ExportButton() {
  const [showPDF, setShowPDF] = useState(false)
  return (
    <>
      <button
        className="cursor-pointer ..."
        onClick={() => setShowPDF(true)}
      >
        Download PDF
      </button>
      {showPDF && (
        <Suspense fallback={<span>Preparing PDF...</span>}>
          <ExportContent onDone={() => setShowPDF(false)} />
        </Suspense>
      )}
    </>
  )
}
```

```typescript
// src/components/ExportButton/ExportContent.tsx
// This file is the lazy boundary — @react-pdf/renderer only loads when this module is imported

import { usePDF } from '@react-pdf/renderer'
import { DonationReport } from '../../pdf/DonationReport'
import { buildReportData } from '../../pdf/buildReportData'
import { useDonationStore } from '../../store'

export function ExportContent({ onDone }: { onDone: () => void }) {
  const state = useDonationStore()
  const reportData = buildReportData(state)
  const [instance] = usePDF({ document: <DonationReport data={reportData} /> })

  if (instance.loading) return <span>Generating PDF...</span>
  if (instance.error) return <span>PDF generation failed. Try again.</span>

  return (
    <a
      href={instance.url ?? '#'}
      download={`donations-${reportData.taxYear}.pdf`}
      className="cursor-pointer ..."
      onClick={onDone}
    >
      Download your PDF
    </a>
  )
}
```

### Pattern 2: PDF Document Component (Snapshot, Not Live Store)

**What:** `DonationReport` receives a plain `ReportData` object, never subscribes to Zustand directly.
**When to use:** At export time only — build the snapshot in `buildReportData()`.
**Why:** @react-pdf/renderer renders in its own context outside the DOM. Direct store subscriptions inside PDF components cause subtle timing bugs and are hard to debug.

```typescript
// src/pdf/buildReportData.ts
// Pure function: DonationStore → ReportData snapshot
import { selectGrandTotal, selectTotalsByCategory, selectAggregateThresholdFlags } from '../store/selectors'
import type { DonationStore } from '../store'

export interface ReportData {
  taxYear: number
  events: DonationStore['events']
  grandTotal: number
  totalsByCategory: Record<string, number>
  thresholds: ReturnType<typeof selectAggregateThresholdFlags>
  generatedAt: string // ISO timestamp for PDF footer
}

export function buildReportData(state: DonationStore): ReportData {
  return {
    taxYear: state.taxYear,
    events: state.events,
    grandTotal: selectGrandTotal(state),
    totalsByCategory: selectTotalsByCategory(state),
    thresholds: selectAggregateThresholdFlags(state),
    generatedAt: new Date().toISOString(),
  }
}
```

### Pattern 3: PDF Document Structure

**What:** The PDF document is built from @react-pdf/renderer primitives with a consistent page layout.
**When to use:** Always — keep PDF components completely separate from screen components.

```typescript
// src/pdf/DonationReport.tsx
// Source: react-pdf.org — Document, Page, View, Text, StyleSheet

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportHeader } from './ReportHeader'
import { EventSection } from './EventSection'
import { TotalsSection } from './TotalsSection'
import { IRSNoticeSection } from './IRSNoticeSection'
import type { ReportData } from './buildReportData'

// Built-in fonts available without Font.register():
// Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique
// Courier, Courier-Bold, Times-Roman, Times-Bold, Times-Italic
// Use built-in fonts only — custom font registration has a known v4 bug
// where usePDF can hang indefinitely in loading state (github.com/diegomura/react-pdf/issues/2675)

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 4,
  },
})

export function DonationReport({ data }: { data: ReportData }) {
  return (
    <Document title={`Donation Summary ${data.taxYear}`}>
      <Page size="LETTER" style={styles.page}>
        <ReportHeader taxYear={data.taxYear} generatedAt={data.generatedAt} />
        {data.events.map((event) => (
          <EventSection key={event.id} event={event} />
        ))}
        <TotalsSection
          grandTotal={data.grandTotal}
          totalsByCategory={data.totalsByCategory}
        />
        <IRSNoticeSection thresholds={data.thresholds} />
        {/* Footer repeats on every page via position: absolute */}
        <View style={styles.footer} fixed>
          <Text>
            These estimates are based on Salvation Army and Goodwill valuation guides.
            Consult a qualified tax professional to verify your deductions qualify.
            Generated by Donation Itemizer on {data.generatedAt.slice(0, 10)}.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

### Pattern 4: Form 8283 Callout Box

**What:** When thresholds are triggered, an IRS notice box appears at the bottom of the PDF with field-level references to Form 8283.
**When to use:** Always render `IRSNoticeSection`; content is conditional on threshold flags.

Form 8283 (Rev. December 2025) Section A fields — confirmed from IRS Instructions (i8283):

| Column | Label | Our Data Field |
|--------|-------|----------------|
| (a) | Organization name and address | `event.organization` |
| (b) | Employer identification number (EIN) | Not collected in v1 — leave blank with note |
| (c) | Description of donated property | `item.name`, `item.category`, `item.condition` |
| (d) | Contribution date | `event.date` |
| (e) | Date acquired (required if item > $500) | Not tracked — note "acquired prior to donation year" |
| (f) | How acquired (required if item > $500) | Not tracked — note "purchase" as safe default |
| (g) | Cost or adjusted basis (required if item > $500) | Not tracked — leave blank with note |
| (h) | Fair market value | `item.fmv_selected * item.quantity` |
| (i) | Method used to determine FMV | "Thrift store value (Salvation Army Valuation Guide 2025)" |

The callout box should list which Form 8283 section is required and note which fields our PDF pre-fills vs. which the taxpayer must complete manually.

### Pattern 5: Zod v4 Schema Guard on Hydration

**What:** Before any persisted data is handed to the store, parse it with a Zod v4 schema to catch shape mismatches or corruption.
**When to use:** On localStorage read (Zustand `migrate` callback) AND on JSON file import.
**Why:** Silent corruption — where data hydrates but has missing/wrong types — causes invisible bugs that are blamed on wrong FMV calculations.

**Critical note on Zod version:** The project has `zod@^4.3.6` installed. The STACK.md references zod v3 APIs, but v4 is a largely compatible upgrade. The `z.safeParse()` pattern is unchanged. Key difference: import from `'zod'` (resolves to v4 in this project).

```typescript
// src/storage/schema.ts
// Zod v4 schema for PersistedState — mirrors src/store/types.ts
// Source: zod.dev/v4

import { z } from 'zod'

const ConditionSchema = z.enum(['poor', 'good', 'excellent'])

const DonationItemSchema = z.object({
  id: z.string(),
  catalogSlug: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.number().int().positive(),
  condition: ConditionSchema,
  fmv_low: z.number().nonnegative(),
  fmv_mid: z.number().nonnegative(),
  fmv_high: z.number().nonnegative(),
  fmv_selected: z.number().nonnegative(),
  irsNote: z.string().optional(),
})

const DonationEventSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  organization: z.string(),
  items: z.array(DonationItemSchema),
})

export const PersistedStateSchema = z.object({
  schemaVersion: z.literal(1),
  taxYear: z.number().int().min(2020).max(2035),
  events: z.array(DonationEventSchema),
})

export type ValidatedPersistedState = z.infer<typeof PersistedStateSchema>
```

```typescript
// Usage in store's migrate callback (src/store/index.ts — update stub)
import { PersistedStateSchema } from '../storage/schema'

migrate: (persistedState, version) => {
  const result = PersistedStateSchema.safeParse(persistedState)
  if (!result.success) {
    // Corrupt or unrecognizable data — return clean initial state
    console.warn('[DonationStore] localStorage data failed validation, resetting', result.error)
    return { schemaVersion: 1 as const, taxYear: defaultTaxYear(), events: [] }
  }
  return result.data
},
```

### Pattern 6: JSON Export (Download)

**What:** Serialize current store state to a `.json` file the user can save locally.
**When to use:** User clicks "Save Backup" button — especially important when localStorage is unavailable (private mode).

```typescript
// src/storage/backup.ts
import type { PersistedState } from '../store/types'

export function exportJSON(state: PersistedState, taxYear: number): void {
  const payload = {
    // Include a timestamp so users can identify which backup to restore
    exportedAt: new Date().toISOString(),
    ...state,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `donation-itemizer-backup-${taxYear}.json`
  // Appending to DOM is not required in modern browsers but prevents some
  // Firefox edge cases where the click event is lost
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Release the object URL immediately after click — no memory leak
  URL.revokeObjectURL(url)
}
```

### Pattern 7: JSON Import (File Picker + Validate + Hydrate)

**What:** User picks a `.json` file, it is read and validated with Zod, then the store is hydrated.
**When to use:** User clicks "Restore Backup" button.

```typescript
// src/storage/backup.ts (continued)
import { PersistedStateSchema } from './schema'
import type { ValidatedPersistedState } from './schema'

export function importJSON(
  file: File,
  onSuccess: (state: ValidatedPersistedState) => void,
  onError: (message: string) => void,
): void {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const raw = JSON.parse(e.target?.result as string)
      const result = PersistedStateSchema.safeParse(raw)
      if (!result.success) {
        onError('This backup file is not compatible with the current app version.')
        return
      }
      onSuccess(result.data)
    } catch {
      onError('Could not read the backup file. Make sure it is a valid JSON file.')
    }
  }
  reader.readAsText(file)
}
```

```typescript
// src/components/ImportBackupButton/ImportBackupButton.tsx
import { useRef } from 'react'
import { importJSON } from '../../storage/backup'
import { useDonationStore } from '../../store'

export function ImportBackupButton() {
  const inputRef = useRef<HTMLInputElement>(null)
  const store = useDonationStore()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    importJSON(
      file,
      (state) => {
        // Hydrate store directly — replace events and taxYear
        store.setTaxYear(state.taxYear)
        // Events need a replaceAll action — see Don't Hand-Roll section
      },
      (msg) => alert(msg), // replace with a proper toast/modal in implementation
    )
    // Reset input so user can re-import same file if needed
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFile}
        className="sr-only"
        aria-label="Import donation backup file"
      />
      <button
        className="cursor-pointer ..."
        onClick={() => inputRef.current?.click()}
      >
        Restore Backup
      </button>
    </>
  )
}
```

### Anti-Patterns to Avoid

- **Importing @react-pdf/renderer at the top of any screen component:** Adds ~300KB to every user's initial load. Always use `React.lazy`.
- **Registering a custom font with `Font.register()` in v4:** There is an active v4 bug (github.com/diegomura/react-pdf/issues/2675) where custom fonts can cause `usePDF` to remain in `loading: true` forever. Use built-in Helvetica/Courier/Times until this is fixed.
- **Storing totals or threshold flags in localStorage:** Persist only raw events and taxYear. Totals are derived at read time by selectors. Storing derived state causes stale-data bugs.
- **Hydrating store without Zod validation:** If the schema changes in a future update (e.g., a new required field on DonationItem), old persisted data will silently hydrate with undefined fields, causing NaN in totals or crashed renders. Always validate first.
- **Using `alert()` for import errors in production:** Wire to a proper error state or toast. The code examples above use `alert()` only as a placeholder.
- **Using `z.string()` for `schemaVersion` in Zod:** The type is `z.literal(1)` — this rejects any non-`1` value and is what triggers the migration path.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF layout and page breaks | Manual coordinate math or canvas rendering | `@react-pdf/renderer` Document/Page/View/Text | Flexbox layout handles variable item counts; vector text is selectable; proper page breaks |
| localStorage persistence with schema migration | Custom `useLocalStorage` hook + manual version tracking | Zustand `persist` middleware (already in place) | Already configured with `version`, `partialize`, and `migrate` stub |
| JSON schema validation on import | Manual `typeof` / `instanceof` checks | Zod v4 `.safeParse()` with `PersistedStateSchema` | Type narrowing, readable errors, and TypeScript inference in one call |
| File download | Server endpoint or third-party library | Native `Blob` + `URL.createObjectURL` | No library needed; browser-native; works in all modern browsers |
| File upload/read | Third-party file-handling library | Native `<input type="file">` + `FileReader` | No library needed; sufficient for single-file JSON import |

**Key insight:** The persistence layer is ~90% already built. Phase 3 is completing and hardening what Phases 1 and 2 scaffolded, not building a new system.

---

## Common Pitfalls

### Pitfall 1: @react-pdf/renderer Imported Eagerly

**What goes wrong:** Developer imports `DonationReport` at the top of `App.tsx` or `ExportButton.tsx`. The ~300KB library loads for every user on every page visit.
**Why it happens:** It feels natural to import at the top of the file where it's used.
**How to avoid:** The PDF component and its `@react-pdf/renderer` import must live behind a `React.lazy(() => import(...))` boundary. Only the lazy wrapper lives in the eagerly-loaded code.
**Warning signs:** `vite build` output shows `@react-pdf/renderer` in the main chunk.

### Pitfall 2: Custom Font Registration Hangs usePDF

**What goes wrong:** `Font.register({ family: 'Inter', src: '...' })` causes `usePDF` to remain in `{ loading: true }` indefinitely, blocking the download.
**Why it happens:** Active bug in @react-pdf/renderer v4 (confirmed open issue: github.com/diegomura/react-pdf/issues/2675). Font loading is async and the Promise can fail silently.
**How to avoid:** Use only built-in fonts: `Helvetica`, `Helvetica-Bold`, `Courier`, `Times-Roman`. These require no `Font.register()` call.
**Warning signs:** Export button shows "Generating..." forever and never transitions to a download link.

### Pitfall 3: Zod v4 Import Confusion

**What goes wrong:** Developer follows the STACK.md (which references zod v3 API notes) and uses `import { z } from 'zod/v3'` or makes assumptions about v3 behavior like `path` option in `safeParse`. The project has `zod@^4.3.6` (v4) installed.
**Why it happens:** STACK.md was written against zod v3; the actual installed version is v4.
**How to avoid:** Import from `'zod'` — this resolves to v4 in this project. The `safeParse` and `z.object/enum/literal/array` APIs are functionally identical between v3 and v4 for this use case. Do not use `path` option in `safeParse` (removed in v4).
**Warning signs:** TypeScript errors about missing exports or unexpected runtime behavior in validation.

### Pitfall 4: No `replaceEvents` Action on Store

**What goes wrong:** JSON import needs to replace all events with the restored set. The current store has no `replaceAllEvents` action — only `addEvent`, `removeEvent`, `updateEvent`. A developer might call `addEvent` for each imported event, which would duplicate data if any events already exist in the store.
**Why it happens:** The store was designed for incremental mutations. Bulk-replace is a new operation needed only for import.
**How to avoid:** Add a `replaceAll(state: PersistedState)` (or `loadBackup`) action to the store that sets `taxYear`, `events`, and `schemaVersion` atomically. This is a one-line addition to the store.
**Warning signs:** After import, the store contains both old events and newly-imported events.

### Pitfall 5: PDF Missing Poor-Condition Strikethrough / Exclusion

**What goes wrong:** The PDF lists all items including poor-condition items under $500, making it appear they are included in the deductible total — but the grand total selector excludes them via `isDeductible()`.
**Why it happens:** The PDF component iterates `event.items` directly without checking `isDeductible()`.
**How to avoid:** Import and apply `isDeductible` from `src/store/selectors.ts` inside `EventSection.tsx`. Poor-condition items under $500 should either be: (a) omitted from the PDF entirely, or (b) listed with a strikethrough and a note "Not deductible — IRC §170(f)(16)". Option (b) is better UX because the user can see why the item is excluded.
**Warning signs:** Grand total on PDF does not match grand total displayed in the app dashboard.

### Pitfall 6: JSON Backup Contains Stale/Incorrect FMV

**What goes wrong:** A user imports a backup from a prior year. The `taxYear` field is 2024 but the app is now serving 2025 FMV data. The imported items have `fmv_low/mid/high` values from the 2024 catalog baked in.
**Why it happens:** FMV values are stored on the item (not derived at read time) so they reflect whatever values were set when the item was added.
**How to avoid:** This is a v1 acceptable tradeoff — the stored `fmv_selected` is the user's explicit choice. Add a UI note after import: "Imported from [date]. FMV values reflect the ranges at the time of entry." Do not silently re-run `resolveFMV()` on import; that would change user-confirmed values.
**Warning signs:** None — this is expected behavior, but needs to be documented in the import success message.

### Pitfall 7: No Donor Info in v1 — PDF Header Must Handle Gracefully

**What goes wrong:** EXPO-02 says "PDF includes donor info" but Phase 1 Decision D-14/D-15 locked "no donor info fields collected in v1." This is a conflict.
**Why it happens:** The spec was written before the no-donor-info decision was locked.
**How to avoid:** The PDF header section should render a placeholder: "Donor: [Complete on Form 8283]". This satisfies the spirit of EXPO-02 while honoring D-14. Do not add a donor name input field in this phase — that is deferred to v2.
**Warning signs:** None, if the planner accounts for this explicitly.

---

## Code Examples

### @react-pdf/renderer: EventSection Table

```typescript
// src/pdf/EventSection.tsx
// Source: react-pdf.org/styling — flexbox row layout for tables

import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { isDeductible } from '../../store/selectors'
import type { DonationEvent } from '../../store/types'

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  sectionHeader: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginBottom: 4 },
  subHeader: { fontSize: 9, color: '#555', marginBottom: 8 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    paddingBottom: 3,
    marginBottom: 3,
  },
  row: { flexDirection: 'row', paddingVertical: 2 },
  rowStrikethrough: { flexDirection: 'row', paddingVertical: 2, opacity: 0.4 },
  // Column widths sum to ~100% of content area
  colName: { width: '40%' },
  colCondition: { width: '15%' },
  colQty: { width: '10%', textAlign: 'right' },
  colFMV: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  strikeNote: { fontSize: 7, color: '#c00', marginTop: 1 },
})

function formatCurrency(n: number): string {
  return `$${n.toFixed(2)}`
}

function formatDate(iso: string): string {
  // Append T00:00:00 to avoid UTC off-by-one (established pattern from Phase 2)
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function EventSection({ event }: { event: DonationEvent }) {
  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionHeader}>{event.organization || 'Unknown Organization'}</Text>
      <Text style={styles.subHeader}>Donation date: {formatDate(event.date)}</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.colName}>Item</Text>
        <Text style={styles.colCondition}>Condition</Text>
        <Text style={styles.colQty}>Qty</Text>
        <Text style={styles.colFMV}>FMV Each</Text>
        <Text style={styles.colTotal}>Line Total</Text>
      </View>
      {event.items.map((item) => {
        const deductible = isDeductible(item)
        return (
          <View key={item.id} style={deductible ? styles.row : styles.rowStrikethrough}>
            <Text style={styles.colName}>
              {item.name}
              {!deductible && (
                <Text style={styles.strikeNote}>{'\n'}Not deductible — IRC §170(f)(16)</Text>
              )}
            </Text>
            <Text style={styles.colCondition}>{item.condition}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colFMV}>{formatCurrency(item.fmv_selected)}</Text>
            <Text style={styles.colTotal}>
              {deductible ? formatCurrency(item.fmv_selected * item.quantity) : '—'}
            </Text>
          </View>
        )
      })}
    </View>
  )
}
```

### @react-pdf/renderer: IRSNoticeSection

```typescript
// src/pdf/IRSNoticeSection.tsx — Form 8283 callouts + legal disclaimer
// Source: IRS Instructions for Form 8283 (Rev. December 2025) — irs.gov/instructions/i8283

import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { selectAggregateThresholdFlags } from '../../store/selectors'

type ThresholdFlags = ReturnType<typeof selectAggregateThresholdFlags>

const styles = StyleSheet.create({
  box: {
    marginTop: 20,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#333',
    backgroundColor: '#f8f8f8',
  },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 6 },
  item: { fontSize: 9, marginBottom: 4 },
  disclaimer: { marginTop: 12, fontSize: 8, color: '#555', fontFamily: 'Helvetica-Oblique' },
})

export function IRSNoticeSection({ thresholds }: { thresholds: ThresholdFlags }) {
  const hasNotice = thresholds.requiresForm8283SectionA || thresholds.requiresQualifiedAppraisal

  return (
    <View style={styles.box}>
      <Text style={styles.title}>IRS Filing Notes</Text>
      {hasNotice ? (
        <>
          {thresholds.requiresForm8283SectionA && (
            <Text style={styles.item}>
              • Total non-cash donations exceed $500 — Form 8283 Section A is required.{'\n'}
              {'  '}Complete columns (a)–(i) for each item group. FMV method (column i):{'\n'}
              {'  '}"Thrift store value — Salvation Army Valuation Guide 2025."
            </Text>
          )}
          {thresholds.requiresQualifiedAppraisal && (
            <Text style={styles.item}>
              • Item "{thresholds.highValueItemName}" exceeds $5,000 — Form 8283 Section B{'\n'}
              {'  '}and a qualified appraisal are required before filing.
            </Text>
          )}
        </>
      ) : (
        <Text style={styles.item}>
          No additional IRS forms required based on totals. If a single event exceeded
          $250, obtain written acknowledgment from that organization.
        </Text>
      )}
      <Text style={styles.disclaimer}>
        DISCLAIMER: This report provides estimates based on Salvation Army and Goodwill
        valuation guides (2025). These are not IRS-authorized values. Fair market value is
        determined by what a buyer would pay for the item in its current condition.
        Consult a qualified tax professional before filing. Donation Itemizer is not
        responsible for the accuracy of your deductions.
      </Text>
    </View>
  )
}
```

### Zustand `replaceAll` Action (needed for JSON import)

```typescript
// Add to src/store/index.ts — DonationStore interface and store implementation

// In interface:
replaceAll: (state: Pick<PersistedState, 'taxYear' | 'events'>) => void

// In store:
replaceAll: (partial) =>
  set(() => ({
    taxYear: partial.taxYear,
    events: partial.events,
    schemaVersion: 1 as const,
  })),
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF + html2canvas for browser PDFs | @react-pdf/renderer for vector PDFs | 2020–2022 (widespread adoption) | Text is selectable, searchable; no canvas resolution issues |
| Zod v3 | Zod v4 (this project has 4.3.6) | Zod v4 released May 2025 | 6.5x faster safeParse; `path` option removed from safeParse params; same basic API |
| Zustand v4 + `useSyncExternalStore` issues under React 19 | Zustand v5 | Zustand v5 released Oct 2024 | React 19 concurrent mode compatibility fixed |
| Zustand v5.0.0–5.0.9 with persist middleware | Zustand v5.0.10+ | January 2026 bug fix | State inconsistency in persist middleware fixed — project uses 5.0.12, already safe |

**Deprecated/outdated:**
- STACK.md references to "zod v3 API": Project has zod v4 installed. APIs are mostly compatible but verify `safeParse` params usage.
- `Font.register()` with custom fonts: Functionally broken in @react-pdf/renderer v4 (usePDF loading hang). Avoid until patched.

---

## Open Questions

1. **Donor name on PDF**
   - What we know: EXPO-02 says "includes donor info"; Phase 1 D-14/D-15 says "no donor info fields in v1"
   - What's unclear: Does EXPO-02 need to be satisfied with a placeholder, or can this be counted as deferred?
   - Recommendation: Render "Taxpayer Name: ___________" as a blank line in the PDF header. This visually satisfies the IRS-format expectation without collecting data. Note it in the plan explicitly.

2. **`wrap={false}` vs. page-break handling for large event tables**
   - What we know: `wrap={false}` on a `<View>` prevents the whole section from splitting across pages. For events with many items (20+), the section may not fit on one page at all.
   - What's unclear: Whether `wrap={false}` on EventSection is appropriate or if we need per-row break prevention
   - Recommendation: Use `wrap={false}` only on the event header row. Let individual item rows wrap naturally. Add `minPresenceAhead={40}` on the section header to prevent orphaned headers.

3. **@react-pdf/renderer exact current version**
   - What we know: STACK.md listed 4.3.2; npm page confirmed 4.3.2 at time of prior research
   - What's unclear: Whether a newer 4.x has been published since the font bug fix
   - Recommendation: Run `npm info @react-pdf/renderer version` before installation to get the latest 4.x and check the GitHub release notes for font-related fixes.

---

## Sources

### Primary (HIGH confidence)
- [react-pdf.org/advanced](https://react-pdf.org/advanced) — usePDF hook, BlobProvider, pdf() function APIs confirmed
- [react-pdf.org/fonts](https://react-pdf.org/fonts) — built-in font list confirmed (Helvetica, Courier, Times-Roman families)
- [IRS Instructions for Form 8283 (12/2025)](https://www.irs.gov/instructions/i8283) — Section A column (a)–(i) field definitions confirmed
- [zustand.docs.pmnd.rs/reference/middlewares/persist](https://zustand.docs.pmnd.rs/reference/middlewares/persist) — v5 persist API with partialize, version, migrate
- [zod.dev/v4](https://zod.dev/v4) — Zod v4 release notes, import paths, safeParse changes

### Secondary (MEDIUM confidence)
- [github.com/diegomura/react-pdf/issues/2675](https://github.com/diegomura/react-pdf/issues/2675) — custom font hang in usePDF (open issue, v4 confirmed affected)
- MDN: [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) — file download pattern
- Zustand v5.0.10 bug fix (January 2026) — persist middleware state inconsistency fixed; mentioned in release notes search

### Tertiary (LOW confidence)
- DEV Community articles on @react-pdf/renderer usage patterns — used only to confirm community conventions, not as authoritative API reference

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — @react-pdf/renderer v4 APIs confirmed via official docs; Zustand v5 persist API confirmed; Zod v4 confirmed via zod.dev/v4
- Architecture: HIGH — patterns follow established project conventions and prior phase decisions; PDF component structure matches ARCHITECTURE.md recommendation
- Pitfalls: HIGH — font registration bug confirmed via open GitHub issue; poor-condition exclusion pattern confirmed from selectors.ts; zod version gap confirmed by reading package.json

**Research date:** 2026-03-24
**Valid until:** 2026-06-24 (stable libraries; @react-pdf/renderer font bug may be fixed sooner)
