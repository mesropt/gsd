# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

---

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-01
**Phases:** 4 | **Plans:** 13 | **Commits:** 77

### What Was Built
- Vite 8 + React 19 + TypeScript + Tailwind v4 + Zustand scaffold with integer-cent math helpers
- People panel (add/remove + cascade-clear) and Items panel (dollar-format input, cent storage)
- Assignment selector (single/subset/everyone per item), unassigned item warnings
- Charges panel: tip (15/18/20/custom, equal/proportional) + tax ($/%, equal/proportional), NaN guards
- `calculateBreakdowns` pure function with Largest Remainder Method and always-distribute pattern
- SubtotalsStrip (live per-person subtotals) + SummaryPanel (Name|Subtotal|Tip|Tax|Total) with penny-exact balance assertion
- Mobile-first responsive layout (flex-col sm:flex-row at 640px), 44px touch targets
- 105 tests across 10 files — all green

### What Worked
- **TDD for pure functions** — `calculateBreakdowns` and `calculateDetailedBreakdowns` built test-first; balance assertion catches rounding bugs at runtime
- **Wave-based parallel execution** — Wave 1 plans (04-01, 04-02) ran in parallel worktrees; 8-10 minute wall-clock for two plans simultaneously
- **Integer-cent arithmetic without a library** — 30 lines covered all rounding needs; no floating-point surprises
- **shadcn/ui primitive composition** — Radix Popover + Checkbox for AssignmentSelector worked exactly as planned; no custom CSS needed
- **Zustand flat store** — Store stayed simple throughout all 4 phases; no selector complexity

### What Was Inefficient
- **Parallel worktree merge conflicts** — Wave 1 plans both modified planning files (STATE.md, ROADMAP.md, REQUIREMENTS.md), requiring manual conflict resolution after merge. Could be mitigated by having parallel agents skip planning file updates entirely, letting the orchestrator handle them post-merge.
- **Requirement checkbox drift** — 9 requirements remained unchecked at milestone completion despite the work being done. Phase executors updated some requirements but not all consistently.
- **ROADMAP progress table drift** — Progress table counts fell behind actual state (showed 1/3, 3/4 at completion).

### Patterns Established
- `vitest/config defineConfig` (not `vite/config`) required for Vitest 4 TypeScript test block support
- Always-distribute pattern: `distributeRemainder(0, N)` returns zeros — no zero-guard needed around tip/tax
- Balance assertion as runtime guard in `calculateDetailedBreakdowns` — throws immediately on penny error, not just in tests
- `sm:` breakpoint (640px) for mobile/desktop flex-col/flex-row split — covers all phones

### Key Lessons
1. **Parallel wave conflicts are predictable** — Any two plans touching `.planning/` files will conflict on merge. Either serialize planning-file writes to the orchestrator, or have agents skip STATE/ROADMAP updates and let the orchestrator batch them.
2. **Requirement tracking needs a phase-completion hook** — At phase complete, automatically check all phase requirement IDs against REQUIREMENTS.md and mark them complete. Manual updates drift.
3. **Visual checkpoint in final phase is high-value** — The Phase 4 human-verify checkpoint caught the app working end-to-end before archiving. Worth keeping in final phases.

### Cost Observations
- Model mix: sonnet for execution, opus for planning
- 4 phases across 1 session day
- Notable: parallel wave execution (2 agents simultaneously) roughly halved wall-clock time for Wave 1

---

## Cross-Milestone Trends

| Milestone | Phases | Plans | Tests | LOC |
|-----------|--------|-------|-------|-----|
| v1.0 MVP | 4 | 13 | 105 | 2,302 |
