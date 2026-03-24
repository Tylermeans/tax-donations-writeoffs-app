# Donation Itemizer — Product Spec
**A Claude-powered web app for charitable donation write-offs**

---

## Overview

A browser-based tool that lets individuals itemize non-cash charitable donations, automatically look up IRS fair market value (FMV) ranges for each item type, and generate a formatted write-off summary for tax filing. The app uses Claude + live web search to pull current IRS guidance and Salvation Army / Goodwill valuation schedules, so values stay accurate year over year without manual maintenance.

---

## Problem

Taxpayers who donate clothing, gear, furniture, and household goods to Goodwill, Salvation Army, or similar 501(c)(3) organizations can deduct fair market value — but:

- FMV lookup is manual and tedious
- IRS guidance and charity valuation schedules change year to year
- Most people don't realize how much they can legally deduct
- Keeping donation logs across multiple drop-off dates is disorganized

---

## Solution

A single-page web app powered by the Anthropic API where users:

1. Add one or more **donation dates**
2. Search or browse **item categories** (clothing, shoes, furniture, electronics, sporting goods, etc.)
3. Enter **quantities** per item
4. Receive **IRS-grounded FMV estimates** pulled via Claude + web search in real time
5. Export a clean **write-off summary** (PDF or printable view) ready to hand to a CPA or attach to Form 8283

---

## Core Features

### Multi-Date Donation Log
- Add unlimited donation events, each with a date and optional organization name
- Items are scoped to a donation date
- Grand total aggregates across all dates

### Item Catalog with Live FMV Lookup
- Searchable item list (type-ahead) covering:
  - Clothing (shirts, pants, dresses, outerwear, shoes, accessories)
  - Household (furniture, lamps, kitchenware, linens)
  - Electronics (phones, laptops, monitors — note: IRS requires special handling)
  - Sporting goods (skis, bikes, golf clubs, weights)
  - Books, media, toys
  - Instruments
- On item add, Claude queries the web for:
  - Current IRS Publication 561 guidance on that category
  - Salvation Army / Goodwill published valuation ranges for the current tax year
  - Returns a **low / mid / high** FMV range and lets the user pick or enter their own

### Quantity Editor
- Inline +/- controls per item
- Bulk quantity entry for high-volume donations (e.g., 30 shirts)
- Condition toggle: Poor / Good / Excellent (adjusts FMV multiplier)

### Running Total Dashboard
- Live-updating deduction total as items are added
- Visual breakdown by donation date and category
- Flag when total exceeds $500 (Form 8283 required) or $5,000 (qualified appraisal required)

### Export
- Printable / PDF summary matching IRS non-cash contribution format
- Includes: donor info, organization name, donation dates, item list with quantities and FMV, total
- Form 8283 field reference callouts

---

## Technical Architecture

### Frontend
- **Framework**: React (single JSX file for artifact deployment, or Vite project for standalone)
- **Styling**: Tailwind utility classes or CSS variables matching a clean, editorial aesthetic
- **State**: `useState` / `useReducer` for donation log; no localStorage (session only unless extended)
- **Persistence**: Optional — Anthropic artifact storage API (`window.storage`) for cross-session save

### AI Layer (Anthropic API)
```
POST https://api.anthropic.com/v1/messages
Model: claude-sonnet-4-20250514
Tools: web_search (type: "web_search_20250305")
```

**FMV Lookup Prompt Pattern**
```
System: You are a tax research assistant specializing in IRS charitable contribution 
valuation. Return only JSON. No markdown, no preamble.

User: What is the IRS fair market value range for a donated [ITEM] in [CONDITION] 
condition for tax year [YEAR]? Search current IRS Publication 561 and Salvation Army 
or Goodwill valuation guides. Return:
{
  "item": string,
  "condition": "poor" | "good" | "excellent",
  "fmv_low": number,
  "fmv_mid": number,
  "fmv_high": number,
  "source": string,
  "irs_notes": string,
  "tax_year": number
}
```

**Web Search Tool Config**
```js
tools: [
  {
    type: "web_search_20250305",
    name: "web_search"
  }
]
```

**Response Parsing**
```js
const toolResults = data.content
  .filter(item => item.type === "mcp_tool_result" || item.type === "text")
  .map(item => item.text || "")
  .join("");

const fmvData = JSON.parse(toolResults.replace(/```json|```/g, "").trim());
```

### Data Model
```ts
type Condition = "poor" | "good" | "excellent";

interface DonationItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: Condition;
  fmv_low: number;
  fmv_mid: number;
  fmv_high: number;
  fmv_selected: number;       // user-chosen value within range
  source: string;
  irs_notes: string;
}

interface DonationEvent {
  id: string;
  date: string;               // ISO date string
  organization: string;
  items: DonationItem[];
}

interface DonationLog {
  tax_year: number;
  events: DonationEvent[];
}
```

---

## UX Flow

