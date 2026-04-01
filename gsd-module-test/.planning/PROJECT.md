# Expense Splitter

## What This Is

A web app that splits a restaurant bill fairly among friends — handling the messy reality of shared appetizers, different tip preferences, and tax calculations.

**Core value:** Give everyone at the table a fair, accurate number they owe. No more mental math, no more arguments about who had what.

## Context

**Stage:** Greenfield
**Stack:** React + Vite + Tailwind CSS
**Scope:** v1 core features only

## What We're Building

A single-page app where users can:
1. Add people to the bill (by name)
2. Add items from the receipt with prices
3. Assign items to people — including "shared" items (like appetizers split equally)
4. Configure tip — choose percentage (15%, 18%, 20%, custom) and split method (equal or proportional)
5. Configure tax — enter amount or percentage, same split options
6. See a final breakdown: "Sarah owes $34.50, Mike owes $28.20..."

## Requirements

### Validated

- [x] Add/remove people by name — Validated in Phase 02: people-items
- [x] Add/remove items with prices — Validated in Phase 02: people-items

### Active
- [ ] Assign items to one person or mark as "shared"
- [ ] Tip calculation with percentage selector (15/18/20/custom)
- [ ] Tip split: equal across everyone OR proportional to what they ordered
- [ ] Tax calculation: enter as amount or percentage
- [ ] Tax split: equal OR proportional
- [ ] Final summary showing each person's total owed
- [ ] Correct rounding (no penny errors)

### Out of Scope

- Receipt photo OCR — adds complexity, not core
- Venmo/payment deep links — v2
- Save/share/history — v2

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite | Modern, fast, great DX for interactive UI | — Pending |
| Tailwind CSS | Utility-first, clean UI without custom CSS | — Pending |
| No backend | Pure frontend — no auth, no persistence needed for v1 | — Pending |

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
**Current state:** Phase 02 complete — PeoplePanel + ItemsPanel built, cascade delete wired, 160 tests green.

*Last updated: 2026-04-01 after Phase 02: people-items*
