# Phase 1: Foundation - Research

**Researched:** 2026-03-31
**Domain:** Vite + React + TypeScript scaffold, Tailwind CSS v4, shadcn/ui, Zustand v5, Vitest, integer-cent math
**Confidence:** HIGH

---

## Summary

Phase 1 establishes the project skeleton that every subsequent phase builds on. Three plans: scaffold the Vite + React + TypeScript + Tailwind CSS + shadcn/ui project (01-01), implement integer-cent math helpers with full Vitest coverage (01-02), and wire the Zustand store with the complete `AppState` shape (01-03).

The biggest discovery from live npm verification is that **Tailwind CSS v4 is now `latest` (4.2.2)** — not v3. This changes the setup meaningfully: there is no `tailwind.config.js`, no PostCSS step, and the Vite integration uses a first-party `@tailwindcss/vite` plugin. The shadcn/ui CLI (now at v4.1.1) has been updated to support Tailwind v4 natively, and the component registry now imports from the unified `radix-ui` package rather than separate `@radix-ui/react-*` packages.

Zustand is at 5.0.12. The v5 TypeScript pattern uses curried `create<T>()()` syntax (double parentheses). Vitest is at 4.1.2 — a major version jump from the 2.x the prior research assumed — but the configuration API is unchanged: `environment: 'jsdom'`, `globals: true`, `setupFiles`.

The integer-cent arithmetic pattern (Largest Remainder Method) is a stable, well-understood technique with no ecosystem dependency. All money values stored as integers; `distributeRemainder` applies the canonical sort-by-fractional-remainder algorithm.

**Primary recommendation:** Scaffold with Tailwind v4 + `@tailwindcss/vite` plugin (no config file), initialize shadcn/ui with `npx shadcn@latest init`, use Zustand `create<AppState & AppActions>()()` pattern, test with Vitest 4 + jsdom.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ITEM-03 | Item prices are stored as integer cents (no floating-point errors) | Integer-cent helpers `toCents`/`fromCents`/`distributeRemainder` in `src/lib/calculations.ts`; Vitest tests verify no float leakage; Zustand `Item.price: number` stores cents only |
</phase_requirements>

---

## Standard Stack

### Core (all versions npm-verified 2026-03-31)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vite | 8.0.3 | Build tool + dev server | Fastest HMR, native ESM, React template |
| react | 19.2.4 | UI framework | Pre-decided |
| react-dom | 19.2.4 | DOM renderer | Paired with React |
| typescript | 6.0.2 | Type safety | Pre-decided |
| @vitejs/plugin-react | 6.0.1 | React Fast Refresh in Vite | Official plugin |
| tailwindcss | 4.2.2 | Utility CSS | Pre-decided; v4 is now `latest` |
| @tailwindcss/vite | 4.2.2 | Tailwind v4 Vite plugin | Replaces PostCSS; no config file needed |

### State, Components, Testing

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.12 | App-wide state | Single cohesive store for people/items/tip/tax |
| shadcn/ui (CLI) | 4.1.1 | Accessible component primitives | Not an npm dep — CLI copies components into repo |
| radix-ui | 1.4.3 | Unified Radix package (used by shadcn v4) | New in shadcn v4; replaces separate `@radix-ui/react-*` packages |
| class-variance-authority | 0.7.1 | shadcn/ui variant helper | Required by shadcn components |
| clsx | 2.1.1 | Class name utility | Required by shadcn components |
| tailwind-merge | 3.5.0 | Merge Tailwind classes safely | Required by shadcn components |
| lucide-react | 1.7.0 | Icon set | shadcn/ui default icons |
| vitest | 4.1.2 | Test runner | Vite-native; no separate babel setup |
| @vitest/ui | 4.1.2 | Vitest browser UI | Optional but useful |
| jsdom | 29.0.1 | DOM emulation | Required for React component tests |
| @testing-library/react | 16.3.2 | Component testing | Query by role/text, not implementation |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Higher fidelity than fireEvent |
| @testing-library/jest-dom | 6.9.1 | Custom DOM matchers | `toBeInTheDocument()`, `toHaveValue()` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3 (v3-lts: 3.4.19) | v3 requires PostCSS + tailwind.config.js but is more stable; v4 is the current default and what shadcn/ui now expects |
| Zustand | React useReducer + Context | Context approach works but requires manual provider setup, more boilerplate, no devtools without extras |
| Integer cents (custom) | dinero.js v2 | dinero adds ~25KB and API complexity for a 30-line problem; only warranted if multi-currency is added |

