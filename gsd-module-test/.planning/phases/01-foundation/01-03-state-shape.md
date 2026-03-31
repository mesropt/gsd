---
phase: 01-foundation
plan: 01-03
type: execute
wave: 2
depends_on:
  - 01-01
files_modified:
  - src/types/index.ts
  - src/store/useBillStore.ts
  - src/store/useBillStore.test.ts
  - src/App.tsx
autonomous: true
requirements:
  - ITEM-03

must_haves:
  truths:
    - "`useBillStore` is importable and provides `people`, `items`, `tip`, `tax` state fields"
    - "`resetBill()` is callable from the browser console via `window.__store__.getState().resetBill()`"
    - "Initial state has `people: []`, `items: []`, `tip: { mode: 'percent', value: 0, splitMethod: 'equal' }`, `tax: { mode: 'percent', value: 0, splitMethod: 'equal' }`"
    - "All action stubs (`addPerson`, `removePerson`, `addItem`, `removeItem`, `assignItem`, `setTip`, `setTax`, `resetBill`) exist and do not throw when called"
    - "`npm test -- --run src/store/useBillStore.test.ts` exits 0"
  artifacts:
    - path: "src/types/index.ts"
      provides: "TypeScript types: Person, Item, ChargeConfig, SplitMethod, AppState, AppActions"
      exports: ["Person", "Item", "ChargeConfig", "SplitMethod", "AppState", "AppActions"]
    - path: "src/store/useBillStore.ts"
      provides: "Zustand store with useBillStore hook, AppState + AppActions, initial state, all action stubs"
      exports: ["useBillStore"]
    - path: "src/store/useBillStore.test.ts"
      provides: "Vitest tests covering store shape, resetBill, and key action stubs"
  key_links:
    - from: "src/store/useBillStore.ts"
      to: "src/types/index.ts"
      via: "import type { AppState, AppActions } from '../types'"
      pattern: "AppState.*AppActions"
    - from: "src/App.tsx"
      to: "src/store/useBillStore.ts"
      via: "window.__store__ = useBillStore (for browser console access)"
      pattern: "__store__"
    - from: "useBillStore.test.ts"
      to: "useBillStore.ts"
      via: "direct store.getState() calls (no React wrapper)"
      pattern: "getState"
---

<phase>1</phase>
<plan>01-03</plan>
<name>State shape — Zustand store with AppState type, action stubs, useBillStore hook</name>
<wave>2</wave>

<goal>
Define the complete TypeScript type contract for the app state in `src/types/index.ts`, implement the Zustand store with the full `AppState` shape and all action stubs in `src/store/useBillStore.ts`, and expose `resetBill` on the browser console via `window.__store__`. Write Vitest tests covering store shape and the resetBill action. All tests pass green.
</goal>

<context>
Key decisions from research (01-RESEARCH.md):

- Zustand v5 TypeScript pattern: `create<AppState & AppActions>()()` — double parentheses required for correct TS inference. Single parens `create<T>()` loses type safety.
- `assignedTo: string[]` design (not `string[] | "shared"`): empty array = unassigned; all person IDs = shared-among-everyone; subset of IDs = shared-among-subset. Simpler type, no magic strings. Phase 3 UI uses this convention.
- `Item.price: number` stores INTEGER CENTS only (ITEM-03). The type comment must state this. Validation happens at input boundary via `toCents()` from plan 01-02.
- `ChargeConfig.value: number` — when `mode === 'amount'`, value is cents. When `mode === 'percent'`, value is 0-100 (not a decimal like 0.15).
- Initial state: `tip: { mode: 'percent', value: 0, splitMethod: 'equal' }`, same for tax.
- Browser console access: assign `window.__store__ = useBillStore` in `src/App.tsx` so success criterion 4 ("resetBill callable from browser console") can be verified manually.
- Store tests use direct `useBillStore.getState()` — no React component wrapper needed for pure state logic tests. Reset store with `useBillStore.getState().resetBill()` in `beforeEach`.
- Depends on plan 01-01 (scaffold) because the Vitest runner and TypeScript aliases must be in place for this plan to run tests.
</context>

<tasks>
  <task>
    <name>Task 1: Define TypeScript types in src/types/index.ts</name>
    <files>src/types/index.ts</files>
    <action>
Create `src/types/index.ts` with the complete type contract for the entire app. These types are the single source of truth used by the store, calculations, and all future components.

