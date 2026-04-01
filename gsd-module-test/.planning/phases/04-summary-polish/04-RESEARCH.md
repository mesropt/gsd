# Phase 04: Summary & Polish - Research

**Researched:** 2026-04-01
**Domain:** React/TypeScript UI — summary display, Largest Remainder rounding, mobile-responsive Tailwind layout
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Each PersonSummaryRow shows exactly: Name | Subtotal | Tip share | Tax share | Grand total. No per-item breakdown.
- **D-02:** Running subtotals live in a **dedicated strip between ItemsPanel and ChargesPanel** — not inside SummaryPanel. Shows each person's item subtotal live as items are assigned/reassigned.
- **D-03:** Strip layout: inline labels per person, e.g., `Alice: $12.00  Bob: $18.50`. Simple Tailwind flex row, full-width, same width rhythm as ChargesPanel below it.
- **D-04:** SummaryPanel uses a **table layout** (not card-per-person). Columns: Name | Subtotal | Tip | Tax | Total. One row per person.
- **D-05:** A footer row or assertion note confirms `sum(totals) === billTotal`. If violated, throw an error.
- **D-06:** Single-column vertical stack in build-up order on mobile: People → Items → Subtotals strip → Charges → Summary. No panel reordering between mobile and desktop.
- **D-07:** Desktop: People + Items side-by-side (flex row), then Subtotals strip full-width, then ChargesPanel full-width, then SummaryPanel full-width. On mobile (≤375px) the side-by-side row collapses to single column.

### Claude's Discretion

- Exact Tailwind classes for the subtotals strip (padding, text size, colors) — use existing panel styles for consistency.
- Whether the balance assertion throws Error, console.error, or visible UI indicator — plan 04-01 says "throws if violated"; follow that.
- Touch target sizing on mobile — use `min-h-[44px]` on interactive elements; Claude decides exact application.
- Empty state inside the subtotals strip when 0 people are added — Claude decides (hide strip or show placeholder).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUMM-01 | App shows final breakdown: each person's name and total amount owed | `calculateBreakdowns` returns grand totals; SummaryPanel needs a new helper `calculateDetailedBreakdowns` that also surfaces per-person subtotals, tip shares, and tax shares (see Architecture Patterns) |
| SUMM-02 | All person totals sum exactly to bill total (Largest Remainder Method) | `distributeRemainder` and `distributeProportionally` are ALREADY fully implemented with LRM; `calculateBreakdowns` already sums exactly; the balance assertion in SummaryPanel is the remaining work |
| SUMM-03 | Running subtotal visible as user builds the bill | `SubtotalsStrip` component reads `people` + `items` from store, computes per-person item subtotals via `useMemo`, renders above ChargesPanel |
</phase_requirements>

---

## Summary

Phase 4 layers three UI slices on top of the math infrastructure established in Phases 1-3. The most important discovery is that `calculateBreakdowns` (already implemented) returns only `Map<personId, grandTotal>` — it does NOT expose separate subtotal, tip share, and tax share columns. SummaryPanel (SUMM-01, D-04) requires those four separate values per person. Plan 04-01 must therefore introduce a new `calculateDetailedBreakdowns` helper (or expand the return type) that captures the intermediate values before accumulation, rather than re-implementing the math.

The second important finding: `distributeRemainder` and `distributeProportionally` are ALREADY complete and LRM-correct. The CONTEXT.md says `distributeRemainder` "needs Largest Remainder implementation in plan 04-02" but that is inaccurate — both functions were fully implemented in Phase 1 and pass all property tests. Plan 04-02 should focus on: (a) the `distributeProportionally` integration test asserting exact penny equality on odd-cent splits across many people, and (b) the SubtotalsStrip component for SUMM-03.

