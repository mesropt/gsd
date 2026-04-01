# Phase 3: Assignment & Charges - Research

**Researched:** 2026-04-01
**Domain:** React/Zustand state management, Radix UI Popover + Checkbox composition, TipControl/TaxControl form controls, integer-cent calculation engine
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Assignment Selector (AssignmentSelector)**
- D-01: Trigger component on each ItemRow: Radix Popover containing one shadcn/ui Checkbox per person plus an "Everyone" shortcut. Both components are already installed — no new dependencies.
- D-02: Trigger button label: shows `"Assign ▾"` when unassigned. After assignment shows truncated names — `"Bob"` for one, `"Bob, Carol"` for two, `"3 people"` for three or more, `"Everyone"` when all persons selected.
- D-03: Mode is always checkboxes — no explicit Single/Shared toggle. Checking 1 person = single assignment; checking multiple = shared subset. Semantics are implicit in the array length, matching the `assignedTo: string[]` type contract already in `src/types/index.ts`.
- D-04: "Everyone" button toggles: if all people currently checked → uncheck all (= unassigned). If any person unchecked → check all. This doubles as the "Clear / Unassign" action — no separate Clear button needed.
- D-05: Popover closes on click-outside (Radix default behavior).

**Unassigned Item Warning (ASGN-04)**
- D-06: Warning appears on the ItemRow itself — a visible badge or icon next to the trigger button when `assignedTo.length === 0`. This is per plan 03-02 (ASGN-04 guard).

**ChargesPanel Layout**
- D-07: TipControl and TaxControl live in a `ChargesPanel` component rendered full-width below the PeoplePanel + ItemsPanel row in `App.tsx`.
- D-08: Tip and Tax stack vertically inside ChargesPanel (Tip row on top, Tax row below). No side-by-side columns.

**TipControl**
- D-09: Preset buttons: 15%, 18%, 20%, Custom. Split toggle: Equal / Proportional. All inline in one row.
- D-10: Clicking "Custom" reveals a text input inline to the right of the preset buttons. The preset buttons remain visible (not replaced). Clicking any preset button deactivates the custom input.

**TaxControl**
- D-11: Mode toggle: Amount ($) / Percent (%). Value input + Equal/Proportional split toggle, all inline in one row.
- D-12: Same custom-input reveal pattern as Tip: text field appears inline; presets remain visible.

**NaN / Invalid Input Guard**
- D-13: For both custom tip and custom tax: invalid input (non-numeric, negative, blank) shows a red border on the input + a small inline error message: `"Enter a number"`. The store value stays at `0` until a valid number is entered. No NaN propagates to `calculateBreakdowns`.

### Claude's Discretion
- Exact Tailwind classes and shadcn/ui variant choices (ghost, outline, etc.) for buttons and inputs — use the existing patterns from PeoplePanel/ItemsPanel for consistency.
- Whether the split toggle uses `shadcn/ui ToggleGroup` or two `Button` components with active state — researcher/planner decides based on what's installed.
- Proportional divide-by-zero guard implementation in `calculateBreakdowns` (plan 03-04) — guard logic is Claude's call; the requirement is that it doesn't crash.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ASGN-01 | User can assign an item to a specific person | AssignmentSelector with Radix Popover + Checkbox; dispatches `assignItem(itemId, [personId])` |
| ASGN-02 | User can mark an item as "shared" (split equally among all people) | Same AssignmentSelector — checking all people achieves this; "Everyone" shortcut |
| ASGN-03 | User can assign a shared item to a subset of people (not necessarily all) | Same component — subset means `assignedTo.length > 1` but not equal to `people.length` |
| ASGN-04 | Unassigned items are surfaced with a visible warning | `item.assignedTo.length === 0` → render `<AlertCircle>` in ItemRow; unit-testable condition |
| TIP-01 | User can select tip percentage (15%, 18%, 20%, or custom) | TipControl with preset buttons + controlled custom input; dispatches `setTip({ value, mode: 'percent' })` |
| TIP-02 | User can choose equal tip split | Split toggle in TipControl dispatches `setTip({ splitMethod: 'equal' })` |
| TIP-03 | User can choose proportional tip split | Split toggle dispatches `setTip({ splitMethod: 'proportional' })`; `distributeProportionally` already handles divide-by-zero |
| TAX-01 | User can enter tax as a dollar amount or percentage | TaxControl with mode toggle ($/%); amount mode uses `toCents()`; dispatches `setTax({ mode, value })` |
| TAX-02 | User can choose equal tax split | Split toggle in TaxControl dispatches `setTax({ splitMethod: 'equal' })` |
| TAX-03 | User can choose proportional tax split | Split toggle dispatches `setTax({ splitMethod: 'proportional' })`; same `distributeProportionally` usage |
</phase_requirements>

