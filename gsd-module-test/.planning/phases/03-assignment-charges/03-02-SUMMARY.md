---
phase: 03-assignment-charges
plan: 02
subsystem: ChargesPanel
tags: [tip, ui, components, tdd, zustand]
dependency_graph:
  requires: [src/store/useBillStore.ts, src/types/index.ts, src/components/ui/button.tsx, src/components/ui/input.tsx]
  provides: [ChargesPanel, TipControl]
  affects: [src/App.tsx]
tech_stack:
  added: []
  patterns: [zustand-selector, controlled-input, NaN-guard, preset-toggle]
key_files:
  created:
    - src/components/ChargesPanel/ChargesPanel.tsx
    - src/components/ChargesPanel/TipControl.tsx
    - src/components/ChargesPanel/TipControl.test.tsx
  modified:
    - src/App.tsx
decisions:
  - activePreset uses tip.value from store but is null when isCustom is true — avoids showing wrong preset highlighted while custom input is active
metrics:
  duration: 88s
  completed_date: "2026-04-01"
  tasks: 2
  files: 4
---

# Phase 03 Plan 02: ChargesPanel and TipControl Summary

ChargesPanel container with TipControl component providing 15/18/20% preset buttons, inline custom input with NaN guard, and equal/proportional split toggle wired to Zustand store.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create ChargesPanel container, TipControl component, and wire into App.tsx | 9e5ae6c | ChargesPanel.tsx, TipControl.tsx, App.tsx |
| 2 | Create TipControl tests for TIP-01, TIP-02, TIP-03 | 90fc8ea | TipControl.test.tsx |

## Decisions Made

- **activePreset null when isCustom=true:** Prevents stale preset highlight while user types a custom value. The preset variant is 'outline' when `activePreset` is null regardless of the store value.
- **parseFloat for custom tip:** Allows decimal values (e.g., 17.5%), consistent with ChargeConfig.value being a float-percent.

## Deviations from Plan

None - plan executed exactly as written.

## Tests

- 8 new tests in TipControl.test.tsx covering TIP-01 (preset and custom input), TIP-02 (equal split), TIP-03 (proportional split)
- NaN guard validated: non-numeric input shows "Enter a number" alert; empty input clears error
- Total suite: 53 tests, all passing (was 45)

## Known Stubs

None - TipControl is fully wired to store and all UI flows are functional.

## Self-Check: PASSED