Mobile Polish (plan 04-03) is pure Tailwind responsive utility work. Tailwind 4 (used in this project via `@tailwindcss/vite`) continues to use `sm:` breakpoint for 640 px and has no built-in 375 px breakpoint — the plan will need to use `max-sm:` or a custom container query to target ≤375 px screens. The existing layout uses a `flex gap-6` row for People+Items; wrapping that in `flex-wrap` or switching to `flex-col` below a breakpoint achieves the stacking.

**Primary recommendation:** Implement `calculateDetailedBreakdowns` as a new pure function returning a structured per-person breakdown object, then drive SummaryPanel from that. Reuse `distributeRemainder`/`distributeProportionally` as-is — do not rewrite them.

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Component rendering, `useMemo` | Project standard |
| Zustand | 5.0.12 | State — `useBillStore` selector pattern | Project standard |
| Tailwind CSS | 4.2.2 | Responsive layout utility classes | Project standard |
| shadcn/ui | 4.1.1 | `Button`, `Input`, `Checkbox`, `Popover` already installed | Project standard |
| TypeScript | 5.9.3 | Type safety | Project standard |

### Testing (already installed)

| Library | Version | Purpose |
|---------|---------|---------|
| Vitest | 4.1.2 | Test runner (jsdom environment) |
| @testing-library/react | 16.3.2 | Component render + query |
| @testing-library/user-event | 14.6.1 | Interaction simulation |
| @testing-library/jest-dom | 6.9.1 | DOM matchers |

**No new packages needed for this phase.**

**Version verification:** All versions confirmed from `package.json` (source of truth in repo).

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
src/
├── components/
│   ├── SubtotalsStrip/
│   │   └── SubtotalsStrip.tsx         # SUMM-03: per-person item subtotals strip
│   └── SummaryPanel/
│       ├── SummaryPanel.tsx            # SUMM-01/02: table of per-person breakdowns
│       └── SummaryPanel.test.tsx       # balance assertion + edge case tests
├── lib/
│   └── calculations.ts                # add calculateDetailedBreakdowns here
│       └── (calculations.test.ts)     # add distributeProportionally integration test
└── App.tsx                             # wire SubtotalsStrip + SummaryPanel into layout
```

### Pattern 1: calculateDetailedBreakdowns — New Helper Function

**What:** A pure function that re-runs the same math as `calculateBreakdowns` but returns structured intermediate values (subtotal per person, tip share per person, tax share per person, grand total per person) instead of just the grand total. Live alongside `calculateBreakdowns` in `src/lib/calculations.ts`.

**Why needed:** `calculateBreakdowns` accumulates into a single `Map<personId, total>` and discards the intermediate subtotals, tip shares, and tax shares. SummaryPanel needs all four values per person (D-04). The cleanest approach is a new function rather than mutating `calculateBreakdowns` signature (which has callers in existing tests).

**Return type:**
```typescript
export interface PersonBreakdown {
  subtotal: number       // item costs assigned to this person (cents)
  tipShare: number       // tip allocated to this person (cents)
  taxShare: number       // tax allocated to this person (cents)
  total: number          // subtotal + tipShare + taxShare (cents)
}

// Returns array in same order as state.people
export function calculateDetailedBreakdowns(
  state: AppState
): PersonBreakdown[] { ... }
```

**Balance assertion:** After computing all `PersonBreakdown` entries, throw if the sum of totals !== bill total (items assigned total + tipCents + taxCents). This satisfies D-05 and SUMM-02.

```typescript
// Source: project math conventions (src/lib/calculations.ts)
const sumOfTotals = breakdowns.reduce((acc, b) => acc + b.total, 0)
const billTotal = assignedItemTotal + tipCents + taxCents
if (sumOfTotals !== billTotal) {
  throw new Error(
    `Balance assertion failed: sum(totals)=${sumOfTotals} !== billTotal=${billTotal}`
  )
}
```

### Pattern 2: SummaryPanel — useMemo + table render

**What:** Functional component that reads `people`, `items`, `tip`, `tax` from the Zustand store, calls `calculateDetailedBreakdowns` inside `useMemo`, then renders a plain HTML `<table>` with columns Name | Subtotal | Tip | Tax | Total.

**When to use:** Whenever the summary section is rendered.

```typescript
// Source: established useMemo + useBillStore selector pattern (src/components/ChargesPanel/TipControl.tsx)
const people = useBillStore((s) => s.people)
const items  = useBillStore((s) => s.items)
const tip    = useBillStore((s) => s.tip)
const tax    = useBillStore((s) => s.tax)