---

## Summary

Phase 3 extends the existing React/Zustand/shadcn/ui stack (Phase 1–2) with three new concerns: item-to-person assignment UI, an unassigned-item warning, and two charge controls (tip and tax). All required store actions (`assignItem`, `setTip`, `setTax`) are already implemented in `useBillStore.ts`. All required types (`assignedTo: string[]`, `ChargeConfig`, `SplitMethod`) are locked in `src/types/index.ts`. The math helpers (`distributeRemainder`, `distributeProportionally`, `toCents`, `fromCents`) are fully implemented in `src/lib/calculations.ts` — including the divide-by-zero guard for proportional mode.

The main new work is UI composition. AssignmentSelector requires adding two shadcn/ui components (Popover, Checkbox) that are not yet generated in `src/components/ui/` — only `button.tsx` and `input.tsx` exist. ChargesPanel, TipControl, and TaxControl are new component files with no upstream dependency on anything not already in the project. The split toggle decision (ToggleGroup vs two Buttons) resolves to two Button components since ToggleGroup is not installed and would require another `npx shadcn add` call.

The `calculateBreakdowns` function does not yet exist in `src/lib/calculations.ts` — plan 03-04 must implement it as the integration point connecting store state to per-person subtotals. The existing math primitives (`distributeProportionally`, `distributeRemainder`) are designed to be composed into this function.

**Primary recommendation:** Add Popover + Checkbox via `npx shadcn add`, build AssignmentSelector and ChargesPanel as pure presentational components dispatching to the pre-built store actions, then implement and integration-test `calculateBreakdowns` in plan 03-04.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Component rendering | Project baseline |
| Zustand | 5.0.12 | State store | Project baseline — `useBillStore` already implements all Phase 3 actions |
| radix-ui | 1.4.3 (unified) | Headless primitives (Popover, Checkbox) | Project baseline — transitive deps already present |
| shadcn/ui (CLI) | 4.1.1 | Styled component generation | Project baseline — `npx shadcn add popover checkbox` generates wrappers |
| Tailwind CSS | 4.2.2 | Styling | Project baseline |
| lucide-react | 1.7.0 | Icons (AlertCircle, ChevronDown) | Project baseline |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @testing-library/react | 16.3.2 | Component rendering in tests | All component unit tests |
| @testing-library/user-event | 14.6.1 | Simulating clicks, typing | Interaction tests for AssignmentSelector and TipControl/TaxControl |
| @testing-library/jest-dom | 6.9.1 | Custom matchers (toBeVisible, toHaveClass) | Asserting warning visibility, aria states |
| vitest | 4.1.2 | Test runner | All tests |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Two `Button` components for split toggle | `shadcn/ui ToggleGroup` | ToggleGroup requires `npx shadcn add toggle-group` — extra install. Two Buttons with active state tracking match the existing Button component patterns already in use (Phase 2). Use two Buttons. |
| Inline NaN validation in component | Zod or yup schema | Overkill for two numeric fields. The existing `isNaN()` guard pattern from ItemForm is sufficient. |
| Custom popover from scratch | Radix Popover via `npx shadcn add popover` | shadcn wraps Radix with correct styling + accessibility. Always use the shadcn-generated component. |

