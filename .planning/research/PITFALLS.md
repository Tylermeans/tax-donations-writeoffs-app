# Domain Pitfalls: Charitable Donation Itemizer / Tax Calculator

**Domain:** Browser-based IRS non-cash charitable contribution calculator with FMV lookup and PDF export
**Researched:** 2026-03-23
**Overall confidence:** HIGH (IRS sources are authoritative and current as of 12/2025)

---

## Critical Pitfalls

Mistakes in this category cause incorrect tax outcomes, user data loss, or deduction disallowance.

---

### Pitfall 1: IRS Threshold Logic Conflating Per-Event and Aggregate Totals

**What goes wrong:** The $250 written acknowledgment threshold applies **per donation event** (each drop-off date and organization), while the $500 Form 8283 threshold applies to the **aggregate total** of all noncash donations on the return. Apps commonly display both flags based on the running grand total, which causes two distinct errors: (a) missing the $250 flag when a single event exceeds $250 but the total hasn't yet, and (b) triggering the $500 Form 8283 flag when only one organization's subtotal crosses it when it shouldn't yet.

**Why it happens:** Developers model a single running total for simplicity. The per-organization, per-date scoping of the $250 rule is easy to miss on a first read of Publication 526.

**Consequences:** Users may file without the required written acknowledgment for a specific donation, resulting in deduction disallowance for that event. The IRS has successfully disallowed contributions over $250 when written acknowledgment was not timely obtained — and it cannot be obtained retroactively after the original return is filed.

**Prevention:**
- Track threshold state at two levels: per `DonationEvent` (for $250 rule) and aggregate (for $500 and $5,000 rules).
- When any single `DonationEvent.items` total exceeds $250, display the written acknowledgment reminder scoped to that specific event and organization.
- Display Form 8283 Section A flag when the grand total across all events exceeds $500.
- Display Form 8283 Section B flag when any single item across all events exceeds $5,000.

**Detection:** Write a test with three donation events — one at $180, one at $280, one at $200 — grand total $660. The $250 acknowledgment flag should appear only on event 2. The Form 8283 flag should appear because the aggregate exceeds $500. If either flag is wrong, this bug is present.

**Phase to address:** Phase 1 (core logic) — getting threshold scoping wrong here contaminates all downstream features.

---

### Pitfall 2: Presenting FMV Values as IRS-Authoritative When They Are Thrift-Store Estimates

**What goes wrong:** The Salvation Army and Goodwill valuation guides are published as internal pricing references for what their stores expect to sell items for — not as official IRS-sanctioned FMV schedules. IRS Publication 561 defines FMV as "the price that property would sell for on the open market" between a willing buyer and willing seller. Apps that present hardcoded guide values as "IRS FMV" imply a level of authority these values do not have, which may encourage users to claim values that the IRS would challenge.

**Why it happens:** Third-party sites frequently describe these guides as "IRS-approved" or "IRS-recognized," and the confusion proliferates. The guides are useful starting points but are not IRS publications.

**Consequences:** Users may claim high-end range values on deductible items without adjustment for actual condition, age, or local market. If audited, the user bears the burden of substantiating FMV. Overvaluation by 150% or more triggers a 20% accuracy-related penalty; overvaluation by 200% or more triggers a 40% penalty (IRC §6662).

**Prevention:**
- Label values explicitly as "estimated thrift-store range (Salvation Army / Goodwill valuation guide)" — not as "IRS value" or "IRS-approved FMV."
- The suggested default should be the low-to-mid range, not the high value, as a conservative default reduces audit exposure.
- Add a UI tooltip or inline note: "FMV is what a buyer would pay today at a thrift store. Use the range as a guide; your actual value depends on item age and local market."
- Cite the source on each item card: "Source: Salvation Army Valuation Guide (2025)."

**Detection:** Review every FMV-displaying UI element. Any instance of the word "IRS" adjacent to a specific dollar value without attribution is a red flag.