const breakdowns = useMemo(
  () => calculateDetailedBreakdowns({ people, items, tip, tax }),
  [people, items, tip, tax]
)
```

**Edge cases to render without error (SUMM-01 success criterion 5):**
- `people.length === 0` → render empty state ("No people added yet.") and skip table
- `people.length === 1` → single row table, all tip/tax goes to that person
- All items unassigned → subtotals all 0; tip/tax still distributed
- Zero tip + zero tax → tip/tax columns show $0.00
- Zero people with items → `calculateDetailedBreakdowns` returns `[]`

### Pattern 3: SubtotalsStrip — Live Subtotals (SUMM-03)

**What:** Narrow full-width strip placed between the People+Items row and ChargesPanel. Computes per-person item subtotals live via `useMemo`. Does not call `calculateDetailedBreakdowns` — it only sums item costs per person (cheaper, no tip/tax needed here).

```typescript
// Source: established useBillStore pattern
const people = useBillStore((s) => s.people)
const items  = useBillStore((s) => s.items)

const subtotals = useMemo(() => {
  return people.map((p) => {
    const personTotal = items.reduce((acc, item) => {
      if (!item.assignedTo.includes(p.id)) return acc
      // proportional share of this item
      const share = distributeRemainder(item.price, item.assignedTo.length)
      const idx = item.assignedTo.indexOf(p.id)
      return acc + share[idx]
    }, 0)
    return { person: p, subtotal: personTotal }
  })
}, [people, items])
```

**Empty state (Claude's discretion):** When `people.length === 0`, render `null` (hide the strip entirely) — no placeholder needed.

### Pattern 4: App.tsx Layout Integration

**Current App.tsx layout:**
```tsx
<div className="min-h-screen bg-background p-8">
  <h1>Expense Splitter</h1>
  <div className="flex gap-6 mb-6">        {/* People + Items side-by-side */}
    <PeoplePanel />
    <ItemsPanel />
  </div>
  <ChargesPanel />
</div>
```

**Target App.tsx layout (after Phase 4):**
```tsx
<div className="min-h-screen bg-background p-8">
  <h1>Expense Splitter</h1>
  <div className="flex flex-wrap gap-6 mb-6">   {/* flex-wrap enables mobile collapse */}
    <PeoplePanel />
    <ItemsPanel />
  </div>
  <SubtotalsStrip />                             {/* new — between row and Charges */}
  <ChargesPanel />
  <SummaryPanel />                               {/* new — below Charges */}