**Installation (Wave 0 — must run before implementation):**
```bash
npx shadcn add popover
npx shadcn add checkbox
```
These generate `src/components/ui/popover.tsx` and `src/components/ui/checkbox.tsx`. No new npm packages needed — `@radix-ui/react-popover` and `@radix-ui/react-checkbox` are already transitive dependencies of `radix-ui@1.4.3`.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx        # existing
│   │   ├── input.tsx         # existing
│   │   ├── popover.tsx       # NEW — npx shadcn add popover
│   │   └── checkbox.tsx      # NEW — npx shadcn add checkbox
│   ├── ItemsPanel/
│   │   ├── ItemRow.tsx       # MODIFIED — add AssignmentSelector + warning icon
│   │   ├── AssignmentSelector.tsx  # NEW
│   │   └── ...existing
│   └── ChargesPanel/
│       ├── ChargesPanel.tsx  # NEW — container
│       ├── TipControl.tsx    # NEW
│       └── TaxControl.tsx    # NEW
├── lib/
│   └── calculations.ts       # EXTENDED — add calculateBreakdowns()
└── App.tsx                   # MODIFIED — add <ChargesPanel /> below flex row
```

### Pattern 1: Radix Popover + Checkbox Composition (AssignmentSelector)
**What:** Controlled Popover with a list of Checkbox rows, each bound to a person ID in `assignedTo`.
**When to use:** Multi-select with popover disclosure, inline in a list row.
**Example:**
```typescript
// Source: shadcn/ui Popover + Checkbox composition pattern
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

function AssignmentSelector({ item }: { item: Item }) {
  const people = useBillStore((s) => s.people)
  const assignItem = useBillStore((s) => s.assignItem)

  const isAllSelected = people.length > 0 && people.every(p => item.assignedTo.includes(p.id))

  function handleTogglePerson(personId: string, checked: boolean) {
    const next = checked
      ? [...item.assignedTo, personId]
      : item.assignedTo.filter(id => id !== personId)
    assignItem(item.id, next)
  }

  function handleEveryoneToggle() {
    const next = isAllSelected ? [] : people.map(p => p.id)
    assignItem(item.id, next)
  }

  // Trigger label computed from assignedTo.length and people.length
  // ...
}
```

### Pattern 2: NaN Guard for Custom Numeric Inputs
**What:** Local state holds the raw string input. Only valid, non-negative numbers dispatch to the store. Invalid state tracked with a boolean flag.
**When to use:** Any controlled text input that feeds a numeric store value.
**Example:**
```typescript
// Source: established ItemForm pattern in src/components/ItemsPanel/ItemForm.tsx — adapted
const [rawValue, setRawValue] = useState('')
const [isInvalid, setIsInvalid] = useState(false)

function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  const val = e.target.value
  setRawValue(val)
  if (val === '') {
    // Blank input: clear error, reset store to 0, do not show error
    setIsInvalid(false)
    setTip({ value: 0 })
    return
  }
  const parsed = parseFloat(val)
  if (isNaN(parsed) || parsed < 0) {
    setIsInvalid(true)
    // Store stays at last valid value (0 on first invalid input)
  } else {
    setIsInvalid(false)
    setTip({ value: parsed })
  }
}

// In JSX:
// <Input aria-invalid={isInvalid} ... />
// {isInvalid && <p role="alert" className="text-xs text-destructive mt-1">Enter a number</p>}
```

### Pattern 3: Split Toggle (Two Buttons with Active State)
**What:** Two `Button` components with `variant="default"` for active and `variant="outline"` for inactive, controlled by local component state mirroring the store's `splitMethod`.
**When to use:** Binary toggles where ToggleGroup is not installed.
**Example:**
```typescript
// For both TipControl and TaxControl split toggles
const splitMethod = useBillStore((s) => s.tip.splitMethod)
const setTip = useBillStore((s) => s.setTip)

<Button
  variant={splitMethod === 'equal' ? 'default' : 'outline'}
  size="sm"
  onClick={() => setTip({ splitMethod: 'equal' })}
>
  Equal
</Button>
<Button
  variant={splitMethod === 'proportional' ? 'default' : 'outline'}
  size="sm"
  onClick={() => setTip({ splitMethod: 'proportional' })}
>
  Proportional
