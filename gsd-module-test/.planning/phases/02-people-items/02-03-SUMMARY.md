---
phase: 02-people-items
plan: "03"
subsystem: testing
tags: [zustand, vitest, cascade-delete, store]

# Dependency graph
requires:
  - phase: 02-people-items
    provides: "useBillStore with addPerson/addItem/assignItem/removePerson actions and types"
provides:
  - "Atomic cascade delete in removePerson: clears person ID from all item assignedTo arrays in single set() call"
  - "3 cascade delete unit tests proving no stale person ID references remain after removal"
affects: [phase-03-assignment, phase-04-summary]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atomic multi-field Zustand update: both people and items returned from single set() call to prevent intermediate state"
    - "Cascade pattern: items.map + assignedTo.filter for referential integrity without extra DB layer"

key-files:
  created: []
  modified:
    - src/store/useBillStore.ts
    - src/store/useBillStore.test.ts

key-decisions:
  - "Single set() call for people + items update ensures Zustand applies both atomically — no intermediate state where person is removed but items still reference them"

patterns-established:
  - "Cascade delete pattern: when removing an entity, map over related arrays and filter out stale references in the same set() call"

requirements-completed: [PEOP-03]

# Metrics
duration: 5min
completed: 2026-04-01
---

# Phase 2 Plan 03: Cascade Delete Summary

**Atomic removePerson cascade using Zustand single-set() pattern — clears stale person IDs from all item assignedTo arrays with 3 TDD-verified scenarios**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-04-01T00:23:00Z
- **Completed:** 2026-04-01T00:24:00Z
- **Tasks:** 1 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments

- Upgraded `removePerson` to atomically update both `people` and `items` in a single `set()` call
- Items' `assignedTo` arrays are filtered in-place via `item.assignedTo.filter((pid) => pid !== id)` — no stale references
- Three new cascade delete tests added: full clear, preserve-others, and graceful no-op cases
- All 15 store tests pass; full suite (34 tests) green; zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Cascade delete tests + removePerson store upgrade** - `88cb183` (feat)

**Plan metadata:** (pending docs commit)

_Note: TDD task — tests written first (RED), then implementation (GREEN), committed together_

## Files Created/Modified

- `src/store/useBillStore.ts` — removePerson upgraded with atomic items cascade
- `src/store/useBillStore.test.ts` — added `describe('removePerson — cascade delete')` with 3 new it() blocks

## Decisions Made

- Single `set()` call chosen over two separate calls to guarantee atomicity — Zustand applies both `people` and `items` arrays in one render cycle, preventing any component from seeing a state where a person is gone but their ID still exists in item assignments

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 (Assignment UI) can safely call `removePerson` knowing no orphaned person IDs will exist in `assignedTo` arrays
- Phase 4 (Summary calculations) will never encounter a person ID in an item that doesn't correspond to an existing person

---
*Phase: 02-people-items*
*Completed: 2026-04-01*
