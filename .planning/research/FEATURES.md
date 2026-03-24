# Feature Landscape

**Domain:** Charitable donation itemizer / non-cash tax deduction calculator
**Researched:** 2026-03-23
**Competitive reference:** ItsDeductible (discontinued Oct 2025), Salvation Army valuation guide, Goodwill donation calculator, DonationCalc, DeductAble, Kebab, Charity Record, Deductible Duck

---

## Context: Why Now

Intuit killed ItsDeductible on October 21, 2025. It was the dominant tool in this space with millions of users who are now looking for replacements. Several alternatives launched in the gap (DeductAble, Kebab, DonationCalc, Deductible Duck, Charity Record). This is a genuinely active market right now.

Additionally, the One Big Beautiful Bill Act (2025) creates new 2026 tax rules: itemizers can only deduct charitable donations exceeding 0.5% of AGI, but there is a new $1,000/$2,000 deduction for cash gifts even under the standard deduction. An expanded $40K SALT cap means more people will itemize in 2026. Accurate non-cash donation records matter more, not less, going forward.

---

## Table Stakes

Features users expect from any tool in this space. Missing = users leave or don't trust the product.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Searchable item catalog | Core workflow — users need to find donated items fast | Low–Med | Competitors all have this; DonationCalc has "thousands of items"; Salvation Army guide covers 8 categories; Goodwill guide is static PDF |
| Low / high FMV ranges per item | IRS requires donor to assign value within reasonable range; charity guides don't set the value | Low | Salvation Army guide explicitly says "it's up to you" — tool must provide range, not a single number |
| Condition-adjusted values | FMV varies materially by condition; IRS Publication 561 emphasizes this | Low | Poor / Good / Excellent is the standard; ItsDeductible used this pattern |
| Quantity entry per item | Users donate multiples (10 shirts, 4 pairs of shoes) | Low | Inline +/- is standard; bulk entry is a UX nice-to-have |
| Running total | Users want to know their deduction total as they go | Low | Table stakes — every competitor shows this |
| $500 threshold warning | Form 8283 is required above $500 total non-cash; users don't know this | Low | DonationCalc, DeductAble, and the spec all flag this |
| $5,000 threshold warning | Qualified appraisal required above $5,000 per item; skipping this creates audit risk | Low | Less common but important for high-value item donors |
| $250 per-donation warning | Written acknowledgment from org required; users forget | Low | Spec includes this; competitors mention it |
| PDF export | Users hand this to their CPA or attach to Form 8283; it must be printable | Med | Every competitor offers PDF or printable view |
| Multi-date donation log | Users donate to Goodwill multiple times a year; records must show each event separately for Form 8283 | Med | ItsDeductible did this; it's required for IRS compliance |
| Organization name per donation | Form 8283 requires donee name and address | Low | Single field per donation event |
| localStorage persistence | Users build their list over days/weeks; losing data on browser close is a dealbreaker | Low | DonationCalc uses browser storage; spec requires this |
| Mobile-responsive layout | Users are on their phones at the donation drop-off | Med | DonationCalc is mobile-friendly; Kebab is mobile-first |
| No account required | Users will not create an account for a once-a-year tax tool | Low | DonationCalc, Kebab, and the spec explicitly design around no sign-up |

---

## Differentiators