</Button>
```

### Pattern 4: calculateBreakdowns (new function in calculations.ts)
**What:** Pure function that takes `AppState` and returns a `Map<personId, centsOwed>`. Separates item subtotals, then distributes tip and tax using the configured `splitMethod`.
**When to use:** Plan 03-04 adds this function; Phase 4 consumes it for summary display.
**Example (skeleton):**
```typescript
// Source: design from CONTEXT.md canonical_refs + existing helpers
export function calculateBreakdowns(state: AppState): Map<string, number> {
  const totals = new Map<string, number>(state.people.map(p => [p.id, 0]))

  // 1. Distribute item costs
  for (const item of state.items) {
    if (item.assignedTo.length === 0) continue // unassigned: skip
    const shares = distributeRemainder(item.price, item.assignedTo.length)
    item.assignedTo.forEach((personId, idx) => {
      totals.set(personId, (totals.get(personId) ?? 0) + shares[idx])
    })
  }

  // 2. Calculate tip amount (in cents)
  const subtotals = state.people.map(p => totals.get(p.id) ?? 0)
  const totalSubtotal = subtotals.reduce((a, b) => a + b, 0)
  const tipCents = state.tip.mode === 'percent'
    ? Math.round(totalSubtotal * state.tip.value / 100)
    : state.tip.value

  // 3. Distribute tip
  const tipShares = state.tip.splitMethod === 'equal'
    ? distributeRemainder(tipCents, state.people.length)
    : distributeProportionally(tipCents, subtotals) // divide-by-zero guard already in distributeProportionally

  // 4. Calculate tax and distribute (same pattern)
  const taxCents = state.tax.mode === 'percent'
    ? Math.round(totalSubtotal * state.tax.value / 100)
    : state.tax.value
  const taxShares = state.tax.splitMethod === 'equal'
    ? distributeRemainder(taxCents, state.people.length)
    : distributeProportionally(taxCents, subtotals)

  // 5. Combine
  state.people.forEach((p, idx) => {
    totals.set(p.id, (totals.get(p.id) ?? 0) + tipShares[idx] + taxShares[idx])
  })

  return totals
}
```

### Anti-Patterns to Avoid
- **Storing dollar strings in the Zustand store:** All monetary values must be integer cents in the store. Only convert at UI input/output boundaries using `toCents()`/`fromCents()`.
- **Deriving assignedTo semantics from a "mode" field:** The type contract uses `assignedTo.length` to distinguish single/shared/unassigned — no separate `mode: 'single' | 'shared'` field.
- **Calling `parseFloat` once and reusing result without NaN check:** Always check `isNaN()` immediately after `parseFloat`. Empty string returns `NaN` from `parseFloat`.
- **Showing validation error for empty input:** The guard in D-13 treats blank input as "user is mid-edit" — no error shown until a non-empty non-numeric value is entered.
- **Adding tip/tax proportionally before item subtotals are computed:** The proportional split weights are the item subtotals — `calculateBreakdowns` must compute item subtotals first, then use them as weights.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Popover with focus trap + outside-click close | Custom div with event listeners | `shadcn/ui Popover` (Radix-backed) | Radix handles focus trap, keyboard navigation (Escape to close), aria attributes, and portal rendering |
| Checkbox with accessible state | Custom `<div>` toggle | `shadcn/ui Checkbox` (Radix-backed) | Radix provides `aria-checked`, keyboard support, `indeterminate` state if needed |
| Integer-safe distribution of tip/tax | Custom rounding logic | `distributeRemainder` / `distributeProportionally` in `src/lib/calculations.ts` | Already implemented with Largest Remainder Method; handles divide-by-zero |
| Dollar/cent conversion | `Math.round(parseFloat(x) * 100)` inline | `toCents()` / `fromCents()` in `src/lib/calculations.ts` | Handles `$`, commas, whitespace stripping; consistent across codebase |

**Key insight:** The entire math layer is already built and tested. Phase 3 is almost entirely UI composition work.

---

## Common Pitfalls

### Pitfall 1: Popover and Checkbox not yet generated
**What goes wrong:** Importing `@/components/ui/popover` or `@/components/ui/checkbox` before running `npx shadcn add` causes a module-not-found error at build time.
**Why it happens:** `src/components/ui/` currently contains only `button.tsx` and `input.tsx`. The `radix-ui` package includes the underlying Radix primitives as transitive dependencies, but the styled shadcn wrapper files must be generated.
**How to avoid:** Wave 0 task runs `npx shadcn add popover` and `npx shadcn add checkbox` first, before any implementation tasks.
**Warning signs:** TypeScript `Cannot find module '@/components/ui/popover'` errors in IDE before Wave 0 completes.

### Pitfall 2: `parseFloat` on empty string returns NaN silently
**What goes wrong:** When a user clears the custom tip input, `parseFloat('')` returns `NaN`. If the NaN guard checks only `isNaN(parsed) || parsed < 0` without first checking for empty string, it triggers the "Enter a number" error on an empty input — which is confusing during mid-edit.
**Why it happens:** JavaScript's `parseFloat('')` returns `NaN`, same as `parseFloat('abc')`.
**How to avoid:** Check `if (val === '')` first and treat it as a reset to 0 with no error displayed. The guard condition should be: `val !== '' && (isNaN(parsed) || parsed < 0)`.
**Warning signs:** Validation error appearing immediately when user deletes input contents.

### Pitfall 3: Proportional split with all-zero subtotals
**What goes wrong:** If no items are assigned, all person subtotals are 0. Calling `distributeProportionally(tipCents, [0, 0, 0])` would normally divide by zero.
**Why it happens:** A user configures tip/tax before assigning any items.
**How to avoid:** `distributeProportionally` already has a divide-by-zero guard — it falls back to `distributeRemainder` when `totalWeight === 0`. This is already implemented in `src/lib/calculations.ts`. The integration test in plan 03-04 should explicitly cover this case.
**Warning signs:** NaN in per-person totals when no items are assigned.

### Pitfall 4: AssignmentSelector "Everyone" logic edge case — empty people list
**What goes wrong:** If `people.length === 0`, checking "Everyone" would set `assignedTo = []` (all of an empty array). This is correct for the type contract but the popover should inform the user.
**Why it happens:** Items can exist before people are added.
**How to avoid:** When `people.length === 0`, render "Add people first" as non-interactive text in the popover content instead of the checkbox list. The trigger button remains enabled to show this message. Specified in UI-SPEC copywriting contract.
**Warning signs:** Empty popover with no feedback when no people have been added.

### Pitfall 5: ItemRow layout breakage from AssignmentSelector insertion
**What goes wrong:** Adding AssignmentSelector and the warning icon to ItemRow without adjusting the flex layout causes overflow or misalignment.
**Why it happens:** Current ItemRow left section is `flex gap-4` with only label + price. Adding more children requires changing to `flex gap-2 items-center` and verifying the overall `justify-between` still works.
**How to avoid:** Update ItemRow left-section className to `flex gap-2 items-center` per UI-SPEC layout contract. Keep outer `justify-between` unchanged.

### Pitfall 6: Tax amount mode — forgetting toCents conversion on dispatch
**What goes wrong:** In TaxControl dollar-amount mode, dispatching `setTax({ value: parseFloat(inputValue) })` stores a float dollar amount instead of integer cents, violating the type contract.
**Why it happens:** `ChargeConfig.value` stores integer cents when `mode === 'amount'`.
**How to avoid:** In dollar-amount mode: `setTax({ value: toCents(inputValue), mode: 'amount' })`. In percent mode: `setTax({ value: parseFloat(inputValue), mode: 'percent' })`.

---

## Code Examples

Verified patterns from the existing codebase:

### Zustand Selector Pattern (established in Phase 1/2)
```typescript
// Source: src/store/useBillStore.ts
const people = useBillStore((s) => s.people)
const assignItem = useBillStore((s) => s.assignItem)
const setTip = useBillStore((s) => s.setTip)
const setTax = useBillStore((s) => s.setTax)
```

### setTip Action Signature (store already implemented)
```typescript
// Source: src/store/useBillStore.ts
setTip: (config) =>
  set((state) => ({ tip: { ...state.tip, ...config } })),
