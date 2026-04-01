---
status: testing
phase: 04-summary-polish
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-04-01T19:00:00Z
updated: 2026-04-01T19:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 4
name: SubtotalsStrip live updates on reassignment
expected: |
  With 2 people and an item assigned to Alice, the strip shows "Alice $10.00". Reassign that item to Bob — the strip immediately updates to show "Bob $10.00" and Alice shows $0.00 (or disappears from the strip).
awaiting: user response

## Tests

### 1. SummaryPanel visible in app
expected: Add at least 2 people and 2 items, assign items to people, and set tip/tax. A Summary table should appear below the ChargesPanel showing columns: Name | Subtotal | Tip | Tax | Total. Each person should have their own row with dollar amounts.
result: pass

### 2. SummaryPanel per-person amounts are correct
expected: With 2 people (Alice, Bob), Alice assigned a $10.00 item, Bob assigned a $20.00 item, and 10% tip + 10% tax on the full bill: Alice's row shows Subtotal $10.00, Tip $1.50, Tax $1.50, Total $13.00. Bob's row shows Subtotal $20.00, Tip $3.00, Tax $3.00, Total $26.00. (Amounts are proportional to each person's share.)
result: pass

### 3. SubtotalsStrip visible above ChargesPanel
expected: With at least 1 person and 1 assigned item, a strip should appear between the Items panel and ChargesPanel showing each person's name and their item subtotal (e.g., "Alice $10.00"). This strip is separate from the SummaryPanel at the bottom.
result: pass

### 4. SubtotalsStrip live updates on reassignment
expected: With 2 people and an item assigned to Alice, the strip shows "Alice $10.00". Reassign that item to Bob — the strip immediately updates to show "Bob $10.00" and Alice shows $0.00 (or disappears from the strip).
result: [pending]

### 5. SubtotalsStrip hidden when no people
expected: Remove all people from the bill (or open a fresh page with no people added). The SubtotalsStrip row should not be visible — no empty strip/placeholder appears.
result: [pending]

### 6. Mobile layout stacks vertically
expected: Resize browser to 375px wide (or use DevTools mobile emulation). The People panel and Items panel should stack vertically (one on top of the other) rather than sitting side by side. On desktop (640px+), they return to a side-by-side layout.
result: [pending]

### 7. Touch targets on ChargesPanel buttons
expected: On the TipControl, the preset tip percentage buttons (e.g., 15%, 18%, 20%) should be at least 44px tall — easy to tap on a mobile screen. Same for TaxControl mode-toggle and input buttons. They should feel comfortably tappable, not tiny.
result: [pending]

## Summary

total: 7
passed: 3
issues: 0
pending: 4
skipped: 0

## Gaps

[none yet]
