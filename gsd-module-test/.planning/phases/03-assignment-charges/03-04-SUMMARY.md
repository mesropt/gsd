---
phase: 03-assignment-charges
plan: "04"
subsystem: calculations
tags: [calculations, tdd, pure-function, tip, tax, breakdown]
dependency_graph:
  requires: ["03-01", "03-02"]
  provides: ["calculateBreakdowns"]
  affects: ["Phase 4 SummaryPanel"]
tech_stack:
  added: []
  patterns: ["TDD red-green", "integer-cent arithmetic", "Largest Remainder Method"]
key_files:
  created: []
  modified:
    - src/lib/calculations.ts
    - src/lib/calculations.test.ts
decisions:
  - "Used always-distribute pattern (no guard around zero tip/tax) — distributeRemainder(0,N) and distributeProportionally(0,weights) both return arrays of zeros, so guard is redundant and the simpler approach is cleaner"
  - "Subtotals snapshot taken AFTER item distribution — ensures proportional weights reflect actual item allocations before tip/tax computation"
metrics:
  duration: "113s"
  completed_date: "2026-04-01"
  tasks_completed: 2
  files_modified: 2
---

# Phase 03 Plan 04: calculateBreakdowns Summary

**One-liner:** Pure `calculateBreakdowns(AppState) -> Map<personId, centsOwed>` using integer-cent distributeRemainder/distributeProportionally helpers for exact-sum tip and tax splits.

## What Was Built

Added `calculateBreakdowns` to `src/lib/calculations.ts` — the core calculation engine that Phase 4 (SummaryPanel) will consume. The function is pure (no store reads), takes an `AppState`, and returns a `Map<string, number>` mapping each person's ID to the total integer cents they owe.

**Algorithm:**
1. Initialize all person totals to 0
2. Distribute each item's cost using `distributeRemainder` among its assignees (skip unassigned items)
3. Take subtotals snapshot for proportional weights
4. Compute `tipCents`: percent mode = `Math.round(totalSubtotal * value / 100)`, amount mode = value directly
5. Distribute tip: equal → `distributeRemainder`, proportional → `distributeProportionally`
6. Same pattern for tax
7. Return totals map

**Divide-by-zero:** Handled transparently by `distributeProportionally`'s built-in guard — when all weights are 0, it falls back to `distributeRemainder` (equal split).

## Tests Added

11 new test cases in `describe('calculateBreakdowns')` block:
- Empty people → empty Map
- Single assignee gets full item cost
- Shared item split equally (odd-cent remainder handled)
- Equal tip split ignores subtotal weights
- Proportional tip split by subtotal weights
- Tax amount mode (value already in cents)
- Tax percent mode (computed from subtotal)
- Proportional split with all-zero subtotals (no crash, no NaN)
- Proportional split with zero subtotals + nonzero amount tip (falls back to equal)
- Unassigned items skipped
- Exact-sum guarantee (3 people, mixed assignments, 18% tip + 8.5% tax)

**Total test suite: 73 tests across 7 files — all green.**

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- `src/lib/calculations.ts` contains `export function calculateBreakdowns`
- `src/lib/calculations.test.ts` contains `describe('calculateBreakdowns'`
- Commits verified: `3cad054` (test RED), `1e4eb29` (feat GREEN)
- Full test suite: 73/73 pass