// Usage: setTip({ value: 18 }) or setTip({ splitMethod: 'proportional' }) — partial updates
```

### setTax Action Signature (store already implemented)
```typescript
// Source: src/store/useBillStore.ts
setTax: (config) =>
  set((state) => ({ tax: { ...state.tax, ...config } })),
// Usage: setTax({ value: toCents('12.50'), mode: 'amount' })
```

### ChargeConfig Type (from src/types/index.ts)
```typescript
// Source: src/types/index.ts
export interface ChargeConfig {
  mode: 'percent' | 'amount'
  value: number  // percent (0-100) when mode='percent'; integer cents when mode='amount'
  splitMethod: SplitMethod  // 'equal' | 'proportional'
}
```

### Initial Store State (tip/tax defaults)
```typescript
// Source: src/store/useBillStore.ts
tip: { mode: 'percent', value: 0, splitMethod: 'equal' },
tax: { mode: 'percent', value: 0, splitMethod: 'equal' },
```

### NaN guard pattern (from ItemForm — adapt for tip/tax)
```typescript
// Source: src/components/ItemsPanel/ItemForm.tsx
const cents = toCents(price)
if (!trimmedLabel || isNaN(cents) || cents <= 0) return
```

### App.tsx — ChargesPanel insertion point
```typescript
// Source: src/App.tsx (current) — needs mb-6 added to flex row and ChargesPanel below
<div className="flex gap-6 mb-6">
  <PeoplePanel />
  <ItemsPanel />
