# Project Research Summary

**Project:** Tax Donations Write-offs App
**Domain:** Browser-only charitable donation itemizer / non-cash tax deduction calculator
**Researched:** 2026-03-23
**Confidence:** HIGH

## Executive Summary

This is a pure-frontend, no-backend browser application that helps taxpayers itemize non-cash charitable donations and estimate Fair Market Values (FMV) for tax deduction purposes. The tool fills a genuine market vacuum created by Intuit's discontinuation of ItsDeductible in October 2025 — the dominant product in this space for years. The recommended approach is a static Vite + React + TypeScript single-page app with Zustand for state persistence, @react-pdf/renderer for in-browser PDF export, and a hardcoded year-keyed FMV data module sourced from Salvation Army and Goodwill valuation guides. No server, no auth, no API calls at runtime — the entire product ships as a `dist/` folder deployable to Netlify or Vercel.

The competitive landscape confirms that a free, no-account tool with an FMV range slider (low/mid/high selectable), contextual IRS threshold flags ($250/$500/$5K scoped correctly per donation event vs. aggregate), and a Form 8283-annotated PDF export would outperform every current free alternative. Paid alternatives (DeductAble, Kebab) require accounts or premium subscriptions for comparable features. The 2025 One Big Beautiful Bill Act's expanded SALT cap means more people will itemize in 2026, increasing demand for accurate non-cash donation records.

The key risks are: (1) IRS compliance errors from incorrect threshold scoping — the $250 acknowledgment rule is per-event while $500 Form 8283 is aggregate, and conflating them creates real tax harm; (2) FMV values being miscommunicated as IRS-authoritative when they are thrift-store estimates; (3) localStorage data loss in private/incognito browsing without user warning; and (4) "Poor" condition items being silently included in deductible totals when §170(f)(16) bars most such deductions. All four risks are fully preventable with correct implementation decisions made in Phase 1.

---

## Key Findings

### Recommended Stack

The stack is purpose-built for a static, no-backend tool. Vite 8 + React 19 + TypeScript 5 handles the build and UI layer. Tailwind v4 with its Vite plugin eliminates PostCSS configuration entirely. Zustand 5 with the `persist` middleware handles localStorage sync with schema migration support — critical for future FMV data shape changes. @react-pdf/renderer 4.3.2 generates structured vector PDFs (text is selectable) in-browser without any server. All versions have been verified against npm as of the research date.

The most consequential stack decisions: use @react-pdf/renderer over jsPDF (rasterized vs. vector PDF matters for a tax document), use Zustand's `persist` over hand-rolled localStorage hooks (migration support), and use react-hook-form + zod over Formik (bundle size + maintenance status). FMV data lives as a static TypeScript `const` — not in Zustand, not fetched from an API — and is year-keyed so annual updates require changing one file.

**Core technologies:**
- **Vite 8 + @vitejs/plugin-react-swc**: Build tool — fastest HMR, produces static `dist/`, SWC gives sub-100ms rebuilds
- **React 19**: UI layer — concurrent features (useTransition) enable live-updating totals without blocking inputs
- **TypeScript 5 (strict mode)**: Type safety — catches FMV arithmetic errors at compile time; interfaces map directly to the data model
- **Tailwind CSS v4**: Styling — single `@import "tailwindcss"` in CSS, no PostCSS config, mobile-first utilities
- **Zustand 5 + persist middleware**: Global state + localStorage — `version` + `migrate` fields handle schema upgrades
- **@react-pdf/renderer 4.3.2**: In-browser PDF export — vector text, React component model, flexbox layout for tables
- **react-hook-form 7 + zod 3**: Form handling + validation — lightweight (12KB gzipped), uncontrolled by default, TypeScript-native schema inference
- **lucide-react**: Icons — tree-shakable, per CLAUDE.md no-emoji requirement

### Expected Features

The critical path is: item catalog → FMV ranges per item → running total → PDF export. Everything else is additive. The ItsDeductible gap makes speed-to-market relevant — users are actively searching for a replacement right now.

