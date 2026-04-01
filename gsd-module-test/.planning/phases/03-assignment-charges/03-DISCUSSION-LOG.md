# Phase 3: Assignment & Charges - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Areas discussed:** Assignment selector UX, Single/shared mode switching, Tip & Tax placement, Custom tip/tax input behavior

---

## Area 1: Assignment Selector UX

**Q: How should the assignment UI look on each item row?**

Options presented:
- Popover with checkboxes ← **Selected**
- Native `<select>` dropdown
- Inline avatar/name chips

Notes: shadcn/ui Popover + Checkbox already installed. Native select can't express subset sharing. Chips get crowded with 5+ people.

---

**Q: What should the trigger button show before assignment?**

Options presented:
- "Assign" label with chevron ← **Selected**
- Warning icon + "Unassigned"
- Person silhouette icon only

---

**Q: After assignment, what does the trigger show?**

Options presented:
- Names truncated ("Bob", "Bob, Carol", "3 people", "Everyone") ← **Selected**
- Always show "N selected"

---

## Area 2: Single vs Shared Mode Switching

**Q: Checkboxes always, or explicit mode toggle?**

Options presented:
- Always checkboxes — mode is implicit in array length ← **Selected**
- Explicit Single/Shared segmented control at top of popover

Notes: Type contract already uses `string[]` with no magic "shared" string. Checkboxes naturally express 1, subset, or all.

---

**Q: What does "Everyone" do, and how does unassign work?**

Options presented:
- Everyone toggles all on/off; toggling to 0 = unassigned ← **Selected**
- Everyone checks all; separate Clear button
- Everyone checks all; closing with 0 checked = unassigned (implicit)

---

## Area 3: Tip & Tax Panel Placement

**Q: Where do TipControl and TaxControl live?**

Options presented:
- ChargesPanel below the two data panels, full width ← **Selected**
- Accordion / collapsible sections
- Side panel / third column

Notes: Accordion needs shadcn/ui Accordion (not installed). Third column would need to be re-stacked for mobile in Phase 4 anyway.

---

**Q: Tip and Tax inside ChargesPanel — side-by-side or stacked?**

Options presented:
- Stack vertically (Tip row, then Tax row) ← **Selected**
- Side-by-side columns

---

## Area 4: Custom Tip/Tax Input Behavior

**Q: When user clicks "custom" for tip, how does the input appear?**

Options presented:
- Inline text field reveals next to preset buttons (presets stay visible) ← **Selected**
- Preset buttons collapse, standalone input replaces them
- Popover / modal for custom value

---

**Q: NaN/invalid-input behavior?**

Options presented:
- Red border + inline error text "Enter a number", store value stays 0 ← **Selected**
- Silent clamp to 0
- Disable "Add to bill" until all inputs valid

Notes: Phase 4 Summary doesn't exist yet — global validation gate premature. Silent clamp could confuse users. Inline error is the established pattern in web forms.