</div>
```

**Mobile stacking (D-06, D-07):** The `flex-wrap` on the People+Items row means each panel (both have `flex-1`) will collapse to full-width when the viewport is too narrow. At 375 px, two `flex-1` children in an `8px` padded container have ~359px available — less than the natural minimum width of the form inputs, so wrapping happens naturally. Alternatively, add `sm:flex-row flex-col` if wrapping alone is unreliable.

### Pattern 5: Mobile Touch Target Sizing (Claude's discretion)

**Standard (per CONTEXT.md):** `min-h-[44px]` on interactive elements. Apply to existing `<Button>` components in ChargesPanel if they don't already meet the 44px minimum. Check `TipControl`/`TaxControl` button sizes — currently using shadcn `size="sm"` which may be ~32px tall.

### Anti-Patterns to Avoid

- **Rewriting distributeRemainder/distributeProportionally:** Both are already LRM-correct and tested. Do not touch them.
- **Calling calculateBreakdowns from SummaryPanel:** It only returns grand totals; you need `calculateDetailedBreakdowns` for the column breakdown.
- **Floating-point arithmetic in SummaryPanel:** All display goes through `fromCents(cents)`. Never do `(total / 100).toFixed(2)` inline.
- **Storing derived breakdown state in Zustand:** Keep breakdowns as computed (`useMemo`) — they are pure functions of `people`, `items`, `tip`, `tax`.
- **Using `Math.round` on already-integer cent values:** `distributeRemainder` and `distributeProportionally` already guarantee integer outputs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Penny-accurate integer splitting | Custom rounding | `distributeRemainder` / `distributeProportionally` (already in repo) | LRM already implemented and tested |
| Dollar formatting | `(cents/100).toFixed(2)` inline | `fromCents(cents)` | Consistent, handles `$` prefix, tested |
| State reactivity | Manual re-calculation triggers | `useMemo` with Zustand selector deps | Standard React/Zustand pattern already used in codebase |
| Responsive stacking | Custom JS media query | `flex-wrap` / `sm:flex-row flex-col` Tailwind utilities | Tailwind 4 handles breakpoints natively |
| Accessible table | Custom div grid | Plain `<table>/<thead>/<tbody>/<tr>/<th>/<td>` | Semantic, screen-reader friendly, no dependency needed |

**Key insight:** All heavy math is already implemented. Phase 4 is primarily UI composition work that connects existing building blocks.

---

## Common Pitfalls

### Pitfall 1: calculateBreakdowns returns only grand totals
**What goes wrong:** Plan 04-01 describes "calculateBreakdowns called via useMemo" for SummaryPanel with columns for subtotal, tip, and tax. The existing `calculateBreakdowns` function does NOT return these intermediate values — it collapses them into a single total per person.
**Why it happens:** The function was designed for efficiency (Phase 3 callers only needed grand totals).
**How to avoid:** Implement `calculateDetailedBreakdowns` as a new pure function that returns `PersonBreakdown[]`. Keep `calculateBreakdowns` unchanged to avoid breaking 13 existing test cases.
**Warning signs:** If SummaryPanel only shows one column of numbers.

### Pitfall 2: Balance assertion over unassigned items
**What goes wrong:** The balance assertion `sum(totals) === billTotal` is ambiguous when items are unassigned. Unassigned item costs are NOT included in any person's subtotal, so `billTotal` must be defined as "sum of ASSIGNED item costs + tip + tax" — not the raw total of all items on the bill.
**Why it happens:** SUMM-02 says totals sum to "the bill total" — but unassigned items are excluded from distribution.
**How to avoid:** In `calculateDetailedBreakdowns`, compute `assignedItemTotal` (sum of prices of items with `assignedTo.length > 0`). The assertion is `sum(totals) === assignedItemTotal + tipCents + taxCents`. Unassigned items are surfaced separately via ASGN-04 (warning, Phase 3 scope).
**Warning signs:** Balance assertion fires whenever there are unassigned items.

### Pitfall 3: Tailwind 4 has no built-in 375px breakpoint
**What goes wrong:** Using `xs:` or assuming a 375px breakpoint exists in Tailwind 4.
**Why it happens:** Tailwind's default breakpoints start at `sm:` (640px). There is no `xs:` breakpoint.
**How to avoid:** Use `flex-col sm:flex-row` (stacks on mobile, side-by-side at 640px+) OR add a custom `@theme` breakpoint for 375px. Given D-07 ("on mobile ≤375px the side-by-side row collapses"), the simpler `flex-col sm:flex-row` pattern overshoots (collapses up to 640px, not just 375px), but is acceptable for a restaurant bill app used on phones. A custom breakpoint can be added in `index.css` if exact 375px behavior is required.
**Warning signs:** Layout doesn't stack on a 375px-wide device.

### Pitfall 4: shadcn Button `size="sm"` may be below 44px touch target
**What goes wrong:** Existing TipControl/TaxControl buttons use `size="sm"` which is typically ~32px tall — below the 44px iOS HIG minimum.
**Why it happens:** shadcn default sizes prioritize desktop aesthetics.
**How to avoid:** Add `min-h-[44px]` class to interactive Button elements (per Claude's Discretion in CONTEXT.md). The `Button` component in this project is shadcn/ui — it accepts a `className` prop that merges via `tailwind-merge`.
**Warning signs:** Tapping tip/tax buttons on a phone requires precise finger placement.

### Pitfall 5: useMemo dependency arrays miss store fields
**What goes wrong:** `useMemo(() => calculateDetailedBreakdowns(...), [people, items])` forgets `tip` and `tax` — summary doesn't update when charges change.
**Why it happens:** Omitting deps that aren't visually obvious.
**How to avoid:** Deps must be `[people, items, tip, tax]` — all four AppState fields consumed by the calculation.
**Warning signs:** Summary shows stale values after changing tip percentage.

---

## Code Examples

### calculateDetailedBreakdowns — Structure Pattern

```typescript
// Source: mirrors calculateBreakdowns structure in src/lib/calculations.ts
export function calculateDetailedBreakdowns(state: AppState): PersonBreakdown[] {
  if (state.people.length === 0) return []

  // Step 1: per-person item subtotals (same logic as calculateBreakdowns step 1)
  const subtotals = new Map<string, number>(state.people.map(p => [p.id, 0]))
  for (const item of state.items) {
    if (item.assignedTo.length === 0) continue
    const shares = distributeRemainder(item.price, item.assignedTo.length)
    item.assignedTo.forEach((personId, idx) => {
      subtotals.set(personId, (subtotals.get(personId) ?? 0) + shares[idx])
    })
  }

  const subtotalValues = state.people.map(p => subtotals.get(p.id) ?? 0)
  const totalSubtotal = subtotalValues.reduce((a, b) => a + b, 0)

  // Step 2: tip shares
  const tipCents = state.tip.mode === 'percent'
    ? Math.round(totalSubtotal * state.tip.value / 100)
    : state.tip.value
  const tipShares = state.tip.splitMethod === 'equal'
    ? distributeRemainder(tipCents, state.people.length)
    : distributeProportionally(tipCents, subtotalValues)

  // Step 3: tax shares
  const taxCents = state.tax.mode === 'percent'
    ? Math.round(totalSubtotal * state.tax.value / 100)
    : state.tax.value
  const taxShares = state.tax.splitMethod === 'equal'
    ? distributeRemainder(taxCents, state.people.length)
    : distributeProportionally(taxCents, subtotalValues)

  // Step 4: build PersonBreakdown array
  const breakdowns = state.people.map((p, idx) => ({
    subtotal: subtotalValues[idx],
    tipShare: tipShares[idx],
    taxShare: taxShares[idx],
    total: subtotalValues[idx] + tipShares[idx] + taxShares[idx],
  }))

  // Step 5: balance assertion (SUMM-02, D-05)
  const assignedItemTotal = totalSubtotal
  const billTotal = assignedItemTotal + tipCents + taxCents
  const sumOfTotals = breakdowns.reduce((acc, b) => acc + b.total, 0)
  if (sumOfTotals !== billTotal) {
    throw new Error(`Balance assertion failed: ${sumOfTotals} !== ${billTotal}`)
  }

  return breakdowns
}
```

### SummaryPanel — Table Render Pattern

```typescript
// Source: D-04, follows ChargesPanel panel container pattern
export function SummaryPanel() {
  const people = useBillStore((s) => s.people)
  const items  = useBillStore((s) => s.items)
  const tip    = useBillStore((s) => s.tip)
  const tax    = useBillStore((s) => s.tax)

  const breakdowns = useMemo(
    () => calculateDetailedBreakdowns({ people, items, tip, tax }),
    [people, items, tip, tax]
  )

  if (people.length === 0) {
    return (
      <div className="rounded-md border p-4 mt-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <p className="text-sm text-muted-foreground">No people added yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border p-4 mt-6">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground border-b">
            <th className="pb-2">Name</th>
            <th className="pb-2 text-right">Subtotal</th>
            <th className="pb-2 text-right">Tip</th>
            <th className="pb-2 text-right">Tax</th>
            <th className="pb-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p, idx) => (
            <tr key={p.id} className="border-b last:border-0">
              <td className="py-2">{p.name}</td>
              <td className="py-2 text-right">{fromCents(breakdowns[idx].subtotal)}</td>
              <td className="py-2 text-right">{fromCents(breakdowns[idx].tipShare)}</td>
              <td className="py-2 text-right">{fromCents(breakdowns[idx].taxShare)}</td>
              <td className="py-2 text-right font-semibold">{fromCents(breakdowns[idx].total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### Mobile Layout — App.tsx

```typescript
// Source: D-06, D-07 — flex-col default, sm:flex-row for desktop side-by-side
// flex-wrap alternative achieves the same without a breakpoint class
<div className="flex flex-col sm:flex-row gap-6 mb-6">
  <PeoplePanel />
  <ItemsPanel />
</div>
```

### SubtotalsStrip — Minimal Pattern

```typescript
// Source: D-02, D-03
export function SubtotalsStrip() {
  const people = useBillStore((s) => s.people)
  const items  = useBillStore((s) => s.items)

  const subtotals = useMemo(() =>
    people.map((p) => {
      let total = 0
      for (const item of items) {
        const idx = item.assignedTo.indexOf(p.id)
        if (idx === -1) continue
        const shares = distributeRemainder(item.price, item.assignedTo.length)
        total += shares[idx]
      }
      return { name: p.name, total }
    }),
    [people, items]
  )

  if (people.length === 0) return null

  return (
    <div className="rounded-md border px-4 py-2 mb-6 flex flex-wrap gap-4 text-sm">
      {subtotals.map((s) => (
        <span key={s.name}>
          <span className="font-medium">{s.name}:</span>{' '}
          <span>{fromCents(s.total)}</span>
        </span>
      ))}
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind CSS v3 `@screen` | Tailwind CSS v4 `@theme` + `@custom-variant` | v4 (this project uses v4.2.2) | Custom breakpoints go in `index.css @theme` block |
| `flex-wrap` manual CSS | Tailwind utility `flex-wrap` / `flex-col sm:flex-row` | Tailwind v1+ | Standard responsive pattern |

**No deprecated APIs used in this phase.** Tailwind 4, Zustand 5, React 19, Vitest 4 are all current.

---

## Open Questions

1. **375px vs 640px mobile breakpoint**
   - What we know: D-07 says "on mobile (≤375px)" but Tailwind's `sm:` starts at 640px.
   - What's unclear: Whether the planner wants to collapse only at ≤375px (custom breakpoint) or collapse up to 640px (`sm:flex-row` default).
   - Recommendation: Use `flex-col sm:flex-row` (collapses up to 640px) as the default approach — it covers all phones and is zero-config. Flag as Claude's Discretion if exact 375px gating is needed.

2. **ASGN-04 unassigned item warning in SummaryPanel**
   - What we know: ASGN-04 requires a "visible warning" for unassigned items. It's listed as Phase 3 scope in REQUIREMENTS.md but Phase 3 may not have delivered it.
   - What's unclear: Whether ASGN-04 is already satisfied or falls into Phase 4's "edge cases render without error" scope.
   - Recommendation: Plan 04-03 should include a smoke test that an unassigned item shows a warning. If the warning component already exists from Phase 3, just verify; if not, add a minimal `{items.some(i => i.assignedTo.length === 0) && <p>...</p>}` in ItemsPanel or SummaryPanel.

---

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — this phase is pure frontend code/UI work using already-installed npm packages).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 (jsdom environment) |
| Config file | `vite.config.ts` (uses `vitest/config` defineConfig) |
| Quick run command | `npx vitest run src/lib/calculations.test.ts src/components/SummaryPanel/SummaryPanel.test.tsx` |
| Full suite command | `npx vitest run` |

**Current suite status:** 43 test files, 446 tests, all passing (verified 2026-04-01).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUMM-01 | SummaryPanel renders per-person rows with name, subtotal, tip, tax, total columns | unit (RTL) | `npx vitest run src/components/SummaryPanel/SummaryPanel.test.tsx` | ❌ Wave 0 |
| SUMM-01 | Empty state renders without error (0 people) | unit (RTL) | same file | ❌ Wave 0 |
| SUMM-01 | Single person renders without error | unit (RTL) | same file | ❌ Wave 0 |
| SUMM-01 | All items unassigned renders without error | unit (RTL) | same file | ❌ Wave 0 |
| SUMM-02 | calculateDetailedBreakdowns: sum(totals) === assignedItemTotal + tipCents + taxCents | unit | `npx vitest run src/lib/calculations.test.ts` | ❌ Wave 0 (add to existing file) |
| SUMM-02 | Balance assertion throws when math is violated (adversarial test) | unit | same file | ❌ Wave 0 |
| SUMM-02 | Odd-cent proportional split: 3-person $10.01 bill, sum === 1001 | integration | same file | ❌ Wave 0 |
| SUMM-03 | SubtotalsStrip shows person name + correct cent-accurate subtotal | unit (RTL) | `npx vitest run src/components/SubtotalsStrip/SubtotalsStrip.test.tsx` | ❌ Wave 0 |
| SUMM-03 | SubtotalsStrip updates live when item assignment changes | unit (RTL) | same file | ❌ Wave 0 |
| SUMM-03 | SubtotalsStrip hidden when 0 people | unit (RTL) | same file | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/calculations.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/SummaryPanel/SummaryPanel.test.tsx` — covers SUMM-01 render + edge cases
- [ ] `src/components/SubtotalsStrip/SubtotalsStrip.test.tsx` — covers SUMM-03 live subtotals
- [ ] Add `calculateDetailedBreakdowns` tests to `src/lib/calculations.test.ts` — covers SUMM-02 balance assertion + odd-cent integration

---

## Sources

### Primary (HIGH confidence)

- Direct code audit: `src/lib/calculations.ts` — confirmed `distributeRemainder`, `distributeProportionally`, `calculateBreakdowns` are fully implemented
- Direct code audit: `src/types/index.ts` — confirmed `AppState`, `Person`, `Item`, `ChargeConfig` contracts
- Direct code audit: `src/App.tsx`, `src/components/ChargesPanel/ChargesPanel.tsx`, `src/components/PeoplePanel/PeoplePanel.tsx`, `src/components/ItemsPanel/ItemsPanel.tsx` — confirmed layout patterns and Zustand selector conventions
- Direct code audit: `package.json` — confirmed all library versions
- Direct code audit: `vite.config.ts` — confirmed test configuration
- Direct code audit: `src/lib/calculations.test.ts` — confirmed 446 passing tests, existing test patterns

### Secondary (MEDIUM confidence)

- Tailwind CSS v4 breakpoint behavior: confirmed from `src/index.css` (@tailwindcss/vite v4.2.2, `@theme` block), standard Tailwind `sm:` 640px breakpoint applies

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions read directly from package.json
- Architecture: HIGH — based on direct code audit of existing implementations; new function structure mirrors existing `calculateBreakdowns` exactly
- Pitfalls: HIGH — pitfall 1 (grand totals only) and pitfall 2 (unassigned item balance assertion) discovered directly from source code, not speculation
- Test patterns: HIGH — existing test patterns confirmed by reading `calculations.test.ts` and `TaxControl.test.tsx`

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack — no fast-moving dependencies)