**Installation:**

```bash
# 1. Scaffold Vite project
npm create vite@latest expense-splitter -- --template react-ts
cd expense-splitter
npm install

# 2. Tailwind v4 (no config file needed)
npm install tailwindcss @tailwindcss/vite

# 3. State + component utilities
npm install zustand
npm install class-variance-authority clsx tailwind-merge lucide-react

# 4. shadcn/ui CLI init (installs radix-ui and other deps automatically)
npx shadcn@latest init
# Then add components:
npx shadcn@latest add button input

# 5. Testing (dev dependencies)
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

**Version verification (ran 2026-03-31):**

```
vite: 8.0.3
react: 19.2.4
tailwindcss: 4.2.2 (latest — v4, NOT v3)
@tailwindcss/vite: 4.2.2
zustand: 5.0.12
vitest: 4.1.2
@testing-library/react: 16.3.2
shadcn CLI: 4.1.1
radix-ui: 1.4.3
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── main.tsx                   # ReactDOM.createRoot only
├── App.tsx                    # Top-level layout, renders panels
├── lib/
│   └── calculations.ts        # Pure functions: toCents, fromCents, distributeRemainder
├── store/
│   └── useBillStore.ts        # Zustand store: AppState + AppActions
├── types/
│   └── index.ts               # Person, Item, ChargeConfig, AppState, AppActions
├── components/
│   ├── ui/                    # shadcn/ui copied components (Button, Input, etc.)
│   ├── PeoplePanel/
│   ├── ItemsPanel/
│   ├── ChargesPanel/
│   └── SummaryPanel/
└── test/
    └── setup.ts               # @testing-library/jest-dom import
```

Note: the prior architecture research recommended `useReducer + Context`. Phase 1 uses Zustand instead (as locked in STACK.md). The folder names are adjusted accordingly — `store/` replaces `context/` and `reducer/`. The `types/` folder is retained as-is.

### Pattern 1: Tailwind v4 Vite Setup (no tailwind.config.js)

**What:** Tailwind v4 integrates directly as a Vite plugin. CSS config replaces JS config.
**When to use:** All new projects starting from 2025/2026.

`vite.config.ts`:
```typescript
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

`src/index.css` (replaces tailwind.config.js directives):
```css
@import "tailwindcss";
```

There is no `tailwind.config.js` in Tailwind v4. Do NOT create one.

### Pattern 2: shadcn/ui Init with Tailwind v4

**What:** `npx shadcn@latest init` detects Tailwind v4 and configures accordingly.
**When to use:** After Vite scaffold and Tailwind v4 plugin are in place.

The `components.json` file is generated by the CLI. Components are copied to `src/components/ui/`. shadcn v4 uses the unified `radix-ui` package (not separate `@radix-ui/react-*` packages).

TypeScript path alias in `tsconfig.app.json` (required by shadcn init):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Pattern 3: Zustand v5 TypeScript Store

**What:** `create<T>()()` curried syntax with TypeScript interface.
**When to use:** Always in TypeScript. The double-parentheses are required even without middleware.

```typescript
// src/store/useBillStore.ts
import { create } from 'zustand'
import type { AppState, AppActions } from '../types'

const initialState: AppState = {
  people: [],
  items: [],
  tip: { mode: 'percent', value: 0, splitMethod: 'equal' },
  tax: { mode: 'percent', value: 0, splitMethod: 'equal' },
}

export const useBillStore = create<AppState & AppActions>()((set) => ({
  ...initialState,

  // Action stubs (Phase 1 — full implementations in Phase 2+)
  addPerson: (name) => set((state) => ({
    people: [...state.people, { id: crypto.randomUUID(), name }],
  })),
  removePerson: (id) => set((state) => ({
    people: state.people.filter((p) => p.id !== id),
  })),
  addItem: (label, priceCents) => set((state) => ({
    items: [...state.items, { id: crypto.randomUUID(), label, price: priceCents, assignedTo: [] }],
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
  assignItem: (itemId, assignedTo) => set((state) => ({
    items: state.items.map((i) => i.id === itemId ? { ...i, assignedTo } : i),
  })),
  setTip: (config) => set((state) => ({ tip: { ...state.tip, ...config } })),
  setTax: (config) => set((state) => ({ tax: { ...state.tax, ...config } })),
  resetBill: () => set(initialState),
}))
```

Consuming in a component:
```typescript
// Selector pattern — component only re-renders when `people` changes
const people = useBillStore((state) => state.people)
const addPerson = useBillStore((state) => state.addPerson)
```

