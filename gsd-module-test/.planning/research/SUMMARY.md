# Project Research Summary

**Project:** Expense Splitter
**Domain:** Single-page bill-splitting calculator (no backend)
**Researched:** 2026-03-31
**Confidence:** HIGH overall — core domain is well-understood; stack choices are settled

## Executive Summary

This is a client-only SPA for splitting restaurant bills. The domain is well-understood and the implementation surface is bounded: people, items, assignments, tip, tax, and a final summary. There is no backend, no auth, and no persistence in v1. Expert implementations of this category use a strict separation between canonical state (people, items, charges) and derived state (per-person totals), with all math living in pure functions outside of React components.

The recommended approach is React 18 + Vite + Tailwind CSS (pre-decided) with Zustand for state management, integer-cent arithmetic for all money math, and shadcn/ui for accessible form primitives. The architecture uses a single cohesive state model with pure calculation functions in a dedicated `lib/` module — components dispatch actions and render derived data, they do not contain business logic. Testing with Vitest + React Testing Library is the natural fit for a Vite project.

The dominant risk in this domain is financial math correctness: floating-point arithmetic produces penny errors that users notice immediately. The secondary risk is silent data bugs — unassigned items that disappear from totals and stale person-ID references on items after person deletion. Both are preventable with well-known, concrete techniques. Build the integer-cent arithmetic helpers and the unassigned-item guard before writing any calculation logic.

---

## Key Findings

### Recommended Stack

The pre-decided stack (React 18, Vite 5, Tailwind CSS 3) is the correct foundation. The additional library choices are low-controversy: Zustand fits the single-cohesive-store model of a bill app better than Redux (too heavy) or Jotai (atoms suit granular reactivity, not a record). Financial math does not require a library — 30 lines of integer-cent helpers cover 100% of the need. shadcn/ui is the right component choice because its components are Tailwind-native, Radix-backed for accessibility, and live in your codebase with no version conflicts.

**Core technologies:**
- **Zustand ~5.x**: App-wide state (people, items, tip, tax) — minimal boilerplate, no provider wrap, flat store API suits a single cohesive domain model
- **Integer-cent arithmetic (custom helpers)**: All money math — avoids IEEE 754 floating-point penny errors with zero external dependency
- **shadcn/ui (CLI, no npm package)**: Input, Button, Select, Dialog, Badge primitives — Tailwind-native, Radix-backed accessibility, components are owned by the repo
- **Vitest ~2.x + React Testing Library ~16.x**: Tests — Vite-native runner, no duplicate transform config, industry-standard React component testing

### Expected Features

The full feature set aligns with the PROJECT.md requirements. Shared-item assignment (split among a subset of people, not just all or one) is the most nuanced logic and must be built at the same time as basic item assignment. Tip and tax each need two modes: percentage vs. fixed amount input, and equal vs. proportional split.

**Must have (table stakes):**
- Add/remove people by name — unblocks all downstream logic
- Add/remove items with prices — core data entry; price input must strip $ and commas
- Assign items to one person or a subset (shared) — the primary purpose of the app
- Unassigned item warning — without this, items silently disappear from totals
- Tip: preset percentages (15/18/20) + custom input, equal or proportional split
- Tax: amount or percentage input, equal or proportional split
- Final per-person breakdown — the entire output of the app
- Rounding-correct totals (Largest Remainder Method) — users will add up the numbers

**Should have (differentiators):**
- Running subtotal per person updating live as items are assigned
- Quick-assign "everyone" button per item for shared items
- In-place item editing (name and price) without losing assignment state
- Subtotal visibility before tip/tax is applied
- Per-item assignment summary ("Assigned to: Sarah, Mike") for visual verification

**Defer (v2+):**
- Receipt photo OCR — ML pipeline or third-party API, high complexity, low payoff
- Venmo / payment deep links — requires OAuth app review, fragile across platforms
- Save / share / history — requires persistence strategy decision
- Debt simplification — one-meal use case does not need A-owes-B-owes-C optimization

### Architecture Approach

The recommended architecture is a single-page React app with all canonical state in a top-level `useReducer` + Context pair. A `BillStateContext` and a separate `BillDispatchContext` prevent re-renders in components that only write. All calculation logic lives in `src/lib/calculations.ts` as pure functions with no React imports — fully unit-testable. Components are presentational: they dispatch actions and render derived data. Derived totals (per-person breakdowns) are never stored in state — they are computed from canonical state on every render and wrapped in `useMemo`.

