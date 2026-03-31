---
phase: 01-foundation
plan: 01-02
type: tdd
wave: 2
depends_on: [01-01]
files_modified:
  - src/lib/calculations.ts
  - src/lib/calculations.test.ts
autonomous: true
requirements:
  - ITEM-03

must_haves:
  truths:
    - "`toCents` converts dollar strings (with $, commas, whitespace) to integer cents with no float leakage"
    - "`fromCents` formats integer cents as a display string in '$X.XX' format"
    - "`distributeRemainder(100, 3)` returns [34, 33, 33] — penny goes to the first share"
    - "Sum of `distributeRemainder(total, n)` always equals `total` exactly (no penny lost)"
    - "`distributeProportionally` handles all-zero weights without producing NaN"
    - "All Vitest tests pass: `npm test -- --run src/lib/calculations.test.ts` exits 0"
  artifacts:
    - path: "src/lib/calculations.ts"
      provides: "Pure math helpers: toCents, fromCents, distributeRemainder, distributeProportionally"
      exports: ["toCents", "fromCents", "distributeRemainder", "distributeProportionally"]
      min_lines: 60
    - path: "src/lib/calculations.test.ts"
      provides: "Vitest unit tests covering all helpers and the penny-remainder edge case"
      min_lines: 50
  key_links:
    - from: "src/lib/calculations.test.ts"
      to: "src/lib/calculations.ts"
      via: "named imports"
      pattern: "import.*from.*calculations"
    - from: "distributeRemainder"
      to: "integer sum invariant"
      via: "result.reduce((a,b)=>a+b,0) === totalCents"
      pattern: "reduce"
---

<phase>1</phase>
<plan>01-02</plan>
<name>Math core — toCents, fromCents, distributeRemainder with Vitest unit tests</name>
<wave>1</wave>

<goal>
Implement the four pure math helpers that all monetary calculations in the app depend on: `toCents`, `fromCents`, `distributeRemainder`, and `distributeProportionally`. Write comprehensive Vitest unit tests first (TDD), including the critical penny-remainder edge case and the sum-to-total invariant. All tests must pass green.

This plan is self-contained and runs in parallel with plan 01-01 (no scaffold dependency — only Node.js and npm are required).
</goal>

<context>
Key decisions from research (01-RESEARCH.md):

- ITEM-03 requirement: "Item prices are stored as integer cents (no floating-point errors)." These helpers are the sole mechanism satisfying that requirement.
- `toCents(dollars)` strips `$`, commas, whitespace; uses `Math.round(parseFloat * 100)`. Accepts string or number.
- `fromCents(cents)` returns `'$' + (cents / 100).toFixed(2)`.
- `distributeRemainder(totalCents, parts)` — equal split using Largest Remainder: floor each share, give extra pennies to the first `fractionalRemainder` indices. For 100 cents / 3 parts: base=33, remainder=1, result=[34,33,33].
- `distributeProportionally(totalCents, weights)` — weighted split using Largest Remainder: sort by fractional part descending to assign remainder pennies. Divide-by-zero guard: when all weights are zero, fall back to equal split.
- Anti-pattern: `Math.round` at each calculation step compounds errors. Round ONCE on input (toCents), ONCE on distribution (distributeRemainder/distributeProportionally). Never in between.
- Test invariant (Pitfall 7 from research): Always assert `result.reduce((a,b)=>a+b,0) === total` — not just individual shares. This is the critical property that prevents penny errors at the summary level.
- This plan runs wave 1 (parallel with 01-01). If 01-01 has already been executed, the Vitest runner is available. If not, the test file can still be written; `npm test` will pick it up when the scaffold is ready.
</context>

<tasks>
  <task>
    <name>Task 1 (RED): Write failing Vitest tests for all four helpers</name>
    <files>src/lib/calculations.test.ts</files>
    <action>
Create `src/lib/calculations.test.ts` with the full test suite. The file under test (`calculations.ts`) does not exist yet, so every import will fail — this is the expected RED state.

Write the following test suite exactly (copy from research — these cases are pre-verified):