Features that are not universally expected but create real competitive advantage when done well.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| FMV slider / range picker | Lets user position their selected value within the low–high range with a sensible default | Low | None of the competitor tools reviewed do this well — Salvation Army just shows a table, DonationCalc lets you pick high or low but no in-between. The spec's slider approach is genuinely differentiated. |
| IRS compliance callouts inline | Surface threshold flags (>$250, >$500, >$5,000) contextually as the user builds their list — not just at the end | Low | Most tools mention these in disclaimers or FAQ; showing them live as totals change is better UX |
| Form 8283 field reference in export | Label the PDF sections with the Form 8283 fields they map to (box 1a, 1b, etc.) | Med | DeductAble does IRS-compliant exports but doesn't specifically annotate with field references. Accountants and CPAs would value this. |
| Category breakdown in running total | Show subtotal by category (Clothing: $340, Furniture: $180) not just grand total | Low | Useful for users comparing against prior years and for CPAs reviewing returns |
| Data structured for annual updates | FMV values in a year-keyed data file so each tax year is a one-line change | Low–Med | Not a user-visible feature, but keeps the tool accurate year over year without a rewrite. Competitors that hardcode values go stale. |
| Items must meet "good condition" rule | Surface IRC §170(f)(16) — items must be in good used condition or better to be deductible | Low | Rarely surfaced in tools; a brief note on item add with the condition toggle is accurate and helps users avoid bad deductions |
| Printable layout optimized for CPA handoff | A clean, one-page-per-donation-event layout that looks professional, not like a browser printout | Med | Most tools export something readable; a genuinely polished layout is rare |
| Shareable summary link (base64 state) | Let users share their donation list with their accountant via URL, no file attachment | Med | Spec mentions this for Phase 3. Kebab is device-only; DeductAble requires account sync. A stateless share URL is distinctive. |

---

## Anti-Features

Things to deliberately NOT build in v1. These are either out of scope for the use case, add complexity without proportional user value, or create maintenance/legal liability.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Cash donation tracking | No FMV calculation needed; the tool's value is in non-cash item valuation | Scope clearly to non-cash items; add a text note that cash donations are tracked separately |
| Vehicle donations | Entirely separate IRS rules (Form 1098-C); FMV is not user-determined | Out of scope in spec; a single callout noting "vehicles use different IRS rules" is enough |
| Stock / securities donations | Different rules, different forms, different valuation method | Out of scope; don't confuse users with it |
| Multi-user accounts / auth | Users will not create an account for a once-a-year tax tool; auth adds backend complexity and a maintenance burden | localStorage + optional share-by-URL covers the legitimate use cases |
| Live API-based FMV lookup (v1) | API key friction for public users; cold API calls per item add latency; Salvation Army / Goodwill guides don't change month-to-month | Hardcode from current guides in a year-keyed data structure; design for API upgrade in Phase 2 |
| IRS charity database validation | Checking if a charity is a valid 501(c)(3) is a useful feature but adds an API dependency and complexity that blocks shipping | Charity Record and DeductAble offer this; it's a Phase 2+ addition after core flow works |
| "Donation impact" metrics | Goodwill's regional calculators show how many job-training hours your donation supports. This is feel-good marketing for Goodwill, not what a tax deduction tool user wants | Users want deduction value, not mission marketing |
| Multi-year support in v1 | Adds state complexity and scope creep; current year is the real need | Design the data model to support multiple years (year-keyed FMV data, year field on DonationLog), but only expose current year in the UI |
| AI photo recognition for item entry | Kebab and DeductAble's marquee feature; impressive but high complexity, requires API integration, and reliability is a concern for a legal document | Phase 2+ consideration; don't let it block the core value of the tool |
| Prior-year FMV comparison view | Mildly interesting but niche; adds UI complexity for a feature few users will use | Document in spec as a future idea; don't build in v1 |

---

## Feature Dependencies

These are the build-order dependencies within the feature set. Later features require earlier ones.

```
Item catalog (searchable) → FMV ranges per item → Condition toggle → FMV slider/picker
                                                ↓
                                         Quantity entry
                                                ↓
                                         Running total → Threshold flags ($250, $500, $5K)
                                                              ↓
                                               Multi-date donation log
                                                              ↓
                                               Category breakdown
                                                              ↓
                                               PDF export → Form 8283 field references
                                                              ↓
                                               localStorage persistence
                                                              ↓
                                               Share URL (Phase 3)
```

Critical path: item catalog → FMV ranges → running total → PDF export. Everything else is additive.

---

## MVP Recommendation