```typescript
/**
 * src/types/index.ts
 *
 * Complete TypeScript type contract for the Expense Splitter app.
 * All monetary values (Item.price, ChargeConfig.value when mode='amount')
 * are stored as INTEGER CENTS — never floating-point dollars.
 */

export type SplitMethod = 'equal' | 'proportional'

export interface Person {
  /** Unique identifier — generated via crypto.randomUUID() */
  id: string
  name: string
}

export interface Item {
  /** Unique identifier — generated via crypto.randomUUID() */
  id: string
  label: string
  /**
   * Price in INTEGER CENTS (e.g., $12.50 is stored as 1250).
   * Never store floating-point dollars here. Use toCents() on input.
   */
  price: number
  /**
   * IDs of people this item is assigned to.
   * - Empty array []             → unassigned (warning shown in Phase 4)
   * - All person IDs             → shared equally among everyone
   * - Subset of person IDs       → shared among that subset
   * No magic "shared" string — use array contents to determine sharing.
   */
  assignedTo: string[]
}

export interface ChargeConfig {
  /** 'percent': value is 0-100 (e.g., 18 for 18%). 'amount': value is integer cents. */
  mode: 'percent' | 'amount'
  /** Percent (0-100) when mode='percent', integer cents when mode='amount'. */
  value: number
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
  /** priceCents must be an integer (use toCents() before calling) */
  addItem: (label: string, priceCents: number) => void
  removeItem: (id: string) => void
  /** assignedTo is an array of person IDs; empty = unassigned */
  assignItem: (itemId: string, assignedTo: string[]) => void
  setTip: (config: Partial<ChargeConfig>) => void
  setTax: (config: Partial<ChargeConfig>) => void
  resetBill: () => void
}
```

No runtime code — this file is types only. Verify it compiles: `npx tsc --noEmit` should report no errors after this file is created.
    </action>
    <verify>
      File exists at `src/types/index.ts`. Running `npx tsc --noEmit` produces no TypeScript errors from this file. All six types (`SplitMethod`, `Person`, `Item`, `ChargeConfig`, `AppState`, `AppActions`) are exported.
    </verify>
    <done>
      `src/types/index.ts` exists and exports all six types. No TypeScript errors.
    </done>
  </task>

  <task>
    <name>Task 2: Implement Zustand store and write passing tests</name>
    <files>src/store/useBillStore.ts, src/store/useBillStore.test.ts, src/App.tsx</files>
    <action>
**Step A — Create `src/store/useBillStore.ts`:**

```typescript
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

  addPerson: (name) =>
    set((state) => ({
      people: [...state.people, { id: crypto.randomUUID(), name }],
    })),

  removePerson: (id) =>
    set((state) => ({
      people: state.people.filter((p) => p.id !== id),
    })),

  addItem: (label, priceCents) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: crypto.randomUUID(), label, price: priceCents, assignedTo: [] },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),

  assignItem: (itemId, assignedTo) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === itemId ? { ...i, assignedTo } : i
      ),
    })),

  setTip: (config) =>
    set((state) => ({ tip: { ...state.tip, ...config } })),

  setTax: (config) =>
    set((state) => ({ tax: { ...state.tax, ...config } })),

  resetBill: () => set(initialState),
}))
```

**Step B — Create `src/store/useBillStore.test.ts`:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useBillStore } from './useBillStore'

// Reset store before each test to ensure isolation
beforeEach(() => {
  useBillStore.getState().resetBill()
})

describe('initial state', () => {
  it('starts with empty people array', () => {
    expect(useBillStore.getState().people).toEqual([])
  })

  it('starts with empty items array', () => {
    expect(useBillStore.getState().items).toEqual([])
  })

  it('starts with tip mode percent, value 0, equal split', () => {
    expect(useBillStore.getState().tip).toEqual({
      mode: 'percent',
      value: 0,
      splitMethod: 'equal',
    })
  })

  it('starts with tax mode percent, value 0, equal split', () => {
    expect(useBillStore.getState().tax).toEqual({
      mode: 'percent',
      value: 0,
      splitMethod: 'equal',
    })
  })
})