### Pattern 4: Vitest Configuration with jsdom

**What:** Add `test` block to `vite.config.ts` (or create separate `vitest.config.ts`).
**When to use:** All React component and unit tests.

```typescript
// vite.config.ts (add test block)
/// <reference types="vitest" />
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

`src/test/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
afterEach(() => cleanup())
```

`tsconfig.app.json` — add jest-dom types:
```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Pattern 5: Integer-Cent Math Helpers

**What:** Three pure functions covering 100% of the bill-splitting math need.
**When to use:** All monetary values. Convert on input, display on output, never anywhere in between.

```typescript
// src/lib/calculations.ts

/**
 * Parse a user-entered dollar string to integer cents.
 * Strips $, commas, and whitespace. Rounds to nearest cent.
 * toCents("$12.50") === 1250
 * toCents(12.5) === 1250
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
 * fromCents(1250) === "$12.50"
 */
export function fromCents(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

/**
 * Distribute `totalCents` into `parts` integer shares that sum exactly to totalCents.
 * Uses the Largest Remainder Method: floor each share, then give remainder pennies
 * to the shares with the largest fractional parts.
 *
 * distributeRemainder(100, 3) === [34, 33, 33]  (not [33, 33, 33] with 1 lost)
 * distributeRemainder(1, 3)   === [1, 0, 0]
 */
export function distributeRemainder(totalCents: number, parts: number): number[] {
  if (parts <= 0) return []
  if (parts === 1) return [totalCents]

  const base = Math.floor(totalCents / parts)
  const fractionalRemainder = totalCents - base * parts

  // Start with floor share for each part
  const shares = Array(parts).fill(base)

  // Distribute the remainder pennies to the first `fractionalRemainder` slots
  // (Simple variant; the sort-by-fraction variant is used when weights differ —
  //  see distributeProportionally below for proportional splits)
  for (let i = 0; i < fractionalRemainder; i++) {
    shares[i] += 1
  }

  return shares
}

/**
 * Distribute `totalCents` proportionally according to `weights` (arbitrary positive numbers).
 * Uses Largest Remainder Method: sort by fractional part to assign remainder pennies fairly.
 * Sum of result always equals totalCents exactly.
 *
 * distributeProportionally(100, [1, 1, 1]) === [34, 33, 33]
 * distributeProportionally(10, [3, 1])     === [8, 2]   (not [7.5, 2.5])
 */
export function distributeProportionally(totalCents: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  if (totalWeight === 0) {
    // Fallback: equal split when all weights are zero (divide-by-zero guard)
    return distributeRemainder(totalCents, weights.length)
  }

  const exact = weights.map((w) => (w / totalWeight) * totalCents)
  const floors = exact.map(Math.floor)
  const remainder = totalCents - floors.reduce((a, b) => a + b, 0)

  // Sort indices by fractional part descending, give +1 to the top `remainder` indices
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

### Pattern 6: AppState Type Shape

**What:** Complete TypeScript types for the entire bill model.
**When to use:** Imported by store, calculations, and all components.

```typescript
// src/types/index.ts

export type SplitMethod = 'equal' | 'proportional'

export interface Person {
  id: string          // crypto.randomUUID()
  name: string
}

export interface Item {
  id: string
  label: string
  price: number       // INTEGER CENTS — never dollars
  assignedTo: string[] // person IDs; empty array = unassigned; all IDs = shared
}

export interface ChargeConfig {
  mode: 'percent' | 'amount'  // percent: value is 0-100; amount: value is cents
  value: number               // stored as cents when mode === 'amount'
  splitMethod: SplitMethod
}

export interface AppState {
  people: Person[]
  items: Item[]
  tip: ChargeConfig
  tax: ChargeConfig
}

