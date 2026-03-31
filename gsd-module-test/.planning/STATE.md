# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** Give everyone at the table a fair, accurate number they owe — no mental math, no arguments
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 0 of 3 in current phase
Status: Ready to plan
Last activity: 2026-03-31 — Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Zustand chosen for state management over useReducer+Context (less boilerplate, flat store API)
- Roadmap: Integer-cent arithmetic (no library) — 30 lines covers all rounding needs
- Roadmap: shadcn/ui for accessible form primitives (Tailwind-native, Radix-backed)
- Roadmap: Vitest + React Testing Library (Vite-native, no duplicate transform config)

### Pending Todos

None yet.

### Blockers/Concerns

- Verify current Zustand/Vitest/shadcn CLI versions on npm before Phase 1 install
- shadcn/ui has no built-in multi-select checkbox — AssignmentSelector will need custom composition from Radix Checkbox + Popover (assess in Phase 3)
- Confirm product decision: tip and tax split method configured independently per charge (research recommends yes, PROJECT.md is silent)

## Session Continuity

Last session: 2026-03-31
Stopped at: Roadmap written, ready to begin Phase 1 planning
Resume file: None
