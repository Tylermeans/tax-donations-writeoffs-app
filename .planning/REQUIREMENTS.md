# Requirements: Donation Itemizer

**Defined:** 2026-03-23
**Core Value:** Users can quickly and accurately total the fair market value of their donated items so they claim the full deduction they're legally entitled to.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Item Catalog

- [x] **ITEM-01**: User can search items by name with type-ahead autocomplete across all categories (clothing, furniture, electronics, sporting goods, household, books/media/toys, instruments)
- [x] **ITEM-02**: User can browse items by category when not searching
- [x] **ITEM-03**: User sees FMV low/mid/high range for each item based on condition
- [x] **ITEM-04**: User can adjust FMV within the range via slider/picker, with average suggested as default
- [x] **ITEM-05**: User can toggle item condition (Poor/Good/Excellent) and FMV range updates accordingly
- [x] **ITEM-06**: User sees contextual IRS compliance notes per item category (e.g., electronics require depreciated value, IRS scrutiny higher)
- [x] **ITEM-07**: Poor-condition items display a warning that items must be in "good used condition or better" per IRC §170(f)(16) — non-deductible unless >$500 with qualified appraisal

### Donation Log

- [x] **LOG-01**: User can create multiple donation events, each with a date and organization name
- [x] **LOG-02**: User can add items to a specific donation event
- [x] **LOG-03**: User can set quantity per item with inline +/- controls
- [x] **LOG-04**: User can bulk-enter quantity for high-volume donations (e.g., 30 shirts)
- [x] **LOG-05**: User can edit or remove items from a donation event
- [x] **LOG-06**: User can edit or delete entire donation events

### Dashboard & Compliance

- [x] **DASH-01**: User sees a live-updating running total of all deductions as items are added/changed
- [x] **DASH-02**: User sees visual breakdown by donation date
- [x] **DASH-03**: User sees visual breakdown by item category
- [x] **DASH-04**: User sees contextual IRS threshold flag when a single donation event exceeds $250 (written acknowledgment from organization required)
- [x] **DASH-05**: User sees contextual IRS threshold flag when aggregate non-cash total exceeds $500 (Form 8283 Section A required)
- [x] **DASH-06**: User sees contextual IRS threshold flag when a single item exceeds $5,000 (qualified appraisal + Form 8283 Section B required)
- [x] **DASH-07**: Threshold flags appear contextually as totals change, not buried in help text

### Export

- [ ] **EXPO-01**: User can generate a PDF summary of all donations matching IRS non-cash contribution format
- [ ] **EXPO-02**: PDF includes donor info, organization names, donation dates, item list with quantities and FMV, and totals
- [ ] **EXPO-03**: PDF includes Form 8283 field reference callouts where applicable
- [ ] **EXPO-04**: PDF includes legal disclaimer ("This tool provides estimates only. Consult a qualified tax professional.")

### Persistence

- [x] **PERS-01**: User's donation data persists in localStorage across browser sessions
- [x] **PERS-02**: localStorage schema includes version field for future migration support
- [x] **PERS-03**: User can export donation data as a JSON backup file (download)
- [x] **PERS-04**: User can import donation data from a previously exported JSON backup file

### Infrastructure

- [x] **INFR-01**: App defaults to current tax year (2025) with data model structured for future year updates
- [x] **INFR-02**: App is responsive from 375px to 1440px (mobile-first)
- [x] **INFR-03**: App meets WCAG AA accessibility standards (contrast, focus states, aria labels, keyboard navigation)
- [x] **INFR-04**: No account or authentication required — fully client-side
- [x] **INFR-05**: FMV data sourced from Salvation Army/Goodwill valuation guides, clearly labeled as charity guide estimates (not "IRS FMV")

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### AI-Powered FMV

- **AIFM-01**: User can trigger live FMV lookup via Claude API + web_search for real-time charity guide values
- **AIFM-02**: User sees source citation for each AI-retrieved FMV value

### Sharing

- **SHAR-01**: User can generate a shareable URL that encodes donation data (base64 state)
- **SHAR-02**: User can open a shared URL and see the encoded donation summary

### Advanced Compliance

- **COMP-01**: User can enter AGI to see 2026 deductibility floor (0.5% OBBB Act threshold)
- **COMP-02**: User sees prior-year FMV comparison (2024 vs 2025 values)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Vehicle donations | Separate IRS rules, Form 1098-C — different product |
| Real estate / stock / securities | Different valuation methods, different IRS forms |
| Cash donations | No FMV calculation needed — already a dollar amount |
| User accounts / authentication | Once-a-year tool, no backend needed |
| Multi-year support in v1 | Data model supports it, but UI shows current year only |
| Backend / server | Pure frontend — no API keys, no hosting costs |
| Photo-based item identification | AI feature, defer to v2+ |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ITEM-01 | Phase 2 | Complete |
| ITEM-02 | Phase 2 | Complete |
| ITEM-03 | Phase 2 | Complete |
| ITEM-04 | Phase 2 | Complete |
| ITEM-05 | Phase 2 | Complete |
| ITEM-06 | Phase 2 | Complete |
| ITEM-07 | Phase 2 | Complete |
| LOG-01 | Phase 2 | Complete |
| LOG-02 | Phase 2 | Complete |
| LOG-03 | Phase 2 | Complete |
| LOG-04 | Phase 2 | Complete |
| LOG-05 | Phase 2 | Complete |
| LOG-06 | Phase 2 | Complete |
| DASH-01 | Phase 2 | Complete |
| DASH-02 | Phase 2 | Complete |
| DASH-03 | Phase 2 | Complete |
| DASH-04 | Phase 2 | Complete |
| DASH-05 | Phase 2 | Complete |
| DASH-06 | Phase 2 | Complete |
| DASH-07 | Phase 2 | Complete |
| EXPO-01 | Phase 3 | Pending |
| EXPO-02 | Phase 3 | Pending |
| EXPO-03 | Phase 3 | Pending |
| EXPO-04 | Phase 3 | Pending |
| PERS-01 | Phase 3 | Complete |
| PERS-02 | Phase 3 | Complete |
| PERS-03 | Phase 3 | Complete |
| PERS-04 | Phase 3 | Complete |
| INFR-01 | Phase 1 | Complete |
| INFR-02 | Phase 2 | Complete |
| INFR-03 | Phase 2 | Complete |
| INFR-04 | Phase 1 | Complete |
| INFR-05 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation*