**Major components:**
1. **PeoplePanel** — manages the person list; PersonForm dispatches ADD_PERSON, PersonTag dispatches REMOVE_PERSON (with cascade item cleanup)
2. **ItemsPanel** — manages the item list; ItemForm dispatches ADD_ITEM (price converted to cents on submit), ItemRow + AssignmentSelector handle per-item assignment
3. **ChargesPanel** — TipControl and TaxControl manage tip/tax config (percent vs. amount, equal vs. proportional)
4. **SummaryPanel** — reads full state, calls `calculateBreakdowns(state)` via useMemo, renders one PersonSummaryRow per person
5. **src/lib/calculations.ts** — pure functions: `calculateBreakdowns`, `distributeProportionally`, cent-to-display formatting

### Critical Pitfalls

1. **Floating-point penny errors** — Store all money as integer cents from the moment of input. Convert to display strings only at render. Never do arithmetic on dollar floats. Write a test that sums all person totals and asserts equality with the bill total.

2. **Proportional split divides by zero** — When all items are removed (or unassigned) and tip/tax is in proportional mode, `billSubtotal === 0` produces `NaN` or `Infinity` throughout the summary. Guard every proportional calculation: if subtotal is zero, fall back to equal split.

3. **Unassigned items silently drop from totals** — Items with no assignee are simply absent from person subtotals. The bill total and person totals diverge with no error. Build the unassigned-item warning before the summary step, not as an afterthought. Assert `sum(personTotals) === subtotal + tip + tax` in the summary render.

4. **Stale person IDs on items after deletion** — Items store assignee IDs. When a person is deleted, their ID must be simultaneously removed from all item assignments in the same dispatch action. A separate cleanup step will be forgotten.

5. **NaN propagation from unvalidated tip/tax inputs** — Custom tip/tax text inputs silently produce `NaN` for empty strings or non-numeric input. Clamp and validate at parse time; disable the summary or show an error until all inputs are valid.

---

## Implications for Roadmap

Based on research, the feature dependencies are clear: people must exist before items can be assigned, items must be assigned before per-person subtotals can be computed, and subtotals must be correct before tip/tax proportional splits can be applied. This drives a natural 4-phase structure.

### Phase 1: Foundation — State, Data Model, and Math Core

**Rationale:** The integer-cent arithmetic helpers and the state shape are load-bearing for every subsequent phase. Building these first (with tests) prevents rework. Getting the data model wrong (floats instead of cents, stored derived state) requires rewriting calculations in every later phase.

**Delivers:** Zustand store with correct AppState shape (people, items, tip, tax all in one store), integer-cent helper functions with full test coverage, shadcn/ui scaffolded, project structure in place.

**Addresses:** Rounding correctness requirement; correct data model prerequisite for all features

**Avoids:** Pitfall 1 (float arithmetic), Anti-Pattern 2 (float money storage), Anti-Pattern 1 (stored derived state)

### Phase 2: People and Items — Core Data Entry

**Rationale:** People management is a prerequisite for item assignment. Both panels are low-complexity UI. Building them together completes the data entry surface before any calculation logic is needed.

**Delivers:** PeoplePanel (add/remove people by name), ItemsPanel (add/remove items with prices, in-place editing), unassigned item warning, person-deletion cascade cleanup.

**Addresses:** Add/remove people, add/remove items, unassigned item warning (table stakes)

**Avoids:** Pitfall 3 (unassigned items silently dropped), Pitfall 5 (stale assignments after person deletion), Pitfall 11 (price input with $-signs and commas)

### Phase 3: Assignment and Charges — The Core Logic

**Rationale:** Item assignment (including shared-item subset logic) and tip/tax configuration are the most complex features. Both are data entry that feeds `calculateBreakdowns`. Building them together keeps the calculation function as the integration point.

**Delivers:** AssignmentSelector with single-person and subset-shared modes, quick-assign "everyone" button, TipControl (presets + custom, equal/proportional), TaxControl (amount/percent, equal/proportional), input validation with NaN guard.

**Addresses:** Item assignment, shared item logic, tip configuration, tax configuration (all table stakes)