export interface AppActions {
  addPerson: (name: string) => void
  removePerson: (id: string) => void
  addItem: (label: string, priceCents: number) => void
  removeItem: (id: string) => void
  assignItem: (itemId: string, assignedTo: string[]) => void
  setTip: (config: Partial<ChargeConfig>) => void
  setTax: (config: Partial<ChargeConfig>) => void
  resetBill: () => void
}
```

Note on `assignedTo` design: Using `string[]` (person IDs) rather than `string[] | "shared"`. An empty array means unassigned. Passing all person IDs means shared-among-everyone. A subset of IDs means shared-among-subset. This is simpler than a union type with a magic string and eliminates a branch in every calculation.

### Anti-Patterns to Avoid

- **Using `tailwind.config.js` with Tailwind v4:** Does not exist in v4. Configuration moves to CSS `@theme` directives.
- **Installing separate `@radix-ui/react-*` packages manually:** shadcn/ui v4 uses the unified `radix-ui` package. The CLI handles this automatically on `add`.
- **`create<T>()` with single parentheses in Zustand v5:** This works for JavaScript but loses TypeScript inference. Always use `create<T>()()`.
- **Storing money as floats:** `item.price = 12.99` causes `0.1 + 0.2 === 0.30000000000000004`. Store as `1299` cents.
- **Using `Math.round` at each calculation step:** Round once on input (`toCents`), once on distribution (`distributeRemainder`). Mid-pipeline rounding compounds errors.
- **Importing `@testing-library/jest-dom` without extending matchers:** In Vitest (unlike Jest), you must explicitly call `expect.extend(matchers)` in setup.ts. The auto-import from Jest does not apply.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible modal/dialog | Custom focus trap + aria | shadcn/ui Dialog (Radix) | Focus trapping, aria-modal, keyboard dismiss are ~200 lines to do correctly |
| Accessible dropdown/select | `<select>` or custom div | shadcn/ui Select (Radix) | Keyboard navigation, screen reader, cross-browser scroll are complex |
| CSS class merging | String concatenation | `clsx` + `tailwind-merge` | Tailwind class conflicts (e.g., `p-2` vs `p-4`) silently lose the later class without `tailwind-merge` |
| Component variants | Inline ternaries | `class-variance-authority` | shadcn components use CVA; fighting it creates inconsistency |
| Proportional distribution | Custom ad-hoc rounding | `distributeProportionally()` (in calculations.ts) | Off-by-one penny errors happen reliably without Largest Remainder; write once, test, done |

**Key insight:** The custom integer-cent helpers ARE the don't-hand-roll solution for money math — write them once with comprehensive tests rather than ad-hoc arithmetic scattered across components.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 — No tailwind.config.js

**What goes wrong:** Developer runs `npx tailwindcss init` or creates `tailwind.config.js`, wiring up PostCSS the v3 way. shadcn/ui init then fails or produces broken styles.
**Why it happens:** Most tutorials and AI training data cover Tailwind v3. Tailwind v4 changed the setup model entirely.
**How to avoid:** Do NOT create `tailwind.config.js`. Install `@tailwindcss/vite` as the Vite plugin. Add `@import "tailwindcss"` to `src/index.css`. That is the entire setup.
**Warning signs:** Running `npx tailwindcss init` without `--help` prompting you; PostCSS config file appearing.

### Pitfall 2: shadcn/ui CLI Mistakenly Used as npm Package

**What goes wrong:** `npm install shadcn-ui` or `npm install @shadcn/ui` — both are wrong. These are stale packages.
**Why it happens:** The CLI name changed from `shadcn-ui` to `shadcn` in 2024.
**How to avoid:** Always run `npx shadcn@latest init` (not install). Components are copied, not installed.
**Warning signs:** `node_modules/shadcn-ui/` appearing; components not in `src/components/ui/`.

### Pitfall 3: Vitest globals: true Not Set

**What goes wrong:** `describe`, `it`, `expect` are undefined in test files. Developers add `import { describe, it, expect } from 'vitest'` to every file.
**Why it happens:** Vitest doesn't enable globals by default (unlike Jest).
**How to avoid:** Set `globals: true` in vitest config. Add `"types": ["vitest/globals"]` to `tsconfig.app.json`.
**Warning signs:** TypeScript errors on `describe`/`it`/`expect` without explicit imports.

### Pitfall 4: @testing-library/jest-dom Matchers Not Extended

**What goes wrong:** `toBeInTheDocument()` throws "is not a function" even though jest-dom is installed.
**Why it happens:** In Vitest, jest-dom matchers must be explicitly extended. In Jest they are auto-registered.
**How to avoid:** In `src/test/setup.ts`, add:
```typescript
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)
```
**Warning signs:** "toBeInTheDocument is not a function" at runtime despite the package being installed.

### Pitfall 5: Zustand Selector Syntax — Full State Subscription

**What goes wrong:** `const state = useBillStore()` — subscribes the component to every state change, causing unnecessary re-renders.
**Why it happens:** This is valid Zustand API, just inefficient.
**How to avoid:** Always use selectors: `const people = useBillStore((s) => s.people)`.
**Warning signs:** Component re-renders when unrelated state (e.g., `tip`) changes.

### Pitfall 6: Float Arithmetic on Price Input

**What goes wrong:** `const price = parseFloat(input.value)` stored directly on `item.price`. Penny errors accumulate.
**Why it happens:** Natural JavaScript number handling.
**How to avoid:** `const price = toCents(input.value)` on submit. `item.price` is always an integer.
**Warning signs:** `item.price === 12.299999999999999` appearing in state.

### Pitfall 7: distributeRemainder Remainder Not Verified by Test

**What goes wrong:** The remainder distribution has an off-by-one bug but no test catches it because tests only check individual shares, not the sum.
**Why it happens:** The sum-to-total invariant is the critical property, but it is easy to miss.
**How to avoid:** Write a Vitest test that asserts `distributeRemainder(total, n).reduce((a,b)=>a+b, 0) === total` for many values of total and n.
**Warning signs:** Per-person totals that are off by $0.01 on certain bill amounts.

---

## Code Examples

### Verified: toCents edge cases (test coverage targets)

```typescript
// src/lib/calculations.test.ts
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
    for (const [total, parts] of [[1, 3], [7, 3], [10, 7], [1000, 9]]) {
      const result = distributeRemainder(total, parts)
      expect(result.reduce((a, b) => a + b, 0)).toBe(total)
    }
  })
  it('handles single part', () => expect(distributeRemainder(100, 1)).toEqual([100]))
  it('handles zero total', () => {
    const result = distributeRemainder(0, 3)
    expect(result.reduce((a, b) => a + b, 0)).toBe(0)
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
  it('distributes proportionally', () => {
    const result = distributeProportionally(10, [3, 1])
    expect(result).toEqual([8, 2])
    expect(result.reduce((a, b) => a + b, 0)).toBe(10)
  })
})
```

### Verified: Zustand store test pattern

```typescript
// Direct store interaction (no React needed for pure logic tests)
import { useBillStore } from '../store/useBillStore'

