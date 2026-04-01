---
phase: 02-people-items
plan: "02"
subsystem: ui
tags: [react, zustand, vitest, react-testing-library, shadcn-ui, lucide-react]

requires:
  - phase: 02-01
    provides: PeoplePanel, Zustand store with addItem/removeItem, toCents/fromCents helpers, RTL test infrastructure

provides:
  - ItemForm component with dollar-format price input and toCents conversion at submit boundary
  - ItemRow component with formatted price display and Remove button
  - ItemsPanel container rendering ItemForm and ItemRow list with empty state
  - 6 RTL integration tests for add/remove item flows
  - App.tsx updated to render PeoplePanel and ItemsPanel side by side

affects: [02-03, 02-04]

tech-stack:
  added: []
  patterns:
    - "Granular Zustand selector per action: useBillStore((s) => s.addItem)"
    - "toCents() called at submit boundary in form handler, never in display layer"
    - "fromCents() called in display component (ItemRow) for formatted output"
    - "isNaN(cents) || cents <= 0 guard prevents storing invalid prices"
    - "aria-label on Remove button includes item label for accessible identification"

key-files:
  created:
    - src/components/ItemsPanel/ItemForm.tsx
    - src/components/ItemsPanel/ItemRow.tsx
    - src/components/ItemsPanel/ItemsPanel.tsx
    - src/components/ItemsPanel/ItemsPanel.test.tsx
  modified:
    - src/App.tsx

key-decisions:
  - "Button disabled when label OR price is empty — both required before submitting"
  - "cents <= 0 guard rejects zero-price items as well as NaN from non-numeric input"

patterns-established:
  - "ItemForm pattern: two controlled inputs, toCents at submit, clear both on success"
  - "ItemRow pattern: display label + fromCents(price), ghost icon-xs Remove button with aria-label"
  - "Empty state pattern: conditional p element with muted-foreground text"

requirements-completed: [ITEM-01, ITEM-02]

duration: 2min
completed: 2026-04-01
---

# Phase 02 Plan 02: ItemsPanel Summary

**ItemsPanel with dollar-format price input (toCents conversion), removable item rows (fromCents display), and 6 passing RTL tests wired to Zustand store**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-01T01:45:02Z
- **Completed:** 2026-04-01T01:47:07Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- ItemForm with two controlled inputs, toCents() at submit boundary, NaN/zero guard, clears on success
- ItemRow displaying label + fromCents(price) with accessible ghost Remove button
- ItemsPanel container with ItemForm + conditional ItemRow list + "No items added yet." empty state
- 6 RTL integration tests covering add, clear, dollar format with commas, remove, NaN rejection, disabled state
- App.tsx updated to render ItemsPanel alongside PeoplePanel — full bill data entry UI now visible

## Task Commits

Each task was committed atomically:

1. **Task 1: ItemsPanel test scaffold + ItemForm + ItemRow + ItemsPanel container** - `d75964d` (feat)
2. **Task 2: Add ItemsPanel to App.tsx alongside PeoplePanel** - `0732563` (feat)

**Plan metadata:** (docs commit follows)

_Note: Task 1 followed TDD — RED (test file created, import error confirmed), then GREEN (all 3 components created, 6/6 tests pass)_

## Files Created/Modified
- `src/components/ItemsPanel/ItemForm.tsx` - Label + price inputs, toCents() conversion, dispatches addItem
- `src/components/ItemsPanel/ItemRow.tsx` - Label + fromCents(price) display + Remove button with aria-label
- `src/components/ItemsPanel/ItemsPanel.tsx` - Container: ItemForm + ItemRow list + empty state
- `src/components/ItemsPanel/ItemsPanel.test.tsx` - 6 RTL integration tests
- `src/App.tsx` - Added ItemsPanel import and render alongside PeoplePanel

## Decisions Made
- Button disabled when BOTH label and price are empty (both required for a valid item)
- `cents <= 0` guard alongside `isNaN(cents)` — rejects zero-price items in addition to NaN
- Used named exports throughout for consistency with PeoplePanel pattern from 02-01

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None - all 6 tests passed on first GREEN run. TypeScript clean. Full suite (45 tests) passing.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ItemsPanel complete and integrated into App.tsx
- Items can be added with name + price (dollar format accepted) and removed individually
- Store's addItem/removeItem confirmed working via RTL integration tests
- Ready for Phase 02-03: item assignment (assign items to people / shared)

---
*Phase: 02-people-items*
*Completed: 2026-04-01*
