---
phase: 01-foundation
plan: 01-03
subsystem: state
tags: [zustand, typescript, store, types, vitest]
dependency_graph:
  requires: [01-01]
  provides: [zustand-store, app-types, window-store]
  affects: [01-04, 02-01]
tech_stack:
  added: []
  patterns:
    - Zustand v5 create<AppState & AppActions>()() curried TypeScript pattern
    - Direct store.getState() access in Vitest tests (no React wrapper needed)
    - window.__store__ exposure for browser console verification
key_files:
  created:
    - src/types/index.ts
    - src/store/useBillStore.ts
    - src/store/useBillStore.test.ts
  modified:
    - src/App.tsx
decisions:
  - "Used string[] for assignedTo (not string[] | 'shared') — empty = unassigned, all IDs = shared-everyone, subset = shared-subset"
  - "Item.price stores INTEGER CENTS only — toCents() must be called at input boundary before storing"
  - "ChargeConfig.value is 0-100 for percent mode, integer cents for amount mode"
  - "window.__store__ assigned at module level in App.tsx (outside component) so it is set before any render"
metrics:
  duration_minutes: 8
  completed_date: "2026-03-31"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 1 Plan 03: State Shape — Zustand Store with AppState Type, Action Stubs, useBillStore Hook Summary

**One-liner:** Zustand v5 store with complete AppState + AppActions TypeScript contract, 12 passing Vitest tests, and window.__store__ browser console access.

## What Was Built

### Task 1: TypeScript Types (`src/types/index.ts`)

Complete type contract for the entire app. All six types exported:

```typescript
export type SplitMethod = 'equal' | 'proportional'

export interface Person {
  id: string        // crypto.randomUUID()
  name: string
}

export interface Item {
  id: string
  label: string
  price: number     // INTEGER CENTS — never floating-point dollars
  assignedTo: string[]
}

export interface ChargeConfig {
  mode: 'percent' | 'amount'
  value: number     // 0-100 when percent, cents when amount
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

### Task 2: Zustand Store, Tests, and App.tsx Update

**`src/store/useBillStore.ts`**

Implements Zustand v5 pattern with double-parentheses curried syntax for correct TypeScript inference:

```typescript
export const useBillStore = create<AppState & AppActions>()((set) => ({
  ...initialState,
  // All 8 actions implemented
}))
```

Initial state: `people: []`, `items: []`, `tip: { mode: 'percent', value: 0, splitMethod: 'equal' }`, `tax: { mode: 'percent', value: 0, splitMethod: 'equal' }`.

**`src/store/useBillStore.test.ts`**

12 tests covering:
- Initial state shape (4 tests)
- `addPerson` — UUID generation and multiple adds (2 tests)
- `removePerson` — removal by ID (1 test)
- `addItem` — UUID, label, price in cents, empty assignedTo (1 test)
- `assignItem` — updates assignedTo array (1 test)
- `resetBill` — full reset to initial values (1 test)
- `setTip` / `setTax` — partial config updates (2 tests)

Tests use direct `useBillStore.getState()` calls — no React component wrapper needed for pure state logic. Store is reset with `resetBill()` in `beforeEach` for isolation.

**`src/App.tsx` update**

Added `window.__store__ = useBillStore` at module level with TypeScript `declare global { interface Window { __store__: typeof useBillStore } }` augmentation. Allows `window.__store__.getState().resetBill()` from the browser dev tools console.

## Success Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| `src/types/index.ts` exports all 6 types | PASS | SplitMethod, Person, Item, ChargeConfig, AppState, AppActions all exported |
| `Item.price` JSDoc states INTEGER CENTS | PASS | "Price in INTEGER CENTS (e.g., $12.50 is stored as 1250). Never store floating-point dollars here." |
| `create<AppState & AppActions>()()` double parentheses | PASS | Line 9 of useBillStore.ts |
| All 8 action stubs exist | PASS | addPerson, removePerson, addItem, removeItem, assignItem, setTip, setTax, resetBill |
| `npm test -- --run src/store/useBillStore.test.ts` exits 0 | PASS | 12/12 tests green |
| `npm test -- --run` exits 0 (full suite) | PASS | 31/31 tests green (12 store + 19 calculations) |
| `window.__store__.getState().resetBill()` callable | PASS | Assigned in App.tsx at module level |
| `npx tsc --noEmit` no errors | PASS | Clean compilation |

## Test Coverage

| File | Tests | Status |
|------|-------|--------|
| `src/store/useBillStore.test.ts` | 12 | All green |
| `src/lib/calculations.test.ts` | 19 | All green (from plan 01-02) |
| **Total** | **31** | **All green** |

## Deviations from Plan

None — plan executed exactly as written.

The `src/types/index.ts` file had already been created (likely during scaffolding research), matching the plan's specification exactly. It was staged and committed as Task 1 without modification.

## Known Stubs

None — all actions have full implementations. `resetBill` resets to `initialState`, all other actions correctly mutate the Zustand store via `set()`. No placeholder text or hardcoded empty data flows to UI rendering.

## Commits

| Commit | Message |
|--------|---------|
| 436743b | feat(01-03): define TypeScript types in src/types/index.ts |
| 16800bc | feat(01-03): implement Zustand store, tests, and window.__store__ exposure |

## Self-Check: PASSED

- `src/types/index.ts` — EXISTS
- `src/store/useBillStore.ts` — EXISTS
- `src/store/useBillStore.test.ts` — EXISTS
- Commit 436743b — FOUND in git history
- Commit 16800bc — FOUND in git history
- `npm test -- --run` exits 0 — VERIFIED (31/31 passing)
- `npx tsc --noEmit` exits 0 — VERIFIED (clean)