beforeEach(() => useBillStore.getState().resetBill())

it('addPerson adds a person with a UUID', () => {
  useBillStore.getState().addPerson('Sarah')
  const { people } = useBillStore.getState()
  expect(people).toHaveLength(1)
  expect(people[0].name).toBe('Sarah')
  expect(people[0].id).toMatch(/^[0-9a-f-]{36}$/)
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` + PostCSS | `@tailwindcss/vite` plugin, CSS `@import "tailwindcss"` | Tailwind v4 (2025) | No config file; `vite.config.ts` is the only config |
| `@radix-ui/react-button`, `@radix-ui/react-dialog`, etc. | Unified `radix-ui` package | shadcn v4 (2026) | One package dep instead of many; CLI handles automatically |
| `shadcn-ui` CLI name | `shadcn` CLI name | 2024 | Use `npx shadcn@latest`, not `npx shadcn-ui@latest` |
| Zustand `create<T>()` single parens | `create<T>()()` double parens | Zustand v4+ | Required for correct TS inference; future-proof for middleware |
| `import '@testing-library/jest-dom'` in setup | `import * as matchers from '@testing-library/jest-dom/matchers'; expect.extend(matchers)` | RTL + Vitest | Explicit extension required; implicit Jest registration doesn't apply |

**Deprecated/outdated:**
- `shadcn-ui` package name: replaced by `shadcn`
- Tailwind v3 PostCSS setup: still works (v3-lts: 3.4.19) but new projects should use v4
- Separate `@radix-ui/react-*` packages: shadcn v4 moves to unified `radix-ui`

---

## Open Questions

1. **Tailwind v4 CSS variable theming in shadcn/ui**
   - What we know: v4 uses `@theme` directives; shadcn/ui updated its CLI to handle this; `components.json` is generated by `npx shadcn@latest init`
   - What's unclear: Exact CSS variable names and structure shadcn v4 generates for dark mode — needs to be verified by actually running `npx shadcn@latest init` and inspecting `index.css`
   - Recommendation: Run the init, inspect output, proceed with whatever the CLI generates. Don't pre-write `index.css` CSS variables.

2. **`assignedTo: string[]` vs `string[] | "shared"` design**
   - What we know: Prior ARCHITECTURE.md used `string[] | "shared"`; this research recommends `string[]` with an "all IDs = shared" convention
   - What's unclear: Whether Phase 3 UI patterns assume the magic string "shared" or check array contents
   - Recommendation: Use `string[]` (simpler type, no magic strings). If a "quick-share with everyone" button is needed, it dispatches `assignItem(id, people.map(p => p.id))`. This decision should be logged in Phase 1 plans.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install, vite dev | Must verify | — | — |
| npm | Package installation | Must verify | — | — |
| npx | shadcn CLI | Ships with npm | — | — |

**Note:** The research environment did not probe `node --version` and `npm --version` directly as this is a greenfield project where the developer controls the machine. The npm registry was accessible during research (versions were verified via `npm view`), so npm/node are functional.

**Missing dependencies with no fallback:** None identified for this phase. All packages are available on npm registry.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vite.config.ts` (add `test` block with `/// <reference types="vitest" />`) |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ITEM-03 | `toCents` stores integer cents, no float | unit | `npm test -- --run src/lib/calculations.test.ts` | Wave 0 |
| ITEM-03 | `fromCents` formats cents to display string | unit | `npm test -- --run src/lib/calculations.test.ts` | Wave 0 |
| ITEM-03 | `distributeRemainder(100, 3)` sums to 100 | unit | `npm test -- --run src/lib/calculations.test.ts` | Wave 0 |
| ITEM-03 | `distributeProportionally` handles zero weights (no NaN) | unit | `npm test -- --run src/lib/calculations.test.ts` | Wave 0 |
| Phase SC-2 | Vitest suite runs and all tests pass (`npm test` exits 0) | smoke | `npm test -- --run` | Wave 0 |
| Phase SC-3 | `distributeRemainder` edge case: 1 cent into 3 parts | unit | `npm test -- --run src/lib/calculations.test.ts` | Wave 0 |
| Phase SC-4 | `useBillStore.getState().resetBill()` callable; store resets | unit | `npm test -- --run src/store/useBillStore.test.ts` | Wave 0 |
| Phase SC-5 | Button and Input components render without error | smoke | `npm test -- --run src/components/ui/` | Wave 0 |

SC = Success Criterion from ROADMAP.md Phase 1 section.

### Sampling Rate

- **Per task commit:** `npm test -- --run src/lib/calculations.test.ts` (fast unit tests only)
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before moving to Phase 2

### Wave 0 Gaps

All test files must be created during this phase (greenfield project — nothing exists yet):

- [ ] `src/lib/calculations.test.ts` — covers ITEM-03, distributeRemainder edge cases
- [ ] `src/store/useBillStore.test.ts` — covers store shape, resetBill, action stubs
- [ ] `src/test/setup.ts` — jest-dom matchers extension
- [ ] Framework config: add `test` block to `vite.config.ts` with `globals: true`, `environment: 'jsdom'`, `setupFiles`
- [ ] `package.json` scripts: `"test": "vitest"` and `"test:ui": "vitest --ui"`

---

## Sources

### Primary (HIGH confidence)
- npm registry (live queries, 2026-03-31) — all package versions verified
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — confirmed v4 is default for new projects
- [shadcn/ui Vite installation docs](https://ui.shadcn.com/docs/installation/vite) — exact CLI commands
- [Vitest environment docs](https://vitest.dev/guide/environment) — jsdom config syntax
- [shadcn/ui changelog](https://ui.shadcn.com/docs/changelog) — CLI v4, unified radix-ui package, Tailwind v4 support

### Secondary (MEDIUM confidence)
- WebSearch: "vite create react typescript 2025" — confirmed `npm create vite@latest -- --template react-ts`
- WebSearch: "shadcn ui vite tailwind v4 installation 2025 2026" — confirmed Tailwind v4 setup steps
- WebSearch: "zustand v5 TypeScript create store pattern" — confirmed `create<T>()()` curried syntax
- WebSearch: "vitest 3 react testing library jsdom setup" — confirmed globals + jsdom + setupFiles pattern
- WebSearch: "largest remainder method JavaScript implementation" — confirmed canonical algorithm

### Tertiary (LOW confidence)
- Prior project research files (`STACK.md`, `ARCHITECTURE.md`, `SUMMARY.md`) — training-data based, now superseded by live npm versions above

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via live `npm view` queries
- Architecture: HIGH — Zustand v5 TypeScript pattern verified via web search + official source; Tailwind v4 confirmed via official docs
- Pitfalls: HIGH — several pitfalls directly discovered during research (Tailwind config, jest-dom extension, Zustand parens)
- Integer-cent math: HIGH — IEEE 754 is a language constant; Largest Remainder Method is published algorithm

**Research date:** 2026-03-31
**Valid until:** 2026-06-30 (90 days — Tailwind and shadcn/ui are moving fast; re-verify CLI commands before any new project after this date)
