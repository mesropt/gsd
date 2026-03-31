# Roadmap: Expense Splitter

## Overview

Four phases take the project from a bare Vite scaffold to a fully working bill-splitter. Phase 1 establishes the math foundation and project skeleton — everything downstream depends on getting integer-cent arithmetic right first. Phase 2 delivers data entry for people and items. Phase 3 adds assignment logic and tip/tax configuration, completing the full calculation pipeline. Phase 4 surfaces the final per-person breakdown, enforces rounding correctness, and polishes the mobile layout.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Vite/React/Tailwind/Zustand scaffold, integer-cent math helpers, Vitest configured and green
- [ ] **Phase 2: People & Items** - People panel and Items panel with add/remove and cascade-delete
- [ ] **Phase 3: Assignment & Charges** - Item assignment UI, tip config, tax config, proportional/equal splits
- [ ] **Phase 4: Summary & Polish** - Final per-person breakdown, Largest Remainder rounding, running subtotals, mobile layout

## Phase Details

### Phase 1: Foundation
**Goal**: The project scaffolding, state shape, and math helpers are in place so every subsequent phase can build on a correct, tested base
**Depends on**: Nothing (first phase)
**Requirements**: ITEM-03
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` opens a blank app shell in the browser with no console errors
  2. Running `npm test` executes the Vitest suite and all tests pass (green)
  3. `toCents`, `fromCents`, and `distributeRemainder` helpers exist in `src/lib/` and are covered by unit tests, including the penny-remainder edge case
  4. The Zustand store is wired with the full `AppState` shape (people, items, tip, tax) and a `resetBill` action callable from the browser console
  5. shadcn/ui Button and Input components render correctly in the app shell
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 01-01: Scaffold — Vite + React + TypeScript + Tailwind CSS + shadcn/ui init, verify dev server runs
- [ ] 01-02: Math core — `toCents`, `fromCents`, `distributeRemainder` helpers in `src/lib/calculations.ts` with full Vitest unit tests
- [ ] 01-03: State shape — Zustand store with `AppState` type, all action stubs, `useBillStore` hook exported

### Phase 2: People & Items
**Goal**: Users can build a bill — adding people by name and adding items with prices — with cascade cleanup when a person is removed
**Depends on**: Phase 1
**Requirements**: PEOP-01, PEOP-02, PEOP-03, ITEM-01, ITEM-02
**Success Criteria** (what must be TRUE):
  1. User can type a name and click Add to see that person appear in the People panel
  2. User can click Remove on a person and they disappear from the list
  3. User can type an item name and price (dollar format with $ and commas accepted) and click Add to see the item appear in the Items panel
  4. User can click Remove on an item and it disappears from the list
  5. When a person is removed, any item assigned to them becomes unassigned — no stale person ID remains on any item
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 02-01: PeoplePanel — `PersonForm` (add) + `PersonTag` (name + remove), wired to Zustand `addPerson` / `removePerson` actions
- [ ] 02-02: ItemsPanel — `ItemForm` (label + price input with dollar-to-cent conversion on submit) + `ItemRow` (label, formatted price, remove), wired to `addItem` / `removeItem`
- [ ] 02-03: Cascade delete — `removePerson` action clears that person's ID from all item `assignedTo` arrays in the same dispatch; unit test asserts no stale references

### Phase 3: Assignment & Charges
**Goal**: Users can assign each item to a person or a subset of people, configure tip and tax, and the calculation engine produces correct per-person subtotals
**Depends on**: Phase 2
**Requirements**: ASGN-01, ASGN-02, ASGN-03, ASGN-04, TIP-01, TIP-02, TIP-03, TAX-01, TAX-02, TAX-03
**Success Criteria** (what must be TRUE):
  1. User can assign an item to exactly one person using the assignment selector on each item row
  2. User can mark an item as shared and select a subset of people to split it among (not necessarily all)
  3. A visible warning appears next to any item that has no assignment
  4. User can select a tip percentage (15 / 18 / 20 / custom) and toggle between equal and proportional split
  5. User can enter tax as a dollar amount or a percentage, and toggle between equal and proportional split
  6. Custom tip/tax inputs that contain non-numeric values show a validation error and do not produce NaN in calculations
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [ ] 03-01: AssignmentSelector — single-person and shared-subset modes on each `ItemRow`, dispatches `ASSIGN_ITEM`; quick-assign "Everyone" button for shared items
- [ ] 03-02: Unassigned item warning — `ASGN-04` guard: items with empty `assignedTo` array display a warning badge; verified by unit test
- [ ] 03-03: TipControl — preset buttons (15/18/20) + custom text input + equal/proportional toggle, dispatches `SET_TIP`; NaN guard on custom input
- [ ] 03-04: TaxControl — amount/percent mode toggle + value input + equal/proportional toggle, dispatches `SET_TAX`; NaN guard; `calculateBreakdowns` integration test covering proportional divide-by-zero guard

### Phase 4: Summary & Polish
**Goal**: Users see an accurate final breakdown of what each person owes, totals sum exactly to the bill total, and the app is usable on a phone
**Depends on**: Phase 3
**Requirements**: SUMM-01, SUMM-02, SUMM-03
**Success Criteria** (what must be TRUE):
  1. The Summary panel shows each person's name, item subtotal, tip share, tax share, and grand total in readable dollar format
  2. Summing all person grand totals equals exactly (item total + tip + tax) — no penny errors — verified by an assertion in the summary render and a unit test
  3. A running subtotal per person updates live as items are assigned or reassigned, visible before the tip/tax section
  4. The layout is usable on a 375 px wide screen (panels stack vertically, inputs are touch-friendly, no horizontal scroll)
  5. Edge cases render without error: zero people, one person, all items unassigned, zero tip, zero tax
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 04-01: SummaryPanel — `calculateBreakdowns` called via `useMemo`, `PersonSummaryRow` per person (subtotal + tip share + tax share + total); balance assertion `sum(totals) === billTotal` throws if violated
- [ ] 04-02: Largest Remainder rounding — implement in `distributeRemainder` (already scaffolded in Phase 1), add integration test asserting exact equality across odd-cent proportional splits; running subtotals visible above ChargesPanel
- [ ] 04-03: Mobile polish — responsive Tailwind layout (single-column stack on mobile), touch-target sizing, edge-case smoke tests (empty bill, single person, all-unassigned)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. People & Items | 0/3 | Not started | - |
| 3. Assignment & Charges | 0/4 | Not started | - |
| 4. Summary & Polish | 0/3 | Not started | - |