**Must have (table stakes):**
- Searchable item catalog (clothing, furniture, electronics, sporting goods, household, books/media/toys) — core workflow
- Low / mid / high FMV ranges per item with condition toggle (Poor / Good / Excellent) — IRS requires range, not single value
- Quantity editor (+/- inline) — users donate multiples
- Multi-date donation log with organization name — required for Form 8283; ItsDeductible did this
- Running total with category breakdown — table stakes, every competitor shows this
- IRS threshold flags: $250 per-event, $500 aggregate (Form 8283 Section A), $5,000 per-item (Section B) — compliance requirement
- localStorage persistence — users build lists over days; losing data on close is a dealbreaker
- PDF export — users hand this to their CPA or attach to Form 8283
- No account required — users will not create an account for a once-a-year tax tool
- Mobile-responsive layout — users are at the donation drop-off on their phones

**Should have (competitive differentiators):**
- FMV slider defaulting to mid, scoped to the published low/high range — none of the free alternatives do this well
- Form 8283 field references annotated in the PDF (Box 1a, 1b, etc.) — accountants value this; DeductAble doesn't do it
- Inline IRS compliance callouts as totals change — most tools bury these in disclaimers, not live
- §170(f)(16) "good condition" rule surfaced on item add — rarely seen in tools; prevents automatic disallowance
- JSON backup export — guards against localStorage loss in private browsing
- Smart tax year default — prior year Jan–Apr, current year otherwise

