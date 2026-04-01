# Expense Splitter

## What This Is

A single-page web app that splits a restaurant bill fairly among friends — handling shared appetizers, per-person assignments, configurable tip and tax, and penny-exact rounding. Users enter people, items, and assignments; the app calculates exactly what each person owes.

**Core value:** Give everyone at the table a fair, accurate number they owe. No mental math, no arguments.

## Context

**Stage:** v1.0 shipped
**Stack:** React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS v4 + Zustand + shadcn/ui (Nova preset)
**Testing:** Vitest 4 + React Testing Library — 105 tests, all green
**Scope:** v1 all requirements complete

## Current State

Shipped v1.0 with 2,302 LOC TypeScript across 4 phases (13 plans, 105 tests).

- People panel: add/remove people by name, cascade-clears assignments on remove
- Items panel: add/remove items with dollar-format price input (integer-cent storage)
- Assignment: per-item assignment selector (single person, subset, or everyone), unassigned warning
- Charges: tip selector (15/18/20/custom %) with equal/proportional split; tax ($/%) with equal/proportional split; NaN guards on custom inputs
- Subtotals strip: live per-person item subtotals updating as assignments change
- Summary table: Name | Subtotal | Tip | Tax | Total per person, penny-exact balance assertion
- Mobile layout: flex-col sm:flex-row at 640px breakpoint, 44px touch targets

## Requirements

### Validated (v1.0)

- ✓ Add/remove people by name — v1.0 (Phase 2)
- ✓ Remove person clears their item assignments — v1.0 (Phase 2)
- ✓ Add/remove items with prices (integer-cent storage) — v1.0 (Phases 1-2)
- ✓ Assign item to one person or shared subset — v1.0 (Phase 3)
- ✓ Unassigned item warning — v1.0 (Phase 3)
- ✓ Tip: 15/18/20/custom%, equal/proportional split — v1.0 (Phase 3)
- ✓ Tax: $/% mode, equal/proportional split — v1.0 (Phase 3)
- ✓ Final per-person breakdown (Name|Subtotal|Tip|Tax|Total) — v1.0 (Phase 4)
- ✓ Penny-exact totals (Largest Remainder + balance assertion) — v1.0 (Phase 4)
- ✓ Running subtotal visible as bill is built — v1.0 (Phase 4)
- ✓ Mobile-usable layout (375px, no horizontal scroll) — v1.0 (Phase 4)

### Active (v1.1 candidates)

- [ ] Export/share: generate a summary link or text to send to the group
- [ ] Receipt OCR: photo upload auto-populates items

### Out of Scope

- User accounts / auth — no persistence needed for single-session use
- Backend / database — pure frontend SPA
- Real-time collaboration — out of scope for v1
- Debt simplification — adds complexity, not core to restaurant use case
- Multi-currency — single currency per session sufficient

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React + Vite 8 | Fast dev, modern tooling | ✓ Good — zero config pain |
| Tailwind CSS v4 | @tailwindcss/vite plugin, no config file | ✓ Good — cleaner setup than v3 |
| Zustand over useReducer+Context | Less boilerplate, flat store API | ✓ Good — store stayed simple throughout |
| Integer-cent arithmetic (no library) | 30 lines covers all rounding needs | ✓ Good — no floating-point bugs |
| shadcn/ui Nova preset | Radix + Lucide + Geist font | ✓ Good — accessible primitives, no custom CSS |
| Vitest + RTL (Vite-native) | No duplicate transform config | ✓ Good — fast, no config overhead |
| Largest Remainder Method | Penny-exact distribution | ✓ Good — balance assertion catches bugs immediately |
| Always-distribute pattern in calculateBreakdowns | distributeRemainder(0,N) returns zeros — no guard needed | ✓ Good — simplified code |
| sm: breakpoint at 640px for mobile stack | Covers all phones | ✓ Good — 375px verified |
| vitest/config defineConfig (not vite defineConfig) | TypeScript type support for test block in Vitest 4 | ✓ Good — required for Vitest 4 |

---
*Last updated: 2026-04-01 after v1.0 milestone*
