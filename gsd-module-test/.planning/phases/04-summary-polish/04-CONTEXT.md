# Phase 4: Summary & Polish - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers: a running subtotals strip (above ChargesPanel), a SummaryPanel with per-person totals table, Largest Remainder rounding in `distributeRemainder`, and mobile responsive layout. It does NOT add per-item line breakdowns inside the summary or any new capabilities beyond what SUMM-01/02/03 require.

</domain>

<decisions>
## Implementation Decisions

### PersonSummaryRow Detail (SUMM-01)

- **D-01:** Each row shows exactly: Name | Subtotal | Tip share | Tax share | Grand total. No per-item breakdown — clean totals only. Matches ROADMAP spec exactly.

### Running Subtotals (SUMM-03)

- **D-02:** Running subtotals live in a **dedicated strip between ItemsPanel and ChargesPanel** — not inside SummaryPanel. The strip shows each person's item subtotal updating live as items are assigned/reassigned. This satisfies the ROADMAP requirement "visible before the tip/tax section" literally.
- **D-03:** Strip layout: inline labels per person, e.g., `Alice: $12.00  Bob: $18.50`. Simple Tailwind flex row, full-width, same width rhythm as ChargesPanel below it.

### SummaryPanel Layout (SUMM-01, SUMM-02)

- **D-04:** SummaryPanel uses a **table layout** (not card-per-person). Columns: Name | Subtotal | Tip | Tax | Total. One row per person. Plain HTML table or Tailwind grid — no new shadcn/ui component needed.
- **D-05:** A footer row or assertion note confirms `sum(totals) === billTotal` (balance assertion). If violated, throw an error (per ROADMAP plan 04-01).

### Mobile Stacking Order (375px)

- **D-06:** Single-column vertical stack in **build-up order**: People → Items → Subtotals strip → Charges → Summary. User builds the bill top-to-bottom and sees results at the bottom. No panel reordering on mobile vs desktop.
- **D-07:** Desktop layout stays the same as Phase 3: People + Items side-by-side (flex row), then Subtotals strip full-width, then ChargesPanel full-width, then SummaryPanel full-width. On mobile (≤375px) the side-by-side row collapses to a single column.

### Claude's Discretion

- Exact Tailwind classes for the subtotals strip (padding, text size, colors) — use existing panel styles for consistency.
- Whether the balance assertion in SummaryPanel is a thrown Error, a console.error, or a visible UI indicator — plan 04-01 says "throws if violated"; Claude follows that.
- Touch target sizing on mobile — use `min-h-[44px]` on interactive elements as the standard; Claude decides exact application.
- Empty state inside the subtotals strip when 0 people are added — Claude decides (hide strip or show placeholder).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Types and state
- `src/types/index.ts` — Full `AppState`, `Item`, `ChargeConfig`, `AppActions` type definitions. `assignedTo: string[]` contract still in effect.
- `src/store/useBillStore.ts` — All existing actions; no new store actions expected for this phase.

### Math helpers
- `src/lib/calculations.ts` — `distributeRemainder` (needs Largest Remainder implementation), `toCents`, `fromCents`, `calculateBreakdowns` (already implemented in plan 03-04).

### Existing UI components (reuse patterns from)
- `src/components/ChargesPanel/ChargesPanel.tsx` — Full-width panel pattern; SummaryPanel and subtotals strip should match its width/margin rhythm.
- `src/components/ItemsPanel/ItemsPanel.tsx` — Panel container pattern.
- `src/components/PeoplePanel/PeoplePanel.tsx` — Panel container pattern.
- `src/App.tsx` — Current layout root; subtotals strip and SummaryPanel get added here after ChargesPanel.

### Phase requirements
- `.planning/REQUIREMENTS.md` — SUMM-01, SUMM-02, SUMM-03 are all in scope for this phase.

### Phase plans (roadmap spec)
- `.planning/ROADMAP.md` — Phase 4 plan breakdown: 04-01 SummaryPanel, 04-02 Largest Remainder + running subtotals, 04-03 Mobile polish + edge cases.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `shadcn/ui Button`, `Input`, `Checkbox`, `Popover` — already installed; no new installs needed.
- `calculateBreakdowns` in `src/lib/calculations.ts` — already returns per-person breakdown; SummaryPanel drives directly off this via `useMemo`.
- `distributeRemainder` in `src/lib/calculations.ts` — scaffolded in Phase 1; needs Largest Remainder implementation in plan 04-02.
- `fromCents` — use for all dollar formatting in SummaryPanel and subtotals strip.

### Established Patterns
- Zustand via `useBillStore((s) => s.field)` selector pattern — SummaryPanel reads `people`, `items`, `tip`, `tax` from store.
- `useMemo` for derived calculations — wrap `calculateBreakdowns` call to avoid recomputing on every render.
- Full-width panels below the side-by-side row — ChargesPanel set this pattern; subtotals strip and SummaryPanel follow it.
- Dollar-to-cent boundary conversion established in ItemForm; reverse (`fromCents`) used for display.

### Integration Points
- `src/App.tsx` — Add `<SubtotalsStrip />` between the `flex gap-6` row and `<ChargesPanel />`, then add `<SummaryPanel />` after `<ChargesPanel />`.
- `src/lib/calculations.ts` — Plan 04-02 upgrades `distributeRemainder` to Largest Remainder; this affects all callers (tip + tax distribution already uses it).

</code_context>

<specifics>
## Specific Ideas

- Subtotals strip mockup: full-width bar with `Alice: $12.00  Bob: $18.50` in a flex row, matching the width of ChargesPanel below it.
- Desktop layout: `[People] [Items]` (flex row) → subtotals strip (full-width) → ChargesPanel (full-width) → SummaryPanel (full-width).
- Mobile layout: same panels stacked vertically in that same build-up order, People+Items collapse to single column.
- SummaryPanel table column order: Name | Subtotal | Tip | Tax | Total — left to right matches the additive computation order.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-summary-polish*
*Context gathered: 2026-04-01*