**Phase to address:** Phase 1 (FMV data wiring) and Phase 2 (UI copy review).

---

### Pitfall 3: FMV Data Silently Going Stale After Initial Build

**What goes wrong:** Hardcoded FMV values sourced from the Salvation Army / Goodwill guides at build time become stale once those organizations update their guides. The Salvation Army guide has historically been updated infrequently (some regional versions still reference 2013 data in 2025 per third-party aggregators), but Goodwill regional chapters publish independent guides with varying timelines. If the app presents year-stamped data without a visible "last verified" indicator, users in future tax years may rely on stale values.

**Why it happens:** "Hardcoded for v1" decisions don't include a review trigger. The data model supports year-keying, but the process for updating those values is undefined.

**Consequences:** A user filing 2026 taxes using 2025 FMV ranges faces potential overvaluation on items where thrift-market prices have shifted. Electronics in particular depreciate rapidly year-over-year.

**Prevention:**
- Add a `last_verified` date field to the FMV data structure alongside `tax_year`. Display this in the UI: "Values sourced from Salvation Army guide, verified [date]."
- Document in the codebase (as a code comment in the data file, not a README) exactly which source URL and document version was used, so future maintainers can diff against updates.
- Flag electronics as requiring extra scrutiny in UI copy, since IRS Publication 561 explicitly calls out that electronics FMV must account for rapid depreciation.

**Detection:** Check whether the FMV data file contains a source URL and verification date. If not, this pitfall is unaddressed.

**Phase to address:** Phase 1 (data structure design) — the year-keyed model already partially addresses this, but the `last_verified` field and source annotation need to be baked in from day one.

---

### Pitfall 4: localStorage Data Loss Without User Warning

**What goes wrong:** localStorage is silently wiped in four common scenarios: (1) Private/Incognito mode on Safari deletes all localStorage on tab close; (2) Chrome and Firefox Incognito mode retain data only for the session; (3) Users who clear browser history / cookies ("clear all site data") lose their donation log without warning; (4) Some browser privacy extensions (uBlock, Privacy Badger) block or clear localStorage for first-party sites. A user who has entered 40 items across three donation events and then closes an Incognito tab loses everything.

**Why it happens:** localStorage is easy to implement and sufficient for most cases, so developers don't add defensive handling for its failure modes.

**Consequences:** Complete data loss for the user's donation session. For a tax prep tool, losing an hour of carefully entered data is a severe UX failure that destroys trust.

**Prevention:**
- On app load, attempt a localStorage write test (`setItem` / `getItem` / `removeItem`) and detect failure or quota errors.
- If localStorage is unavailable or returns `null` unexpectedly, display a persistent banner: "Your data is saved only while this tab is open. Private browsing mode may not save your work."
- Provide an explicit "Export / Save backup" option (JSON download) so users can persist data outside the browser before closing.
- Implement an auto-save indicator ("Saved" with timestamp) so users can see their data is being persisted.
- Gracefully catch `QuotaExceededError` on write — a user with many items could exhaust the ~5MB localStorage quota.

**Detection:** Open the app in a Safari Private window, add three items, close the tab, reopen. If data is gone with no prior warning, this pitfall is unaddressed.

**Phase to address:** Phase 1 (persistence implementation) and the JSON export feature should ship in the same milestone.

---

### Pitfall 5: "Poor" Condition Items Creating a Hidden Compliance Trap

**What goes wrong:** IRC §170(f)(16) bars a deduction for clothing or household items **not in good used condition or better** unless: (a) the item's value exceeds $500 AND (b) a qualified appraisal is obtained. An app that allows users to add items in "Poor" condition and assigns them a nonzero FMV — even a low one — may generate a PDF that a user submits to their CPA or attaches to Form 8283. If those items are valued under $500, the IRS can disallow the deduction entirely.

