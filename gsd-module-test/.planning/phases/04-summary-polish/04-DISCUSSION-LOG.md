# Phase 4: Summary & Polish — Discussion Log

**Date:** 2026-04-01
**Workflow:** discuss-phase

---

## Areas Selected

User selected all four gray areas: PersonSummaryRow detail, Running subtotal placement, Summary panel layout, Mobile stacking order.

---

## Q1: PersonSummaryRow Detail

**Question:** What should each PersonSummaryRow show?

| Option | Description |
|--------|-------------|
| Totals only *(selected)* | Name + item subtotal + tip share + tax share + grand total. Clean, matches ROADMAP spec. |
| Totals + item list | Collapsible per-item breakdown below totals row. |
| You decide | Claude picks simpler approach. |

**Selected:** Totals only

---

## Q2: Running Subtotal Placement

**Question:** Running subtotals should be 'visible before the tip/tax section' per ROADMAP. Where should they live?

| Option | Description |
|--------|-------------|
| Separate band above ChargesPanel *(selected)* | Compact strip between ItemsPanel and ChargesPanel. Updates live. Matches spec literally. |
| Inside SummaryPanel | Subtotal column in summary IS the running subtotal. Simpler but technically below ChargesPanel. |

**Selected:** Separate band above ChargesPanel

---

## Q3: Summary Panel Layout

**Question:** How should the SummaryPanel present per-person totals?

| Option | Description |
|--------|-------------|
| Table rows *(selected)* | Name \| Subtotal \| Tip \| Tax \| Total. One row per person. No new components. |
| Card per person | shadcn/ui Card per person. Reuses existing Card component. |
| You decide | Claude picks most consistent style. |

**Selected:** Table rows

---

## Q4: Mobile Stacking Order

**Question:** On mobile (375px), what should the vertical stacking order be?

| Option | Description |
|--------|-------------|
| Build-up order *(selected)* | People → Items → Subtotals → Charges → Summary. Natural workflow top to bottom. |
| Summary first | Summary at top, then People → Items → Subtotals → Charges. |

**Selected:** Build-up order

---

*Log generated: 2026-04-01*
