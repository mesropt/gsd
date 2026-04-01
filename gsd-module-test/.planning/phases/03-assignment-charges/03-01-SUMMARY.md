---
phase: 03-assignment-charges
plan: "01"
subsystem: ItemsPanel
tags: [assignment, popover, checkbox, radix-ui, shadcn]
dependency_graph:
  requires: []
  provides: [AssignmentSelector, ItemRow-with-assignment, popover-primitive, checkbox-primitive]
  affects: [src/components/ItemsPanel/ItemRow.tsx]
tech_stack:
  added: [shadcn Popover, shadcn Checkbox]
  patterns: [Radix Popover, Radix Checkbox, store-reactive props, Zustand selector]
key_files:
  created:
    - src/components/ui/popover.tsx
    - src/components/ui/checkbox.tsx
    - src/components/ItemsPanel/AssignmentSelector.tsx
    - src/components/ItemsPanel/AssignmentSelector.test.tsx
    - src/components/ItemsPanel/ItemRow.test.tsx
  modified:
    - src/components/ItemsPanel/ItemRow.tsx
decisions:
  - "Read assignedTo from store (not prop) in AssignmentSelector so consecutive checkbox clicks in the same popover session accumulate correctly"
metrics:
  duration: "3 minutes"
  completed_date: "2026-04-01"
  tasks: 2
  files: 6
---

# Phase 03 Plan 01: AssignmentSelector and ItemRow Warning Summary

## One-liner

Radix Popover + Checkbox AssignmentSelector with reactive store reads for multi-check accumulation, mounted in ItemRow with AlertCircle unassigned warning.

## What Was Built

### Task 1: Popover, Checkbox, AssignmentSelector

- Installed `src/components/ui/popover.tsx` and `src/components/ui/checkbox.tsx` via `npx shadcn add` (official registry, Radix-backed)
- Built `AssignmentSelector` component:
  - Props: `{ item: Item }` — reads `assignedTo` directly from Zustand store (not from prop) for reactive updates
  - Trigger label progression: "Assign" → "{name}" → "{name1}, {name2}" → "{N} people" → "Everyone"
  - Popover content: per-person Checkbox rows + separator + Everyone toggle button
  - Empty state: "Add people first" when no people in store
  - `aria-haspopup="listbox"` on trigger, `aria-label` on Everyone button reflects checked state
- 6 tests covering ASGN-01 (single assign), ASGN-02 (everyone), ASGN-03 (subset), Everyone-uncheck, trigger labels, empty state

### Task 2: ItemRow update and ASGN-04 test

- Updated `ItemRow.tsx`:
  - Left section changed from `flex gap-4` to `flex gap-2 items-center`
  - Added `AlertCircle` warning icon (conditional on `assignedTo.length === 0`)
  - Mounted `AssignmentSelector` inline after warning icon
- Created `ItemRow.test.tsx` with 3 tests: warning shown unassigned, hidden when assigned, AssignmentSelector trigger visible

## Tests

| File | Tests | Result |
|------|-------|--------|
| AssignmentSelector.test.tsx | 6 | All pass |
| ItemRow.test.tsx | 3 | All pass |
| ItemsPanel.test.tsx | 6 | All pass (regression) |

**Total: 15 tests, 15 passing**

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AssignmentSelector read assignedTo from store, not prop**
- **Found during:** Task 1 verification (ASGN-03 test failure)
- **Issue:** Component used `item.assignedTo` from prop for computing `next` in `handleTogglePerson`. Since prop doesn't update within the same render cycle, clicking two checkboxes in the same popover session resulted in only the last click being recorded (both computed `next` from `[]`)
- **Fix:** Added `const assignedTo = useBillStore((s) => s.items.find((i) => i.id === item.id)?.assignedTo ?? item.assignedTo)` — reads live store state so each consecutive click appends to the current array
- **Files modified:** `src/components/ItemsPanel/AssignmentSelector.tsx`
- **Commit:** 90f7a7a

**2. [Rule 2 - Missing critical fix] Wrapped direct store mutations in act() in test**
- **Found during:** Task 2 cleanup — act() warning appeared during test run
- **Fix:** Imported `act` from `@testing-library/react` and wrapped `useBillStore.getState().assignItem(...)` calls in trigger label test
- **Files modified:** `src/components/ItemsPanel/AssignmentSelector.test.tsx`
- **Commit:** c6ee36b

## Known Stubs

None — all data wired to live Zustand store.

## Self-Check: PASSED
