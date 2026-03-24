# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 1-foundation
**Areas discussed:** FMV data source, App shell & layout, Threshold logic, Donor info scope, Naming & branding, Error & edge cases

---

## FMV Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Salvation Army guide | Most widely referenced, broader item coverage | ✓ |
| Goodwill guide | Also well-known but less granular | |
| Blend both | SA primary, supplement with Goodwill | |
| You decide | Claude picks best source per category | |

**User's choice:** Salvation Army guide
**Notes:** None

### Condition Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Separate ranges | Each condition has own low/mid/high range | ✓ |
| Multiplier on base | One base range × condition factor | |
| You decide | Claude picks | |

**User's choice:** Separate ranges

### Data Format

| Option | Description | Selected |
|--------|-------------|----------|
| Single TS file | One src/data/fmv.ts — simple annual update | ✓ |
| Per-category files | One file per category | |
| You decide | Claude picks | |

**User's choice:** Single TS file

---

## App Shell & Layout

### Visual Tone

| Option | Description | Selected |
|--------|-------------|----------|
| Clean & minimal | White/light, professional tax tool feel | |
| Warm & approachable | Soft colors, rounded corners, friendly | ✓ |
| Bold & branded | Strong color palette, distinctive | |

**User's choice:** Warm & approachable

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single column | Everything stacked vertically | ✓ |
| Two-column desktop | Item entry left, dashboard right | |
| You decide | Claude picks | |

**User's choice:** Single column

### Color

| Option | Description | Selected |
|--------|-------------|----------|
| Blues & greens | Trust/finance vibes | ✓ |
| Neutral + accent | Gray/white base with one accent | |
| You decide | Claude picks | |

**User's choice:** Blues & greens

---

## Threshold Logic

### Poor-Condition Items

| Option | Description | Selected |
|--------|-------------|----------|
| Block + warn | Excluded from total, strikethrough, warning | ✓ |
| Warn only | Warning but still include in total | |
| Remove Poor option | Only Good and Excellent | |

**User's choice:** Block + warn

### $250 Written Acknowledgment

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on event | Small banner on each event exceeding $250 | ✓ |
| Dashboard callout | Prominent card in dashboard | |
| Both | Inline hint + dashboard summary | |

**User's choice:** Inline on event

### $500 Aggregate (Form 8283)

| Option | Description | Selected |
|--------|-------------|----------|
| Persistent banner | Stays visible at top of dashboard | |
| Toast notification | Brief alert + small icon | |
| Dashboard card | Dedicated card in totals area | ✓ |

**User's choice:** Dashboard card

### $5,000 Per-Item (Qualified Appraisal)

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on item | Warning on the item card | ✓ |
| Block entry | Prevent adding without acknowledging | |
| You decide | Claude picks | |

**User's choice:** Inline on item

**Notes:** User emphasized: legal disclaimer must be visible in the app UI itself, not just PDF. "This is a tool and individuals should consult their tax accountant to understand if their deduction total is qualifying."

---

## Donor Info Scope

### Fields to Collect

| Option | Description | Selected |
|--------|-------------|----------|
| Full name | Donor's legal name | |
| Address | Donor's address | |
| Tax year | Already planned | |
| None for now | Skip donor info in v1 | ✓ |

**User's choice:** None for now

### When to Collect

| Option | Description | Selected |
|--------|-------------|----------|
| On first visit | Prompt at app start | |
| At export time | Ask when generating PDF | ✓ |
| Settings page | Donor info in settings section | |

**User's choice:** At export time

---

## Naming & Branding

### App Name

| Option | Description | Selected |
|--------|-------------|----------|
| Donation Itemizer | Straightforward, from the spec | ✓ |
| DonateTracker | Shorter, more app-like | |

**User's choice:** Donation Itemizer

### Tagline

| Option | Description | Selected |
|--------|-------------|----------|
| Track donations. Claim deductions. | Action-oriented | |
| Know what your donations are worth. | Value-focused | ✓ |
| You decide | Claude writes | |

**User's choice:** "Know what your donations are worth."

---

## Error & Edge Cases

### Private Browsing / No localStorage

| Option | Description | Selected |
|--------|-------------|----------|
| Banner + continue | Warning but allow usage | ✓ |
| Block usage | Don't proceed without storage | |
| Banner + suggest | Warning + suggest JSON export | |

**User's choice:** Banner + continue

### Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Quick start guide | Step-by-step illustration | ✓ |
| Single CTA | Just an "Add first donation" button | |
| You decide | Claude picks | |

**User's choice:** Quick start guide

---

## Claude's Discretion

- FMV data file internal structure
- Zustand store slice design
- Tailwind config and exact color values
- Component file organization

## Deferred Ideas

None — discussion stayed within phase scope