**Defer (v2+):**
- Live API-based FMV lookup (replace hardcoded values with web search)
- IRS charity 501(c)(3) validation via API
- AI photo recognition for item entry (Kebab/DeductAble's marquee feature)
- Share-by-URL (base64 state encoding)
- Multi-year UI support
- Cash donation tracking (separate IRS rules)
- Vehicle donation tracking (Form 1098-C, separate rules entirely)

### Architecture Approach

The architecture is a single-page React application with no runtime network calls. All state lives in Zustand, persisted to localStorage between sessions. The FMV data module is a static TypeScript `const` imported at build time — it is the app's "database." PDF generation runs entirely in the browser via @react-pdf/renderer. The three critical architectural constraints are: (1) derived totals (grand total, category breakdowns, threshold flags) must be computed via selectors, never stored; (2) the PDF document component receives a plain data snapshot at export time — it never reads Zustand directly; (3) @react-pdf/renderer must be lazy-loaded with `React.lazy` to avoid adding ~300KB to the initial bundle.

**Major components:**
1. **FMV Data Module** (`src/data/fmv/`) — static year-keyed catalog; `resolveFMV(item, condition, year)` is a pure function; no network calls
2. **Zustand Store + Selectors** (`src/store/`) — `DonationStore` holds `donorInfo`, `events[]`, `taxYear`; selectors compute totals, threshold flags, category breakdowns
3. **Storage Layer** (`src/storage/`) — `usePersistedState` hook syncs store to localStorage; `migrateStorage()` handles schema version upgrades with a `while (v < CURRENT_VERSION)` loop
4. **ItemCatalog + ItemCard** — searchable type-ahead catalog, per-item condition toggle, quantity editor, FMV range picker; mobile layout uses card-per-item stacking, not a `<table>`
5. **TotalsDashboard + ThresholdFlags** — sticky panel reading derived selectors; threshold logic must track $250 at the `DonationEvent` level and $500/$5K at aggregate level separately
6. **PDF Pipeline** (`src/pdf/`) — `DonationReport.tsx` receives a `ReportData` snapshot prop; sub-components for header, event sections, totals, IRS notices; lazy-loaded

### Critical Pitfalls

1. **IRS threshold scoping error** — The $250 written acknowledgment threshold is per donation event (per date + organization). The $500 Form 8283 threshold is aggregate across all events. Conflating them causes real deduction disallowances. Track thresholds at two levels in the store: `DonationEvent`-level for $250, aggregate selector for $500/$5K. Write a specific test: three events at $180/$280/$200 (total $660) — the $250 flag should trigger only on event 2.

2. **FMV presented as IRS-authoritative** — Salvation Army and Goodwill guides are thrift-store pricing references, not IRS-sanctioned schedules. Every FMV display must say "estimated range from [guide name] ([year])," never "IRS FMV." Default to low-to-mid range, not high. Include the disclaimer in the PDF header. Overvaluation 150%+ triggers a 20% IRS accuracy penalty; 200%+ triggers 40%.

3. **"Poor" condition items silently included in totals** — IRC §170(f)(16) bars deductions for clothing/household items not in good condition or better (unless value > $500 with qualified appraisal). Poor-condition items under $500 must be excluded from the deductible total and flagged with a strikethrough + warning. Not doing this creates automatic disallowances, not just audit risk.

4. **localStorage data loss without warning** — Safari Private mode deletes localStorage on tab close. Chrome/Firefox Incognito retains only for the session. Privacy extensions may block it entirely. On app mount, run a localStorage write test and display a persistent banner if it fails. Ship a JSON backup export in the same milestone as the persistence feature.

5. **PDF table rows splitting across page boundaries** — html2canvas + jsPDF slices pixels at page boundaries, splitting table rows in half — unacceptable for a tax document. Using @react-pdf/renderer eliminates this entirely. This is a choose-before-build decision; retrofitting is expensive.

---

## Implications for Roadmap

Based on the combined research, the suggested phase structure follows the feature dependency graph from FEATURES.md and the build order from ARCHITECTURE.md.

### Phase 1: Data + State Foundation
**Rationale:** Everything else depends on the FMV data shape and store interfaces being stable. Schema changes after the PDF pipeline is built will break field references. This is pure TypeScript with no UI — fastest phase to complete, lowest risk, unlocks all subsequent work.
**Delivers:** `src/data/fmv/` catalog with `resolveFMV()`, TypeScript interfaces (`DonationEvent`, `DonationItem`, `DonorInfo`), Zustand store with actions, all selectors (totals, threshold flags, category breakdowns), localStorage persistence hook with schema migration support.
**Addresses:** Catalog search capability (data side), year-keyed FMV structure, `last_verified` field in data file
**Avoids:** Pitfall 3 (stale FMV data without verification date), Pitfall 10 (invented condition multipliers — map condition to low/mid/high range), Pitfall 11 (smart tax year default logic)

### Phase 2: Core Item Entry UI
**Rationale:** The item entry flow is the highest-value, most-used feature. It must work correctly on mobile at 375px before anything else is built on top of it. The threshold flags must be wired here with correct per-event vs. aggregate scoping — not added later.
**Delivers:** `ItemCatalog` with type-ahead search, `ItemCard` with condition toggle (Poor/Good/Excellent), quantity editor (+/-), FMV range picker (slider defaulting to mid), running total display, per-category subtotals, IRS threshold flags ($250 per event, $500/$5K aggregate), §170(f)(16) poor-condition warning.
**Addresses:** All 10 "table stakes" features, FMV slider differentiator, inline compliance callouts differentiator
**Avoids:** Pitfall 1 (threshold scoping — critical, must be correct here), Pitfall 5 (poor-condition items), Pitfall 7 (mobile table overflow — use cards, not `<table>`), Pitfall 9 (keyboard/screen reader accessibility — `<button>` elements, ARIA labels on all controls)

### Phase 3: Multi-Event Log + Persistence
**Rationale:** Multiple donation events are required for IRS compliance (each drop-off date/organization is a separate Form 8283 entry). Persistence without a backup export option ships localStorage data loss risk to users. These features belong in the same milestone.
**Delivers:** `DonationEventList`, `DonationEventCard` (per-event date + organization + items), `DonorInfoForm`, localStorage persistence wired into App, JSON backup export ("Save to file" button), localStorage availability check with private-mode banner, auto-save indicator.
**Addresses:** Multi-date donation log (table stakes), organization name per donation, localStorage persistence (table stakes), JSON backup export (differentiator)
**Avoids:** Pitfall 4 (localStorage data loss — JSON export ships in this milestone), Pitfall 12 (donor PII in PDF — label fields as "optional — appears in PDF")

### Phase 4: PDF Export
**Rationale:** PDF export depends on the complete `DonationItem` and `DonationEvent` data shape being stable (Phase 1), the full item entry UI working (Phase 2), and multi-event log being complete (Phase 3). The PDF receives a snapshot of all of these. Lazy-loading @react-pdf/renderer is required to protect initial bundle size.
**Delivers:** `src/pdf/DonationReport.tsx` (lazy-loaded) with `ReportHeader`, `EventSection`, `TotalsSection`, `IRSNoticeSection`; Form 8283 field annotations (Box 1a, 1b, etc.) in the export; legal disclaimer in PDF header; `ExportButton` with loading state and download trigger.
**Addresses:** PDF export (table stakes), Form 8283 field references (differentiator), printable layout optimized for CPA handoff (differentiator)
**Avoids:** Pitfall 2 (FMV copy review — "estimated range from [guide]" in PDF header), Pitfall 6 (mid-row page breaks — @react-pdf/renderer handles this), Pitfall 8 (legal disclaimer in PDF, not just web UI)

### Phase 5: Polish + Launch Readiness
**Rationale:** Covers remaining differentiators and quality gates that don't block the core flow but matter for competitive positioning and trust.
**Delivers:** Full copy audit (no "IRS value" language anywhere; "estimated" everywhere), accessible focus states and ARIA review pass, mobile-responsive polish, deployment to Netlify/Vercel, legal disclaimer visible near totals panel (not just footer), source citations on item cards ("Source: Salvation Army Valuation Guide 2025").
**Addresses:** Copy quality, accessibility WCAG AA compliance, "good condition" rule educational copy
**Avoids:** Pitfall 2 (final FMV copy audit), Pitfall 8 (persistent disclaimer near dollar total), Pitfall 9 (end-to-end keyboard/VoiceOver testing)

### Phase 6 (v2): API Integrations
**Rationale:** Phase 2+ features deferred from v1. Depend on the core product being proven and user feedback on pain points.
**Delivers:** Live FMV lookup via Claude + web search (replacing hardcoded data), IRS 501(c)(3) charity database validation, AI photo recognition for item entry, share-by-URL (base64 state encoding).
**Addresses:** Differentiators deferred from FEATURES.md: live API FMV, charity validation, photo recognition, share URL

### Phase Ordering Rationale

- **Data before UI:** The FMV data shape and store interfaces are foreign keys for every other layer. Schema stability in Phase 1 prevents cascade breakage in PDF components built in Phase 4.
- **Item entry before events:** A single item working correctly on mobile at 375px is more valuable to validate than multi-event plumbing. Phase 2 can be user-tested with a single event.
- **Persistence with backup:** Shipping localStorage without the JSON export option puts users at risk of silent data loss. Phases 3 must include both.
- **PDF last:** @react-pdf/renderer has a completely different component model from the DOM. Building it last, after the data model is frozen, prevents churn in PDF field references. The lazy-load pattern must be established before shipping.
- **IRS threshold scoping in Phase 2, not later:** This is the most technically subtle compliance requirement. It touches the selectors (Phase 1) and the item entry UI (Phase 2). Adding it as an afterthought in Phase 5 would require retrofitting selector logic and UI components simultaneously.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (PDF Export):** @react-pdf/renderer's font registration, flexbox constraints for tables with variable row counts, and the exact lazy-load pattern with Suspense may need a spike. The library has quirks with fonts not registered before render.
- **Phase 6 (API Integrations):** FMV lookup API design (Claude API or web search integration), IRS EO Select Check API for charity validation, and AI photo recognition (likely a third-party service) all need dedicated research before phase planning.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Data + State):** Zustand store patterns and localStorage migration are well-documented. The data model is fully specified in ARCHITECTURE.md. Standard patterns apply.
- **Phase 2 (Item Entry UI):** Tailwind v4 card layouts, react-hook-form + zod, and lucide-react icons are all well-documented. The ARIA patterns for sliders and radio groups are specified in PITFALLS.md.
- **Phase 3 (Persistence):** localStorage availability detection, JSON export via `URL.createObjectURL`, and Zustand persist wiring are standard patterns.
- **Phase 5 (Polish):** Copy audit and accessibility review are process tasks, not technical research.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm 2026-03-23; React 19 + Zustand 5 compatibility confirmed; Tailwind v4 Vite plugin confirmed |
| Features | HIGH | IRS sources (Pub 526, Pub 561, Form 8283 instructions) are authoritative and current as of 12/2025; competitive analysis is MEDIUM confidence (self-reported by competitors) |
| Architecture | HIGH | Standard React SPA patterns; Zustand selector and persist patterns are well-established; PDF lazy-load pattern is well-documented |
| Pitfalls | HIGH | IRS compliance pitfalls sourced from official IRS publications and Cornell LII; localStorage pitfall sourced from MDN |