**Why it happens:** The condition toggle is primarily treated as an FMV multiplier (Poor = lower FMV) rather than as a compliance gate.

**Consequences:** Users unknowingly claim deductions that are per se disallowed under §170(f)(16), regardless of the dollar amount. This is not an audit risk — it is an automatic disallowance.

**Prevention:**
- When condition is set to "Poor," display a warning: "Items in poor condition are generally not deductible unless the item's value exceeds $500 and you have a qualified appraisal (IRC §170(f)(16))."
- For Poor-condition items under $500, display the item with a strikethrough in the total and exclude it from the deductible sum, unless the user explicitly overrides with a note that they have a qualified appraisal.
- The PDF export should clearly mark Poor-condition items as "Verify eligibility — may not be deductible" rather than silently including them in the total.

**Detection:** Add one "Poor" condition item at $8 FMV. Check whether it appears in the deductible total and in the PDF. If it does without any warning, this pitfall is present.

**Phase to address:** Phase 1 (item model and running total logic).

---

## Moderate Pitfalls

Mistakes that produce a degraded experience, confusing output, or wasted developer effort.

---

### Pitfall 6: PDF Table Breaking Mid-Row Across Page Boundaries

**What goes wrong:** HTML-to-canvas PDF approaches (html2canvas + jsPDF) render the entire DOM as a single tall image and then slice it at page boundaries. A multi-item donation log with long tables will have rows split in half — a row starting on page 1 continues on page 2 with no visual or logical break indication. This is especially problematic for a tax document that a CPA needs to read line-by-line.

**Why it happens:** html2canvas does not understand CSS `page-break-inside: avoid`. It just slices pixels.

**Prevention:**
- Use `@react-pdf/renderer` instead of html2canvas for the PDF export. It supports flexbox layout, explicit page breaks, and vector text that remains searchable.
- Alternatively, use the browser's native `window.print()` with a print-specific stylesheet that sets `page-break-inside: avoid` on each table row — this avoids a library dependency entirely and produces clean output.
- If html2canvas is used anyway, pre-calculate row heights and manually paginate before rendering.

**Detection:** Add more than 15 items to produce a multi-page PDF. Inspect page boundaries for split rows.

**Phase to address:** Phase 1 (PDF export implementation) — choose the approach before building, not after.

---

### Pitfall 7: Mobile Table Overflow Destroying Usability on 375px Viewports

**What goes wrong:** A donation log table with columns for Item, Condition, Qty, FMV Low, FMV High, Selected FMV, and Line Total is too wide to fit on a 375px screen. A naive implementation either overflows the viewport (causing horizontal page scroll) or squashes columns to unreadable widths. This affects the core user interaction loop — users add items on mobile and can't see the values they just entered.

**Why it happens:** Tables are designed desktop-first where they look fine, and mobile testing is deferred.

**Prevention:**
- For mobile (<640px), collapse the table to a card-per-item layout. Each item is a stacked card showing Name, Condition badge, Qty, and the selected FMV. Edit/delete actions are accessible via tap.
- The running total sticky footer provides the summary that the table columns would otherwise give at a glance.
- Avoid using `<table>` for the item list — use a list of cards or `<dl>` elements that reflow naturally. Use a proper `<table>` only in the PDF export and print view, where layout is controlled.

**Detection:** Resize browser to 375px. If horizontal scrolling appears on the main page or any column text is truncated to < 4 characters, this pitfall is present.

**Phase to address:** Phase 1 (component design) — retrofitting a table to cards after the fact is expensive.

---

### Pitfall 8: Legal Disclaimer Absent or Buried in Fine Print

**What goes wrong:** A tax calculation tool that presents dollar values to users without a clear disclaimer about the tool's limitations creates an implied warranty of accuracy. The IRS does not endorse any third-party FMV tool. If a user relies on the app's values, submits a return, gets audited, and faces a penalty, the absence of a clear disclaimer creates a trust and potential liability problem.

