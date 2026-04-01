# Phase 3: Assignment & Charges - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 delivers: assignment selector UI on each ItemRow, unassigned-item warnings, TipControl, TaxControl, and the calculation engine connecting them. It does NOT include the final per-person summary panel (Phase 4).

</domain>

<decisions>
## Implementation Decisions

### Assignment Selector (AssignmentSelector)

- **D-01:** Trigger component on each ItemRow: Radix Popover containing one shadcn/ui Checkbox per person plus an "Everyone" shortcut. Both components are already installed — no new dependencies.
- **D-02:** Trigger button label: shows `"Assign ▾"` when unassigned. After assignment shows truncated names — `"Bob"` for one, `"Bob, Carol"` for two, `"3 people"` for three or more, `"Everyone"` when all persons selected.
- **D-03:** Mode is always checkboxes — no explicit Single/Shared toggle. Checking 1 person = single assignment; checking multiple = shared subset. Semantics are implicit in the array length, matching the `assignedTo: string[]` type contract already in `src/types/index.ts`.
- **D-04:** "Everyone" button toggles: if all people currently checked → uncheck all (= unassigned). If any person unchecked → check all. This doubles as the "Clear / Unassign" action — no separate Clear button needed.
- **D-05:** Popover closes on click-outside (Radix default behavior).

### Unassigned Item Warning (ASGN-04)

- **D-06:** Warning appears on the ItemRow itself — a visible badge or icon next to the trigger button when `assignedTo.length === 0`. This is per plan 03-02 (ASGN-04 guard).

### ChargesPanel Layout

- **D-07:** TipControl and TaxControl live in a `ChargesPanel` component rendered full-width below the PeoplePanel + ItemsPanel row in `App.tsx`.
- **D-08:** Tip and Tax stack vertically inside ChargesPanel (Tip row on top, Tax row below). No side-by-side columns — avoids layout complexity that Phase 4 would need to undo for mobile anyway.

### TipControl

- **D-09:** Preset buttons: 15%, 18%, 20%, Custom. Split toggle: Equal / Proportional. All inline in one row.
- **D-10:** Clicking "Custom" reveals a text input inline to the right of the preset buttons. The preset buttons remain visible (not replaced). Clicking any preset button deactivates the custom input.

### TaxControl

- **D-11:** Mode toggle: Amount ($) / Percent (%). Value input + Equal/Proportional split toggle, all inline in one row.
- **D-12:** Same custom-input reveal pattern as Tip: text field appears inline; presets remain visible.

### NaN / Invalid Input Guard

- **D-13:** For both custom tip and custom tax: invalid input (non-numeric, negative, blank) shows a red border on the input + a small inline error message: `"Enter a number"`. The store value stays at `0` until a valid number is entered. No NaN propagates to `calculateBreakdowns`.

### Claude's Discretion

- Exact Tailwind classes and shadcn/ui variant choices (ghost, outline, etc.) for buttons and inputs — use the existing patterns from PeoplePanel/ItemsPanel for consistency.
- Whether the split toggle uses `shadcn/ui ToggleGroup` or two `Button` components with active state — researcher/planner decides based on what's installed.
- Proportional divide-by-zero guard implementation in `calculateBreakdowns` (plan 03-04) — guard logic is Claude's call; the requirement is that it doesn't crash.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Type contract
- `src/types/index.ts` — Full `AppState`, `Item`, `ChargeConfig`, `AppActions` type definitions. The `assignedTo: string[]` contract (empty=unassigned, all=shared, subset=partial) is locked here. No magic "shared" string.

### Store
- `src/store/useBillStore.ts` — `assignItem`, `setTip`, `setTax` actions already implemented. New components dispatch to these.

### Existing UI components (reuse patterns from)
- `src/components/ItemsPanel/ItemRow.tsx` — Mount point for AssignmentSelector; follow its layout pattern.
- `src/components/ItemsPanel/ItemsPanel.tsx` — Pattern for panel container.
- `src/components/PeoplePanel/PeoplePanel.tsx` — Pattern for panel container.
- `src/components/ItemsPanel/ItemForm.tsx` — Pattern for controlled input + NaN guard (toCents pattern).

### Math helpers
- `src/lib/calculations.ts` — `toCents`, `fromCents`, `distributeRemainder` (scaffolded in Phase 1). `calculateBreakdowns` integration test is part of plan 03-04.

### Phase requirements
- `.planning/REQUIREMENTS.md` — ASGN-01 through ASGN-04, TIP-01 through TIP-03, TAX-01 through TAX-03 are all in scope for this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn/ui Popover` — already installed (used via Radix); use for AssignmentSelector trigger + panel.
- `shadcn/ui Checkbox` — already installed; one per person inside the AssignmentSelector popover.
- `shadcn/ui Button` — already installed with `ghost`, `outline`, `size="icon-xs"` variants; use for preset tip buttons and split toggles.
- `shadcn/ui Input` — already installed; use for custom tip %, custom tax amount/percent, and tax dollar-amount inputs.
- `fromCents` / `toCents` in `src/lib/calculations.ts` — use for any dollar↔cent conversion in tax amount mode.

### Established Patterns
- Zustand via `useBillStore((s) => s.action)` selector pattern — match existing PeoplePanel/ItemsPanel usage.
- Dollar-to-cent conversion on submit boundary (not in store) — established in ItemForm; repeat for tax amount mode.
- NaN guard: `isNaN(cents) || cents <= 0` pattern from ItemForm — adapt for tip/tax custom inputs.
- Atomic `set()` calls in store — `removePerson` cascade delete established this; `assignItem` already follows it.

### Integration Points
- `src/App.tsx` — needs `<ChargesPanel />` added below the existing `flex gap-6` PeoplePanel+ItemsPanel row.
- `src/store/useBillStore.ts` — `assignItem`, `setTip`, `setTax` are the three dispatch targets for this phase.
- `src/types/index.ts` — no type changes expected; all necessary types are already defined.

</code_context>

<specifics>
## Specific Ideas

- AssignmentSelector trigger label progression: `"Assign ▾"` → `"Bob ▾"` → `"Bob, Carol ▾"` → `"3 people ▾"` → `"Everyone ▾"`. The "3 people" threshold kicks in at 3+.
- "Everyone" as a popover list item (below a separator) acts as a toggle-all. No separate clear button.
- ChargesPanel is full-width below the side-by-side People+Items row, matching the full-width layout philosophy for Phase 4 Summary panel.
- Custom tip reveals input inline to the right: `[15%] [18%] [20%] [Custom ▶] [____%]`. Presets remain clickable to switch back.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-assignment-charges*
*Context gathered: 2026-04-01*