**Overall confidence:** HIGH

### Gaps to Address

- **FMV data values:** The research establishes the data structure for year-keyed FMV entries but does not populate the actual item catalog values. The Salvation Army and Goodwill guides need to be manually transcribed into `src/data/fmv/2025.ts` before Phase 2 begins. This is data entry work, not an architecture gap.
- **Condition multiplier calibration:** PITFALLS.md (Pitfall 10) recommends mapping Poor/Good/Excellent to low/mid/high of the published range rather than using arbitrary multipliers. This needs to be confirmed as the approach during Phase 1 data entry — the `resolveFMV()` function should index into the published range, not multiply a base value.
- **@react-pdf/renderer font registration:** Custom fonts require `Font.register()` before the first render. The choice of font for the PDF (and whether to use a custom font or the built-in Helvetica) is a minor decision that should be made before Phase 4 begins, not during it.
- **2026 FMV guide availability:** The Salvation Army guide for 2026 may not be published yet (as of 2026-03-23). The app should ship with 2025 values and the smart tax year default (Phase 1, Pitfall 11). When the 2026 guide publishes, updating is a one-file change.

---

## Sources

### Primary (HIGH confidence)
- [IRS Publication 561 (12/2025)](https://www.irs.gov/publications/p561) — FMV definition, condition requirements, electronics depreciation
- [IRS Publication 526 (2025)](https://www.irs.gov/publications/p526) — $250 per-event written acknowledgment rule, $500 Form 8283 threshold
- [IRS Instructions for Form 8283 (12/2025)](https://www.irs.gov/instructions/i8283) — Section A vs. Section B thresholds, donee information requirements
- [IRS: Charitable Contributions — Written Acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments) — per-event $250 rule detail
- [IRC §6662 — Cornell LII](https://www.law.cornell.edu/uscode/text/26/6662) — 20%/40% accuracy-related penalty thresholds
- [npm: vite 8.0.1](https://www.npmjs.com/package/vite) — version confirmed
- [npm: react 19.2.4](https://www.npmjs.com/package/react) — version confirmed
- [npm: zustand 5.0.12](https://www.npmjs.com/package/zustand) — version confirmed; persist middleware docs
- [npm: @react-pdf/renderer 4.3.2](https://www.npmjs.com/package/@react-pdf/renderer) — version confirmed; React 19 compatibility
- [npm: tailwindcss 4.2.2](https://www.npmjs.com/package/tailwindcss) — version confirmed
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — private mode behavior
- [Salvation Army Donation Value Guide](https://satruck.org/Home/DonationValueGuide) — FMV reference data
- [Goodwill DC Donation Value Calculator](https://dcgoodwill.org/donations/types-of-donations/used-goods-donation-value/) — FMV reference data

### Secondary (MEDIUM confidence)
- [TurboTax Community: ItsDeductible Discontinuation](https://ttlc.intuit.com/community/taxes/discussion/turbotax-is-discontinuing-itsdeductible-again-longtime-users-deserve-better/00/3700314) — user need confirmation
- [Deductible Duck: What Happened to ItsDeductible](https://deductibleduck.com/what-happened-to-itsdeductible/) — competitive landscape
- [DeductAble](https://deductable.ai/), [Kebab](https://kebab.tax/), [DonationCalc](https://donationcalc.com/) — competitor feature sets (self-reported)
- [2026 Tax Law Changes: OBBB Act](https://taxproject.org/obbb-donation-explainer/) — SALT cap expansion impact
- [Tailwind CSS v4 announcement](https://tailwindcss.com/blog/tailwindcss-v4) — Vite plugin, no PostCSS
- [Joyfill: Comparing open source PDF libraries 2025](https://joyfill.io/blog/comparing-open-source-pdf-libraries-2025-edition) — rasterized vs. vector tradeoff

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