**Why it happens:** Disclaimers feel like legal boilerplate that can be added later. They're frequently deprioritized.

**Consequences:** User frustration if audited ("the app told me this was the right value"). While the app has no legal obligation in tort (it's a free tool), the reputational damage from users citing it in bad outcomes is real.

**Prevention:**
- Display a persistent, scannable disclaimer in the UI — not in a footer, but near the total panel where values are most prominent. Example: "These estimates are based on Salvation Army and Goodwill valuation guides. FMV is determined by the IRS based on actual market conditions. Consult a tax professional for final deduction values."
- Include the disclaimer in the PDF export header, not just the web UI.
- Do not include the word "accurate" or "correct" anywhere in the UI copy relative to the computed values. Use "estimated" or "suggested."

**Detection:** Read every instance of FMV display and the PDF export. If the word "accurate" appears, or if no disclaimer appears near the dollar total, this pitfall is present.

**Phase to address:** Phase 1 (copy and PDF template).

---

### Pitfall 9: Keyboard and Screen Reader Navigation Broken on Complex Form Rows

**What goes wrong:** Each item in the donation log contains multiple interactive controls: condition radio/toggle, quantity +/- buttons, FMV range slider, and a delete button. Without explicit focus management and ARIA labeling, a screen reader user encounters unlabeled buttons ("button," "button," "button") and sliders without context. Additionally, inline +/- quantity controls are frequently implemented as `<div>` with `onClick` handlers rather than `<button>` elements, making them unreachable via keyboard Tab navigation.

**Why it happens:** Form-heavy UIs are built for mouse interaction first. ARIA and keyboard handling are added as an afterthought, if at all.

**Prevention:**
- Use `<button>` for all interactive controls, never `<div onClick>` or `<span onClick>`.
- Each quantity control group should have `aria-label="Increase quantity for [item name]"` / `"Decrease quantity for [item name]"` dynamically set.
- Each condition toggle should use `role="radiogroup"` with `aria-labelledby` pointing to the item name.
- The FMV range slider should include `aria-label`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` attributes.
- Run VoiceOver (macOS) or NVDA (Windows) end-to-end through the add-item flow during development, not after.

**Detection:** Tab through the form without a mouse. If focus ever disappears or skips interactive controls, keyboard navigation is broken.

**Phase to address:** Phase 1 (component implementation) — accessibility must be built in, not bolted on.

---

## Minor Pitfalls

Smaller issues that create friction but don't break core functionality.

---

### Pitfall 10: Condition Multiplier Not Aligned With Salvation Army Guide Tiers

**What goes wrong:** The app uses a three-tier condition toggle (Poor / Good / Excellent) with a corresponding FMV multiplier. But Salvation Army's published guide typically provides a single value or a low/high range per item — it does not provide explicit condition multipliers. If the multiplier is invented (e.g., Poor = 0.5x, Excellent = 1.5x) without a source, the resulting values are no longer grounded in the published guide and are harder to defend if challenged.

**Prevention:**
- Use the published low/mid/high range as the proxy for condition: Poor condition = low range, Good = mid, Excellent = high. This ties the condition selection directly to published values rather than an arbitrary multiplier.
- Document this mapping in code comments so future maintainers understand the rationale.

**Phase to address:** Phase 1 (data model and FMV logic).

---

### Pitfall 11: Tax Year Selection Defaulting Incorrectly Near Filing Deadline

**What goes wrong:** The app defaults to the current calendar year as the tax year. However, users filing taxes in January–April 2026 are filing for tax year 2025. If the app auto-selects "2026" during those months, users may see year-labeled data that doesn't match their filing year.

**Prevention:**
- Default the tax year to the current calendar year minus 1 if the current date is between January 1 and April 15 (tax filing season). After April 15, default to the current calendar year.
- Regardless of the default, make the tax year selection visible and easy to change on first load.

**Phase to address:** Phase 1 (initial state / app initialization).

---

### Pitfall 12: PDF Export Including Donor PII Without a Clear Warning

**What goes wrong:** The app collects donor name for the PDF export. If a user shares the PDF (e.g., emails it to their CPA), the file may contain more personal detail than they realized they were including. This is not a GDPR/legal issue for a purely frontend app, but it creates unexpected user friction.

**Prevention:**
- Mark donor name and address fields as "Optional — appears on exported PDF."
- On the export screen, show a preview summary of what personal data will appear in the PDF before the user downloads it.

**Phase to address:** Phase 1 (export UI).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Running total / threshold flags | Conflating per-event $250 rule with aggregate $500 rule (Pitfall 1) | Track thresholds at DonationEvent level AND aggregate level |
| FMV data wiring | Presenting charity guide values as IRS-authoritative (Pitfall 2) | Copy review: "estimated range from [guide]" not "IRS FMV" |
| FMV data structure | Stale values with no verification date (Pitfall 3) | Add `last_verified` field and source URL to data file |
| localStorage persistence | Silent data loss in Private/Incognito mode (Pitfall 4) | localStorage availability check on mount + JSON export |
| Condition toggle | "Poor" items included in deductible total (Pitfall 5) | Condition gate with §170(f)(16) warning |
| PDF export | Mid-row page breaks (Pitfall 6) | Use @react-pdf/renderer or native print CSS |
| Item list layout | Table overflow on 375px (Pitfall 7) | Card layout on mobile, table only on desktop and print |
| Legal copy | No disclaimer near dollar totals (Pitfall 8) | Persistent disclaimer in UI and PDF header |
| Form controls | Unlabeled buttons and sliders (Pitfall 9) | ARIA labels on all interactive controls, `<button>` elements only |
| Condition multipliers | Invented multipliers vs. published ranges (Pitfall 10) | Map condition tiers to low/mid/high published range |
| Tax year default | Wrong year default during filing season (Pitfall 11) | Smart default: Jan–Apr defaults to prior year |
| PDF PII | Donor name in export without user awareness (Pitfall 12) | Label fields as "optional — appears in PDF" |

---

## Sources

- [IRS Publication 561 (12/2025) — Determining the Value of Donated Property](https://www.irs.gov/publications/p561) — HIGH confidence
- [IRS Publication 526 (2025) — Charitable Contributions](https://www.irs.gov/publications/p526) — HIGH confidence
- [IRS Instructions for Form 8283 (12/2025)](https://www.irs.gov/instructions/i8283) — HIGH confidence
- [IRS: Charitable Contributions — Written Acknowledgments](https://www.irs.gov/charities-non-profits/charitable-organizations/charitable-contributions-written-acknowledgments) — HIGH confidence
- [IRC §6662 — Accuracy-Related Penalty on Underpayments (Cornell LII)](https://www.law.cornell.edu/uscode/text/26/6662) — HIGH confidence
- [Delia Law: About Overstating Charitable Deductions and IRS Penalties](https://deliataxattorneys.com/about-overstating-charitable-deductions-and-irs-penalties/) — MEDIUM confidence
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — HIGH confidence (private mode behavior)
- [Salvation Army Donation Value Guide 2025 — Deductible Duck](https://deductibleduck.com/salvation-army-donation-value-guide/) — MEDIUM confidence (third-party aggregator)
- [Goodwill Donation Value Guide (2025) — Deductible Duck](https://deductibleduck.com/goodwill-donation-value-guide/) — MEDIUM confidence (third-party aggregator)
- [DEV Community: I Tried 5 Ways to Generate PDFs in React](https://dev.to/alpovka/i-tried-5-ways-to-generate-pdfs-in-react-only-one-let-me-keep-my-actual-components-3l1d) — MEDIUM confidence (community article)
- [W3C WAI: Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/) — HIGH confidence (official W3C)
