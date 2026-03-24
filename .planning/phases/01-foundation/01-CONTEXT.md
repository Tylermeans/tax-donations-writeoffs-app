# Phase 1: Foundation - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the Vite + React + TypeScript + Tailwind app, build the FMV data module with hardcoded values, create TypeScript interfaces for the data model, set up the Zustand store with derived selectors, and establish infrastructure (tax year default, localStorage detection, app shell with basic layout and branding).

</domain>

<decisions>
## Implementation Decisions

### FMV Data Source
- **D-01:** Primary FMV source is the Salvation Army valuation guide
- **D-02:** Each condition (Poor/Good/Excellent) has its own separate low/mid/high range — not a multiplier on a base range
- **D-03:** All FMV data lives in a single TypeScript file (`src/data/fmv.ts`) — easy annual update, single-file diff
- **D-04:** FMV values clearly labeled as "charity guide estimates" — never "IRS FMV"

### App Shell & Layout
- **D-05:** Visual tone is warm & approachable — soft colors, rounded corners, friendly feel (not sterile tax-tool aesthetic)
- **D-06:** Single-column layout throughout — stacks naturally on mobile, scrolls on desktop
- **D-07:** Color palette is blues & greens — trust/finance vibes but warmer than typical tax tools
- **D-08:** App name: "Donation Itemizer"
- **D-09:** Tagline: "Know what your donations are worth."

### Threshold Logic
- **D-10:** Poor-condition items are blocked + warned: excluded from deductible total with strikethrough and IRC §170(f)(16) warning, unless item exceeds $500 with qualified appraisal
- **D-11:** $250 per-event threshold: inline warning on each donation event that exceeds $250 — "Written acknowledgment required"
- **D-12:** $500 aggregate threshold: dedicated dashboard card that appears when total non-cash exceeds $500 — "Form 8283 Section A required"
- **D-13:** $5,000 per-item threshold: inline warning directly on the item card — "Qualified appraisal required for this item"

### Donor Info
- **D-14:** No donor info fields collected in v1 — users fill in donor details manually on the PDF or at export time if added later
- **D-15:** Data model should NOT include donor fields yet — keep it clean

### Legal Disclaimer
- **D-16:** Persistent legal disclaimer visible in the app UI (not just PDF export) — "This tool provides estimates only. Consult a qualified tax professional to understand if your deductions qualify."

### Error & Edge Cases
- **D-17:** When localStorage is unavailable (Safari Private, storage full): show a warning banner ("Data won't be saved in this session") but allow full app usage
- **D-18:** Empty state shows a quick-start guide: step-by-step illustration (1. Add a donation date, 2. Search for items, 3. Export your summary)

### Claude's Discretion
- FMV data file internal structure (how to organize categories, type definitions)
- Zustand store slice design and selector implementation
- Tailwind configuration and exact color values within the blues/greens warm palette
- Component file organization

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Spec
- `donation-itemizer-spec.md` — Full product specification including item category seed list, UX flow, data model interfaces, IRS compliance thresholds, and build phases

### IRS Compliance
- `donation-itemizer-spec.md` §IRS Compliance Notes — Threshold table ($250/$500/$5,000) with form references
- `donation-itemizer-spec.md` §Item Category Seed List — Complete item catalog with categories

### Research
- `.planning/research/STACK.md` — Technology recommendations (Vite 8, React 19, Tailwind v4, Zustand v5, @react-pdf/renderer v4)
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, FMV data model, build order
- `.planning/research/PITFALLS.md` — Domain pitfalls including poor-condition deductibility rules, threshold scoping, FMV labeling

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project

### Established Patterns
- No existing patterns — this phase establishes them

### Integration Points
- FMV data module → consumed by Zustand store selectors and future UI components
- Zustand store → consumed by all Phase 2 UI components
- TypeScript interfaces → shared across all phases

</code_context>

<specifics>
## Specific Ideas

- User wants the average/midpoint of the FMV range suggested as the default value in the range picker (from earlier conversation)
- Legal disclaimer should be prominent — not fine print, not hidden in help
- Quick-start guide for empty state should feel inviting, not like a tutorial wall

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-23*
