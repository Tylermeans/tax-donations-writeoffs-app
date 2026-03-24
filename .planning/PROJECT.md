# Donation Itemizer

## What This Is

A browser-based tool that helps individuals itemize non-cash charitable donations (clothing, furniture, electronics, sporting goods, etc.), look up IRS fair market value (FMV) ranges for each item, and generate a formatted write-off summary for tax filing. Public-facing — anyone who donates to Goodwill, Salvation Army, or similar 501(c)(3) organizations can use it.

## Core Value

Users can quickly and accurately total the fair market value of their donated items so they claim the full deduction they're legally entitled to.

## Requirements

### Validated

- ✓ Current tax year (2025) with data structure that supports future year updates — Validated in Phase 1: Foundation
- ✓ Responsive design (375px → 1440px) — Validated in Phase 1: Foundation
- ✓ Accessible (WCAG AA) — Validated in Phase 1: Foundation
- ✓ Hardcoded FMV values from Salvation Army valuation guide with low/mid/high ranges per condition — Validated in Phase 1: Foundation
- ✓ No account or authentication required — fully client-side — Validated in Phase 1: Foundation

### Active

- [ ] Multi-date donation log (unlimited donation events, each with date + organization)
- [ ] Searchable item catalog covering clothing, furniture, electronics, sporting goods, household, books/media/toys, instruments
- [ ] FMV range slider/picker — user adjusts within range, app suggests average as default
- [ ] Condition toggle per item (Poor / Good / Excellent) affecting FMV multiplier
- [ ] Quantity editor with inline +/- controls and bulk entry
- [ ] Running total dashboard with live-updating deduction total
- [ ] Visual breakdown by donation date and category
- [ ] IRS threshold flags: $500 (Form 8283 required), $5,000 (qualified appraisal required), $250 (written acknowledgment)
- [ ] PDF export matching IRS non-cash contribution format with donor info, org name, dates, items, FMV, totals
- [ ] Form 8283 field reference callouts in export
- [ ] localStorage persistence — donation data survives browser close

### Out of Scope

- Vehicle donations — separate IRS rules, Form 1098-C
- Real estate / stock / securities donations
- Cash donations — no FMV calculation needed
- Multi-user / account system — no auth, no backend
- Live API-based FMV lookup — hardcoded values from charity guides instead
- Multi-year support in v1 — current year only, but data model accommodates future years

## Context

- IRS Publication 561 defines how to determine FMV for donated property
- Salvation Army and Goodwill publish valuation guides with dollar ranges by item category and condition
- Items must be in "good used condition or better" per IRC §170(f)(16)
- Form 8283 Section A required for >$500 total non-cash donations
- Form 8283 Section B + qualified appraisal required for single items >$5,000
- Written acknowledgment from organization required for donations >$250
- FMV values structured as year-keyed data so annual updates are a single-file change

## Constraints

- **Stack**: React + Vite + Tailwind CSS — standalone deployable app
- **No backend**: Pure frontend, no API keys, no server
- **FMV data**: Hardcoded from current Salvation Army/Goodwill guides, structured for easy annual updates
- **Accessibility**: WCAG AA contrast, focus states, aria labels
- **Mobile-first**: Responsive from 375px to 1440px

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hardcoded FMV over live API lookup | No API key friction for public users, simpler stack, charity guides don't change frequently | ✓ Good |
| Standalone Vite app over Claude artifact | Full deployment flexibility, better for public tool | ✓ Good |
| localStorage over session-only state | Users need data to survive browser close during multi-session tax prep | ✓ Good |
| Current year only with future-year data model | Simplifies v1 while keeping upgrade path clean | ✓ Good |
| FMV range picker with suggested average | Users can adjust within range but get a sensible default | — Pending |
| Separate FMV ranges per condition (not multipliers) | Direct lookup from Salvation Army guide, more defensible | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 1: Foundation complete*