```typescript
import { describe, it, expect } from 'vitest'
import { toCents, fromCents, distributeRemainder, distributeProportionally } from './calculations'

describe('toCents', () => {
  it('parses plain number string', () => expect(toCents('12.50')).toBe(1250))
  it('strips dollar sign', () => expect(toCents('$12.50')).toBe(1250))
  it('strips commas', () => expect(toCents('$1,234.56')).toBe(123456))
  it('rounds half-cent input', () => expect(toCents('12.555')).toBe(1256))
  it('handles numeric input', () => expect(toCents(12.5)).toBe(1250))
  it('handles zero', () => expect(toCents(0)).toBe(0))
})

describe('fromCents', () => {
  it('formats cents to dollar string', () => expect(fromCents(1250)).toBe('$12.50'))
  it('formats zero', () => expect(fromCents(0)).toBe('$0.00'))
  it('formats single cent', () => expect(fromCents(1)).toBe('$0.01'))
})

describe('distributeRemainder', () => {
  it('distributes evenly when divisible', () => {
    expect(distributeRemainder(99, 3)).toEqual([33, 33, 33])
  })
  it('distributes remainder penny — 100 cents into 3 parts', () => {
    const result = distributeRemainder(100, 3)
    expect(result).toEqual([34, 33, 33])
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('always sums to total (property test)', () => {
    for (const [total, parts] of [[1, 3], [7, 3], [10, 7], [1000, 9]] as [number, number][]) {
      const result = distributeRemainder(total, parts)
      expect(result.reduce((a, b) => a + b, 0)).toBe(total)
    }
  })
  it('handles single part', () => expect(distributeRemainder(100, 1)).toEqual([100]))
  it('handles zero total', () => {
    const result = distributeRemainder(0, 3)
    expect(result.reduce((a, b) => a + b, 0)).toBe(0)
  })
  it('returns empty array for zero parts', () => {
    expect(distributeRemainder(100, 0)).toEqual([])
  })
})

describe('distributeProportionally', () => {
  it('splits equally with equal weights', () => {
    const result = distributeProportionally(100, [1, 1, 1])
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('handles all-zero weights without NaN', () => {
    const result = distributeProportionally(100, [0, 0, 0])
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
    expect(result.every((v) => !isNaN(v))).toBe(true)
  })
  it('distributes proportionally — 10 cents with weights [3,1]', () => {
    const result = distributeProportionally(10, [3, 1])
    expect(result).toEqual([8, 2])
    expect(result.reduce((a, b) => a + b, 0)).toBe(10)
  })
  it('always sums to total (property test)', () => {
    for (const [total, weights] of [
      [100, [1, 2, 3]],
      [7, [1, 1, 1]],
      [1000, [10, 20, 30, 40]],
    ] as [number, number[]][]) {
      const result = distributeProportionally(total, weights)
      expect(result.reduce((a, b) => a + b, 0)).toBe(total)
    }
  })
})
```

Run `npm test -- --run src/lib/calculations.test.ts` and confirm it FAILS (import error or all tests failing). This is the expected RED state. Commit: `test(01-02): add failing tests for math helpers`
    </action>
    <verify>
      `npm test -- --run src/lib/calculations.test.ts` reports failures (cannot find module or all tests fail). The test file itself is syntactically valid TypeScript.
    </verify>
    <done>
      `src/lib/calculations.test.ts` exists with all test cases. Running the suite fails as expected (no implementation yet).
    </done>
  </task>

  <task>
    <name>Task 2 (GREEN): Implement calculations.ts so all tests pass</name>
    <files>src/lib/calculations.ts</files>
    <action>
Create `src/lib/calculations.ts` with the four exported functions. Implement to match exactly what the tests assert.