**Avoids:** Pitfall 2 (divide-by-zero proportional), Pitfall 6 (invalid tip/tax input), Pitfall 7 (shared item rounding), Pitfall 10 (confusing assignment UX)

### Phase 4: Summary and Polish — Output and UX

**Rationale:** The summary is the final integration point — it calls `calculateBreakdowns` and renders results. UX polish (running subtotals, sticky summary panel, mobile layout) belongs here after correctness is confirmed.

**Delivers:** SummaryPanel with per-person breakdown (subtotal + tip share + tax share + total), balance assertion (sum equals bill total), running live subtotals, mobile-first responsive layout, read-only final summary view.

**Addresses:** Final per-person breakdown (table stakes), running subtotals, subtotal visibility (differentiators)

**Avoids:** Pitfall 4 (React state mutation), Pitfall 8 (single-person edge case), Pitfall 9 (empty bill edge case)

### Phase Ordering Rationale

- Math helpers come first because every calculation in every later phase depends on them. A float bug found in Phase 4 requires touching Phase 1 code.
- People/items before assignment because AssignmentSelector reads from the people list — the component cannot be built without people data existing.
- Assignment and charges together because `calculateBreakdowns` consumes both. Implementing charges before assignment (or vice versa) means the calculation function cannot be fully tested until both are done.
- Summary last because it is the integration layer — correctness of Phase 1–3 is a prerequisite.

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1:** Zustand store setup, integer-cent helpers, Vitest config — all well-documented, established patterns
- **Phase 2:** React form components, controlled inputs, array state management — standard React
- **Phase 3:** Radix UI multi-select / checkbox patterns are well-documented in shadcn/ui docs
- **Phase 4:** useMemo, context reads, mobile Tailwind layout — standard patterns

No phase in this project requires deeper async research. The domain is bounded and the patterns are well-established.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Zustand, Vitest, shadcn/ui choices are well-established. Exact current versions need npm verification — no live web access during research. |
| Features | MEDIUM | Based on training knowledge of Splitwise, Tricount, Tab. No live app audit. Core feature set is HIGH confidence; UX pattern details are MEDIUM. |
| Architecture | HIGH | React official docs, established useReducer + Context patterns, integer-cent money storage — all stable and well-sourced. |
| Pitfalls | HIGH | IEEE 754 float behavior, React immutable state requirements, and divide-by-zero edge cases are language/framework constants. Not subject to ecosystem drift. |

**Overall confidence:** HIGH for approach and architecture; MEDIUM for exact library versions.

### Gaps to Address

- **Library versions:** Zustand ~5.x, Vitest ~2.x, shadcn/ui CLI syntax (`npx shadcn@latest`) — verify current versions on npm before installing. The CLI was renamed in 2024 and may have changed again.
- **shadcn/ui multi-select component:** The AssignmentSelector needs a checkbox-list-per-item UI. shadcn/ui does not ship a multi-select checkbox list as a single component — it will need to be composed from Checkbox + Popover or built as a custom component from Radix primitives. Assess complexity when building Phase 3.
- **Proportional split UX:** Whether tip and tax split method (equal vs. proportional) are configured independently per charge or share a global setting is not specified in PROJECT.md. FEATURES.md recommends independent configuration. Confirm this with a product decision before building TipControl / TaxControl.

---

## Sources

### Primary (HIGH confidence)
- React official docs (managing state, choosing state structure, thinking in React) — architecture patterns
- IEEE 754 standard / MDN Web Docs JavaScript number type — float arithmetic pitfalls
- "Last person gets remainder" distribution — standard technique in financial software

### Secondary (MEDIUM confidence)
- Training knowledge of Splitwise, Tricount, Tab, Divvy, PayPal Split (circa 2024) — feature landscape
- Zustand docs: https://docs.pmnd.rs/zustand/getting-started/introduction
- shadcn/ui docs: https://ui.shadcn.com/docs/installation/vite
- Vitest docs: https://vitest.dev/guide/

### Tertiary (verify before use)
- Exact npm versions for Zustand, Vitest, @testing-library/* — confirm at https://www.npmjs.com before installing
- shadcn/ui CLI command (`npx shadcn@latest`) — verify CLI name has not changed since training cutoff

---
*Research completed: 2026-03-31*
*Ready for roadmap: yes*
