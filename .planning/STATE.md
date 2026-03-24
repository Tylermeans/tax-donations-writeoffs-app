# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-23)

**Core value:** Users can quickly and accurately total the fair market value of their donated items so they claim the full deduction they're legally entitled to.
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 3 (Foundation)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-23 — Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Init: Hardcoded FMV over live API — no API key friction, simpler stack
- Init: @react-pdf/renderer over jsPDF — vector PDF required for tax documents
- Init: Zustand persist over hand-rolled localStorage — schema migration support
- Init: Poor-condition items excluded from totals + strikethrough — §170(f)(16) compliance
- Init: $250 threshold is per-event; $500/$5K thresholds are aggregate — critical scoping

### Pending Todos

None yet.

### Blockers/Concerns

- FMV data values for the 2025 catalog must be manually transcribed from Salvation Army/Goodwill guides before Phase 2 begins (data entry work, not architecture gap)
- @react-pdf/renderer font registration approach (built-in Helvetica vs. custom) should be decided before Phase 3 begins

## Session Continuity

Last session: 2026-03-23
Stopped at: Roadmap created, ready to plan Phase 1
Resume file: None
