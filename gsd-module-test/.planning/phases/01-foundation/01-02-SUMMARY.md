---
phase: 01-foundation
plan: 01-02
subsystem: math-core
tags: [math, monetary, tdd, vitest, integer-cents]
dependency_graph:
  requires: [01-01]
  provides: [calculations.ts math helpers]
  affects: [store, summary-panel, all monetary calculations]
tech_stack:
  added: []
  patterns: [Integer-cent math, Largest Remainder Method, TDD red-green]
key_files:
  created:
    - src/lib/calculations.ts
    - src/lib/calculations.test.ts
  modified: []
decisions:
  - Largest Remainder Method used for both equal and proportional distribution to guarantee sum invariant
  - distributeRemainder assigns remainder pennies to first indices (index 0 first); distributeProportionally assigns by largest fractional part
  - Zero-weight guard in distributeProportionally falls back to equal split rather than returning NaN
metrics:
  duration: ~5 minutes
  completed: 2026-03-31
  tasks_completed: 2
  files_created: 2
---

# Phase 1 Plan 02: Math core — toCents, fromCents, distributeRemainder with Vitest unit tests Summary

**One-liner:** Integer-cent math helpers with Largest Remainder distribution, fully TDD with 19 passing Vitest tests covering penny-remainder edge case and sum invariant.

## What Was Built

Four pure TypeScript functions in `src/lib/calculations.ts` that handle all monetary arithmetic for the Expense Splitter app, with comprehensive Vitest unit tests in `src/lib/calculations.test.ts`.

### Function Signatures

```typescript
// Parse dollar string/number to integer cents (no float leakage)
export function toCents(dollars: string | number): number

// Format integer cents to '$X.XX' display string
export function fromCents(cents: number): string

// Equal split using Largest Remainder Method — guarantees sum === totalCents
export function distributeRemainder(totalCents: number, parts: number): number[]

// Weighted split using Largest Remainder Method — zero-weight fallback to equal split
export function distributeProportionally(totalCents: number, weights: number[]): number[]
```

## Test Results

- **Total tests:** 19 passing, 0 failing
- **Test file:** `src/lib/calculations.test.ts` (69 lines)
- **Implementation:** `src/lib/calculations.ts` (96 lines)
- **Command:** `npm test -- --run src/lib/calculations.test.ts` exits 0

### Test breakdown

| Describe block | Tests | Key cases |
|---|---|---|
| toCents | 6 | Plain string, `$` strip, comma strip, half-cent rounding, numeric input, zero |
| fromCents | 3 | Standard format, zero, single cent ($0.01) |
| distributeRemainder | 6 | Even split, penny-remainder [34,33,33], sum property, single part, zero total, zero parts |
| distributeProportionally | 4 | Equal weights, all-zero weights (no NaN), [3,1] weights = [8,2], sum property |

### Critical test: penny-remainder edge case

```
distributeRemainder(100, 3) === [34, 33, 33]   // PASSES
result.reduce((a, b) => a + b, 0) === 100       // PASSES
```

This is the key correctness property — ensures no penny is ever lost in a bill split.

## TDD Execution

- **Task 1 (RED):** `calculations.test.ts` committed with failing import error (no implementation). Commit: `f9a447a`
- **Task 2 (GREEN):** `calculations.ts` implemented, all 19 tests pass. Commit: `3c122b6`

## Deviations from Plan

None - plan executed exactly as written.

The test file (`calculations.test.ts`) was found already present in `src/lib/` from plan 01-01's scaffold work, and it exactly matched the plan's required content. The RED state was confirmed (import error since `calculations.ts` didn't exist), the Task 1 commit was made, and the implementation was created in Task 2 to achieve GREEN.

## Known Stubs

None — all four functions are fully implemented and verified. No placeholder values or TODOs in the implementation.

## Self-Check: PASSED

- [x] `src/lib/calculations.ts` exists (96 lines, >= 60 minimum)
- [x] `src/lib/calculations.test.ts` exists (69 lines, >= 50 minimum)
- [x] Commit `f9a447a` exists (test RED state)
- [x] Commit `3c122b6` exists (implementation GREEN)
- [x] `npm test -- --run src/lib/calculations.test.ts` exits 0 with 19 tests passing
- [x] No floating-point arithmetic in calculations.ts — `toCents` rounds once on input, distribution functions work only with integers