```
1. Land on app
   → Prompted to select tax year (defaults to current)
   → Optional: enter donor name + organization

2. Add donation date
   → Calendar picker
   → Organization name field (Goodwill, Salvation Army, etc.)

3. Add items
   → Search bar: type "jeans" → autocomplete suggests "Jeans / Pants (denim)"
   → Click → FMV lookup fires (Claude + web search)
   → Loading state: "Looking up IRS valuation for jeans..."
   → FMV range card appears: "$8 – $12 (good condition)"
   → Quantity field + condition toggle
   → Item added to donation event with running line total

4. Repeat for all items / all dates

5. Review summary
   → Table grouped by date
   → Grand total with 8283 / appraisal flags
   → "Export PDF" button

6. Export
   → Formatted one-pager with all donation events
   → IRS-compliant layout with source citations
```

---

## IRS Compliance Notes

| Threshold | Requirement |
|-----------|-------------|
| Any amount | Must itemize on Schedule A (Form 1040) |
| > $250 per donation | Written acknowledgment from organization required |
| > $500 total non-cash | Form 8283 Section A required |
| > $5,000 single item | Qualified appraisal + Form 8283 Section B required |
| Any amount | Items must be in "good used condition or better" (IRC §170(f)(16)) |

The app should surface these flags contextually — not as fine print.

---

## Item Category Seed List

Use this to pre-populate the searchable catalog. Claude fills in FMV at lookup time.

**Clothing**
Shirts (casual), Dress shirts, T-shirts, Sweaters, Hoodies, Jeans, Dress pants, Shorts,
Skirts, Dresses, Suits (full), Suit jackets, Blazers, Outerwear (coats/jackets),
Shoes (casual), Dress shoes, Boots, Sneakers, Sandals, Intimates / swimwear / bras,
Hats / caps, Scarves / gloves, Belts, Handbags / purses, Ties, Socks

**Sporting Goods**
Skis (pair), Ski poles (pair), Ski boots, Snowboard, Bicycle, Golf clubs (set),
Golf clubs (individual), Tennis racket, Hockey skates, Ice skates, Weights / dumbbells,
Treadmill, Exercise bike, Kayak, Paddleboard, Fishing rod, Sleeping bag, Tent, Backpack

**Furniture**
Sofa / couch, Loveseat, Chair (upholstered), Coffee table, End table, Dining table,
Dining chairs, Bed frame (full / queen / king), Dresser, Bookshelf, Desk, Office chair,
Lamp (floor / table), Mirror, TV stand

**Electronics** *(FMV = depreciated value; IRS scrutiny higher)*
Smartphone, Laptop, Desktop computer, Monitor, Tablet, Printer, TV (flat panel),
Gaming console, Camera, Headphones, Speaker

**Household**
Dishes / dinnerware set, Pots and pans, Kitchen appliances (small), Linens / bedding,
Towels, Curtains / drapes, Rugs, Picture frames, Decorative items

**Books / Media / Toys**
Books (hardcover), Books (paperback), DVDs / Blu-rays, Board games, Toys (general),
Musical instruments (guitar, keyboard, etc.)

---

## Out of Scope (v1)

- Vehicle donations (separate IRS rules, Form 1098-C)
- Real estate donations
- Stock / securities donations
- Cash donations (no FMV calculation needed)
- Multi-user / account system
- Backend persistence (session-only unless `window.storage` is used)

---

## Build Phases

### Phase 1 — Static MVP
- Hardcoded FMV values from current Salvation Army guide
- Multi-date log, quantity editor, running total
- PDF export
- No API calls

### Phase 2 — Live FMV Lookup
- Integrate Anthropic API + web_search tool
- Per-item FMV lookup with loading state
- Source citation on each item card
- Low / mid / high range picker

### Phase 3 — Persistence + Export
- `window.storage` save/load for cross-session log
- Enhanced PDF with Form 8283 field mapping
- Print-optimized layout
- Shareable summary link (base64 state in URL)

---

## Open Questions

- Should FMV lookup happen on item add, or on a manual "refresh" trigger? (Auto is better UX; manual is cheaper on API calls)
- Do we cache FMV results per item+condition+year to avoid duplicate lookups?
- Should the app support multiple organizations per donation date?
- Is there value in a "prior year comparison" view (2024 vs 2025 FMV changes)?

---

## References

- [IRS Publication 561 — Determining the Value of Donated Property](https://www.irs.gov/publications/p561)
- [IRS Form 8283 — Noncash Charitable Contributions](https://www.irs.gov/forms-pubs/about-form-8283)
- [Salvation Army Donation Value Guide](https://www.salvationarmyusa.org/usn/ways-to-give/give-stuff/valuation-guide/)
- [Goodwill Valuation Guide](https://www.goodwill.org/donors/donate-stuff/valuation-guide/)
- [IRC Section 170 — Charitable Contributions](https://www.law.cornell.edu/uscode/text/26/170)