describe('addPerson', () => {
  it('adds a person with a UUID and the given name', () => {
    useBillStore.getState().addPerson('Sarah')
    const { people } = useBillStore.getState()
    expect(people).toHaveLength(1)
    expect(people[0].name).toBe('Sarah')
    expect(people[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('adds multiple people', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    expect(useBillStore.getState().people).toHaveLength(2)
  })
})

describe('removePerson', () => {
  it('removes the person with the given id', () => {
    useBillStore.getState().addPerson('Alice')
    const id = useBillStore.getState().people[0].id
    useBillStore.getState().removePerson(id)
    expect(useBillStore.getState().people).toHaveLength(0)
  })
})

describe('addItem', () => {
  it('adds an item with a UUID, label, price in cents, and empty assignedTo', () => {
    useBillStore.getState().addItem('Pizza', 1250)
    const { items } = useBillStore.getState()
    expect(items).toHaveLength(1)
    expect(items[0].label).toBe('Pizza')
    expect(items[0].price).toBe(1250)
    expect(items[0].assignedTo).toEqual([])
    expect(items[0].id).toMatch(/^[0-9a-f-]{36}$/)
  })
})

describe('assignItem', () => {
  it('updates assignedTo for the given item id', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Salad', 800)
    const itemId = useBillStore.getState().items[0].id
    const personId = useBillStore.getState().people[0].id
    useBillStore.getState().assignItem(itemId, [personId])
    expect(useBillStore.getState().items[0].assignedTo).toEqual([personId])
  })
})

describe('resetBill', () => {
  it('resets all state to initial values', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Pizza', 1250)
    useBillStore.getState().setTip({ value: 18, splitMethod: 'proportional' })
    useBillStore.getState().resetBill()
    const state = useBillStore.getState()
    expect(state.people).toEqual([])
    expect(state.items).toEqual([])
    expect(state.tip).toEqual({ mode: 'percent', value: 0, splitMethod: 'equal' })
    expect(state.tax).toEqual({ mode: 'percent', value: 0, splitMethod: 'equal' })
  })
})

describe('setTip / setTax', () => {
  it('updates tip fields with partial config', () => {
    useBillStore.getState().setTip({ value: 20 })
    expect(useBillStore.getState().tip.value).toBe(20)
    expect(useBillStore.getState().tip.mode).toBe('percent') // unchanged
  })

  it('updates tax splitMethod', () => {
    useBillStore.getState().setTax({ splitMethod: 'proportional' })
    expect(useBillStore.getState().tax.splitMethod).toBe('proportional')
  })
})
```

**Step C — Expose store on window for browser console access (ROADMAP success criterion 4):**

Update `src/App.tsx`. Add the following after the imports and before the component:

```typescript
// Expose store on window for browser console verification
// Usage: window.__store__.getState().resetBill()
declare global {
  interface Window {
    __store__: typeof useBillStore
  }
}
window.__store__ = useBillStore
```

Add `import { useBillStore } from '@/store/useBillStore'` to App.tsx imports.

The rest of App.tsx (the JSX with Button and Input from plan 01-01) stays unchanged.

**Step D — Run tests:**

```
npm test -- --run src/store/useBillStore.test.ts
```

All tests must be green. Then run the full suite:

```
npm test -- --run
```

All tests (calculations + store) must pass.
    </action>
    <verify>
      `npm test -- --run src/store/useBillStore.test.ts` exits 0 with all tests passing.
      `npm test -- --run` exits 0 (full suite: calculations + store tests both green).
      `npm run dev` still runs clean with no console errors (window.__store__ assigned without error).
    </verify>
    <done>
      `src/store/useBillStore.ts` exports `useBillStore` with Zustand v5 double-parens pattern. All store tests pass. `window.__store__` is accessible in the browser console and `window.__store__.getState().resetBill()` can be called without error.
    </done>
  </task>
</tasks>

<success_criteria>
1. `src/types/index.ts` exports `Person`, `Item`, `ChargeConfig`, `SplitMethod`, `AppState`, `AppActions`
2. `Item.price` has a JSDoc comment stating INTEGER CENTS — never floating-point
3. `src/store/useBillStore.ts` uses `create<AppState & AppActions>()()` (double parentheses — Zustand v5 TypeScript pattern)
4. All action stubs exist: `addPerson`, `removePerson`, `addItem`, `removeItem`, `assignItem`, `setTip`, `setTax`, `resetBill`
5. `npm test -- --run src/store/useBillStore.test.ts` exits 0 — all store tests green
6. `npm test -- --run` exits 0 — full Phase 1 test suite (calculations + store) all green
7. `window.__store__.getState().resetBill()` callable from the browser console (verified by opening dev tools on the running app)
8. `npx tsc --noEmit` produces no TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-03-SUMMARY.md` documenting:
- Final AppState and AppActions interfaces as implemented
- Test count and coverage
- Confirmation that `window.__store__.getState().resetBill()` works in the browser console
- Confirmation that the full `npm test -- --run` suite is green
- Any deviations from the plan (e.g., Zustand API differences, TypeScript version quirks)
</output>