</div>
<ChargesPanel />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@radix-ui/react-popover` (separate package) | `radix-ui` unified package (1.4.3) | Radix v1 unified release | Import from `radix-ui` not `@radix-ui/react-popover`. shadcn-generated files handle this correctly — don't hand-write Radix imports. |
| `zustand` v4 subscribe/selector patterns | v5 (same API for selectors, removed deprecated selectors) | Zustand v5 (2024) | No impact — project already on v5.0.12. Selector pattern unchanged. |

**Deprecated/outdated:**
- `import { Popover } from '@radix-ui/react-popover'`: Use `npx shadcn add popover` to generate the wrapper, which uses the unified `radix-ui` package import style. Do not write raw Radix imports by hand.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | shadcn CLI, npm | ✓ | v24.14.1 | — |
| npm | `npx shadcn add` | ✓ | 11.11.0 | — |
| shadcn CLI | Wave 0 component generation | ✓ | 4.1.1 (installed as project dep) | — |
| Popover component | AssignmentSelector | ✗ (not yet generated) | — | Run `npx shadcn add popover` |
| Checkbox component | AssignmentSelector | ✗ (not yet generated) | — | Run `npx shadcn add checkbox` |

**Missing dependencies with no fallback:**
- `src/components/ui/popover.tsx` — must be generated before Plan 03-01
- `src/components/ui/checkbox.tsx` — must be generated before Plan 03-01

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + React Testing Library 16.3.2 |
| Config file | `vite.config.ts` (uses `vitest/config` defineConfig) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ASGN-01 | Checking one person dispatches `assignItem(id, [personId])` | unit (component) | `npx vitest run src/components/ItemsPanel/AssignmentSelector.test.tsx` | ❌ Wave 0 |
| ASGN-02 | "Everyone" button with no prior selection assigns all people | unit (component) | `npx vitest run src/components/ItemsPanel/AssignmentSelector.test.tsx` | ❌ Wave 0 |
| ASGN-03 | Checking subset of people stores only that subset | unit (component) | `npx vitest run src/components/ItemsPanel/AssignmentSelector.test.tsx` | ❌ Wave 0 |
| ASGN-04 | `assignedTo.length === 0` renders warning icon | unit (component) | `npx vitest run src/components/ItemsPanel/ItemRow.test.tsx` | ❌ Wave 0 |
| TIP-01 | Selecting 15/18/20/Custom updates store tip value | unit (component) | `npx vitest run src/components/ChargesPanel/TipControl.test.tsx` | ❌ Wave 0 |
| TIP-02 | Equal split toggle dispatches `setTip({ splitMethod: 'equal' })` | unit (component) | `npx vitest run src/components/ChargesPanel/TipControl.test.tsx` | ❌ Wave 0 |
| TIP-03 | Proportional split toggle dispatches correctly | unit (component) | `npx vitest run src/components/ChargesPanel/TipControl.test.tsx` | ❌ Wave 0 |
| TAX-01 | $ mode dispatches toCents value; % mode dispatches float | unit (component) | `npx vitest run src/components/ChargesPanel/TaxControl.test.tsx` | ❌ Wave 0 |
| TAX-02 | Equal split toggle dispatches `setTax({ splitMethod: 'equal' })` | unit (component) | `npx vitest run src/components/ChargesPanel/TaxControl.test.tsx` | ❌ Wave 0 |
| TAX-03 | Proportional split + divide-by-zero guard | integration | `npx vitest run src/lib/calculations.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run` (full suite, fast — no existing tests to slow down)
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/ui/popover.tsx` — generated by `npx shadcn add popover`
- [ ] `src/components/ui/checkbox.tsx` — generated by `npx shadcn add checkbox`
- [ ] `src/components/ItemsPanel/AssignmentSelector.test.tsx` — covers ASGN-01, ASGN-02, ASGN-03
- [ ] `src/components/ItemsPanel/ItemRow.test.tsx` — covers ASGN-04
- [ ] `src/components/ChargesPanel/TipControl.test.tsx` — covers TIP-01, TIP-02, TIP-03
- [ ] `src/components/ChargesPanel/TaxControl.test.tsx` — covers TAX-01, TAX-02, TAX-03
- [ ] `src/lib/calculations.test.ts` — covers TAX-03 integration (calculateBreakdowns proportional + divide-by-zero)