```typescript
/**
 * src/lib/calculations.ts
 *
 * Pure monetary math helpers. All bill values are stored as INTEGER CENTS.
 * Convert on input (toCents), display on output (fromCents).
 * Never store or compute with floating-point dollar values.
 */

/**
 * Parse a user-entered dollar string or number to integer cents.
 * Strips $, commas, and whitespace. Rounds to nearest cent.
 *
 * toCents("$12.50")    === 1250
 * toCents("$1,234.56") === 123456
 * toCents(12.5)        === 1250
 */
export function toCents(dollars: string | number): number {
  if (typeof dollars === 'string') {
    const cleaned = dollars.replace(/[$,\s]/g, '')
    return Math.round(parseFloat(cleaned) * 100)
  }
  return Math.round(dollars * 100)
}

/**
 * Format integer cents as a dollar display string.
 *
 * fromCents(1250) === "$12.50"
 * fromCents(0)    === "$0.00"
 * fromCents(1)    === "$0.01"
 */
export function fromCents(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

/**
 * Distribute `totalCents` into `parts` equal integer shares that sum exactly to totalCents.
 * Uses the Largest Remainder Method: floor each share, assign remainder pennies to the
 * first `remainder` indices (index 0 first).
 *
 * distributeRemainder(100, 3) === [34, 33, 33]   (not [33, 33, 33] with 1 penny lost)
 * distributeRemainder(99, 3)  === [33, 33, 33]
 * distributeRemainder(1, 3)   === [1, 0, 0]
 * distributeRemainder(100, 0) === []
 */
export function distributeRemainder(totalCents: number, parts: number): number[] {
  if (parts <= 0) return []
  if (parts === 1) return [totalCents]

  const base = Math.floor(totalCents / parts)
  const remainder = totalCents - base * parts

  const shares = Array<number>(parts).fill(base)
  for (let i = 0; i < remainder; i++) {
    shares[i] += 1
  }

  return shares
}

/**
 * Distribute `totalCents` proportionally according to `weights` (arbitrary positive numbers).
 * Uses the Largest Remainder Method: sort indices by fractional part descending, assign
 * remainder pennies to the indices with the largest fractional parts.
 * Sum of result always equals totalCents exactly.
 *
 * Divide-by-zero guard: when all weights are zero, falls back to equal split.
 *
 * distributeProportionally(100, [1, 1, 1]) — sums to 100, equal share
 * distributeProportionally(10, [3, 1])     === [8, 2]
 */
export function distributeProportionally(totalCents: number, weights: number[]): number[] {
  if (weights.length === 0) return []

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  if (totalWeight === 0) {
    // Divide-by-zero guard: fall back to equal split
    return distributeRemainder(totalCents, weights.length)
  }

  const exact = weights.map((w) => (w / totalWeight) * totalCents)
  const floors = exact.map(Math.floor)
  const remainder = totalCents - floors.reduce((a, b) => a + b, 0)

  // Sort indices by fractional part descending; assign +1 to the top `remainder` indices
  const indices = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .map((x) => x.i)

  for (let j = 0; j < remainder; j++) {
    floors[indices[j]] += 1
  }

  return floors
}
```

Run `npm test -- --run src/lib/calculations.test.ts`. All tests must pass (GREEN).
Commit: `feat(01-02): implement toCents, fromCents, distributeRemainder, distributeProportionally`
    </action>
    <verify>
      `npm test -- --run src/lib/calculations.test.ts` exits 0 with all tests passing.
      Specifically confirm: the `distributeRemainder(100, 3)` test shows [34, 33, 33] and the sum-to-total property test passes for all four cases.
    </verify>
    <done>
      `src/lib/calculations.ts` exports all four functions. Every test in `src/lib/calculations.test.ts` is green. `npm test -- --run src/lib/calculations.test.ts` exits 0.
    </done>
  </task>
</tasks>

<success_criteria>
1. `src/lib/calculations.ts` exports `toCents`, `fromCents`, `distributeRemainder`, and `distributeProportionally`
2. `src/lib/calculations.test.ts` contains tests for all four functions including:
   - `toCents` strips `$` and commas, rounds half-cent input, handles numeric input
   - `fromCents` formats to '$X.XX', handles zero and single cent
   - `distributeRemainder(100, 3)` returns `[34, 33, 33]` (the penny-remainder edge case)
   - Sum invariant: `distributeRemainder(total, n).reduce((a,b)=>a+b,0) === total` for multiple inputs
   - `distributeProportionally` all-zero weights returns no NaN and sums correctly
3. `npm test -- --run src/lib/calculations.test.ts` exits 0 with all tests green
4. No floating-point arithmetic in calculations.ts — all intermediate values are integers after `toCents` conversion
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-02-SUMMARY.md` documenting:
- All four function signatures as implemented
- Test count and any edge cases added beyond the plan
- Confirmation that the penny-remainder test ([34, 33, 33]) passes
- Any deviations or surprises during implementation
</output>