The ItsDeductible gap creates a real user pull right now. Users want a simple, no-account tool that does what ItsDeductible did. The MVP should close that gap cleanly.

**Prioritize for Phase 1:**
1. Item catalog with searchable categories (clothing, furniture, electronics, sporting goods, household, books/media/toys)
2. FMV low/mid/high ranges per item with condition toggle (Poor / Good / Excellent)
3. FMV range slider defaulting to mid
4. Quantity editor (+/- inline)
5. Multi-date donation log with organization name
6. Running total with category breakdown
7. IRS threshold flags ($250, $500, $5,000) shown contextually
8. localStorage persistence
9. PDF export with Form 8283 field references

**Defer to Phase 2:**
- Live API-based FMV lookup (replace hardcoded values with Claude + web search)
- IRS charity database validation
- Photo recognition for item entry

**Defer to Phase 3:**
- Share-by-URL (base64 state)
- Enhanced print layout
- Multi-year support in the UI

---

## Competitive Gap Analysis

| Tool | FMV ranges | Condition toggle | Multi-date log | IRS threshold flags | No account | PDF export |
|------|-----------|-----------------|----------------|---------------------|------------|------------|
| ItsDeductible (gone) | Yes | Yes | Yes | Partial | Yes | Via TurboTax |
| DonationCalc | High/low only | No | No | No | Yes | Yes |
| Salvation Army guide | Static table | No | No | No | Yes | No (PDF download) |
| Goodwill calculator | Regional/static | No | No | No | Yes | Receipt at dropoff |
| Kebab | eBay-sourced | Yes | Yes | Partial | Yes | Premium only |
| DeductAble | AI-suggested | Yes | Yes | Yes | Requires account | Yes |
| **This app (spec)** | **Low/mid/high slider** | **Yes** | **Yes** | **Yes (contextual)** | **Yes** | **Yes (8283 refs)** |

The FMV range slider, inline IRS threshold flags, and Form 8283-annotated PDF put this tool ahead of the free alternatives (DonationCalc, Salvation Army, Goodwill) and competitive with the paid/account-gated alternatives (DeductAble, Kebab) — without requiring an account or paying.

---

## Sources

- [What Happened to ItsDeductible? (Deductible Duck)](https://deductibleduck.com/what-happened-to-itsdeductible/) — MEDIUM confidence (analysis site, well-sourced)
- [TurboTax Community: ItsDeductible Discontinuation Discussion](https://ttlc.intuit.com/community/taxes/discussion/turbotax-is-discontinuing-itsdeductible-again-longtime-users-deserve-better/00/3700314) — HIGH confidence (primary user feedback, official Intuit community)
- [Charity Record: ItsDeductible Alternative Features](https://charityrecord.com/blog/itsdeductible-alternative-2025-taxes/) — MEDIUM confidence (competitor self-description)
- [DeductAble Features](https://deductable.ai/) — MEDIUM confidence (competitor self-description)
- [Kebab Donation App Features](https://kebab.tax/) — MEDIUM confidence (competitor self-description)
- [DonationCalc Features](https://donationcalc.com/) — MEDIUM confidence (competitor self-description)
- [Salvation Army Donation Value Guide](https://satruck.org/Home/DonationValueGuide) — HIGH confidence (primary source)
- [Goodwill DC Donation Value Calculator](https://dcgoodwill.org/donations/types-of-donations/used-goods-donation-value/) — HIGH confidence (primary source)
- [IRS Instructions for Form 8283 (Dec 2025)](https://www.irs.gov/instructions/i8283) — HIGH confidence (official IRS)
- [IRS Publication 526: Charitable Contributions (2025)](https://www.irs.gov/publications/p526) — HIGH confidence (official IRS)
- [2026 Tax Law Changes: OBBB Act Impact on Charitable Deductions](https://taxproject.org/obbb-donation-explainer/) — MEDIUM confidence (tax policy analysis site)