*(Test setup infrastructure exists: `src/test/setup.ts` with jest-dom matchers + cleanup is already configured.)*

---

## Open Questions

1. **`calculateBreakdowns` return type**
   - What we know: Phase 4 (SummaryPanel) needs per-person totals. Phase 3 plan 03-04 says to write the function and cover it with an integration test.
   - What's unclear: The exact return type is not locked — `Map<string, number>` (personId → cents) is the natural choice but Phase 4 might need richer data (e.g., person name + total). Since Phase 4 can always access `people` from the store to join on ID, `Map<string, number>` is sufficient.
   - Recommendation: Return `Map<string, number>` (personId → integer cents). Keep it pure — no store reads inside the function, pass `AppState` as parameter.

2. **Tip mode is always 'percent' — no 'amount' mode for tip**
   - What we know: `ChargeConfig.mode` is `'percent' | 'amount'`, but the TipControl only exposes percentage presets (15/18/20) and a custom percent input. There is no dollar-amount tip mode.
   - What's unclear: The store `tip.mode` will always be `'percent'`. TipControl never dispatches `setTip({ mode: 'amount' })`.
   - Recommendation: TipControl only ever dispatches `setTip({ value: parsedFloat, mode: 'percent', splitMethod: ... })`. The 'amount' mode for ChargeConfig is TaxControl-only. No conflict with the type, just a usage constraint.

---

## Sources

### Primary (HIGH confidence)
- `src/types/index.ts` — type contracts, `assignedTo: string[]`, `ChargeConfig`, `SplitMethod`
- `src/store/useBillStore.ts` — `assignItem`, `setTip`, `setTax` implementations confirmed
- `src/lib/calculations.ts` — `distributeRemainder`, `distributeProportionally`, `toCents`, `fromCents` confirmed with divide-by-zero guard
- `src/components/ui/button.tsx` — available variants: `default`, `outline`, `ghost`, `secondary`, `destructive`, `link`; sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- `components.json` — confirmed `style: radix-nova`, `iconLibrary: lucide`, aliases
- `vite.config.ts` — confirmed `vitest` config with jsdom, `globals: true`, `setupFiles: ./src/test/setup.ts`
- `package.json` — confirmed all dependency versions
- `.planning/phases/03-assignment-charges/03-CONTEXT.md` — all locked decisions D-01 through D-13
- `.planning/phases/03-assignment-charges/03-UI-SPEC.md` — component inventory, interaction contract, accessibility contract, layout contract

### Secondary (MEDIUM confidence)
- `shadcn/ui` official docs pattern: Popover + Checkbox not yet generated (confirmed by `ls src/components/ui/` returning only `button.tsx` and `input.tsx`)

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions confirmed from `package.json`; all installed components inspected directly
- Architecture: HIGH — existing code patterns read directly; store actions confirmed implemented
- Pitfalls: HIGH — derived from direct code inspection (NaN behavior, type contract, layout structure) not documentation alone
- Validation architecture: HIGH — test framework config confirmed from `vite.config.ts` and `src/test/setup.ts`

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable stack — shadcn/ui, Zustand, Vitest APIs change slowly)
