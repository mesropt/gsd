# Domain Pitfalls

**Domain:** Expense splitter web app (React + Vite, no backend)
**Researched:** 2026-03-31
**Confidence:** HIGH — all four focus areas are well-established, stable problem domains

---

## Critical Pitfalls

Mistakes that cause incorrect totals, silent data corruption, or rewrites.

---

### Pitfall 1: Floating Point Arithmetic Produces Penny Errors

**What goes wrong:** JavaScript IEEE 754 floating point cannot represent most decimal fractions exactly. `0.1 + 0.2 === 0.30000000000000004`. In a bill splitter, this compounds: item prices accumulate, tip and tax multipliers are applied, then totals are distributed across N people. The result is that person totals may not sum to the bill total, and individual amounts show as `$12.330000000001`.

**Why it happens:** Every arithmetic operation on floating point numbers introduces a tiny representational error. Multiplication and division (used for tip percentages and proportional splits) amplify these errors. Displaying raw floats exposes the garbage digits.

**Consequences:**
- Person totals do not sum to bill total (penny gap or surplus)
- Displayed amounts look broken (`$34.999999998`)
- Proportional split logic distributes fractional cents unevenly and silently

**Prevention — use integer cents internally:**
Represent all monetary values as integers in cents (e.g., `$12.50` → `1250`). Do all arithmetic in cents. Convert to dollars only at display time.

```typescript
// Store prices as cents (integer)
const priceInCents = Math.round(parseFloat(inputValue) * 100);

// All math in cents
const tipCents = Math.round(subtotalCents * tipRate);

// Display only at render
const display = (cents: number) => `$${(cents / 100).toFixed(2)}`;
```

**The "last person gets the remainder" rule for proportional splits:**
When distributing N cents across N people proportionally, rounding each share independently produces a total that may be off by 1–2 cents. Fix this by computing N-1 shares by rounding and assigning the remainder to the last person:

```typescript
function distributeProportionally(totalCents: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const shares = weights.map(w => Math.floor((w / totalWeight) * totalCents));
  const distributed = shares.reduce((a, b) => a + b, 0);
  shares[shares.length - 1] += totalCents - distributed; // remainder goes to last person
  return shares;
}
```

**Detection:** Write a test: sum all person totals and assert they equal subtotal + tip + tax (all in cents). A mismatch means rounding is broken.

---

### Pitfall 2: Proportional Split Divides by Zero When Subtotal Is Zero

**What goes wrong:** If tip or tax is set to "proportional" mode but all items have been removed (or all items are unassigned), the proportional weight denominator is 0. `totalCents / 0 = Infinity` or `NaN`, which silently corrupts the entire calculation and renders `$NaN` in the summary.

**Why it happens:** The proportional split formula `share = (personSubtotal / billSubtotal) * tipAmount` assumes `billSubtotal > 0`. This assumption is violated in several legal UI states.

**Consequences:** Summary shows `$NaN` or `$Infinity` for every person. No error is thrown — the UI just renders garbage.

**Prevention:** Always guard the proportional path:
```typescript
if (billSubtotalCents === 0) {
  // Fall back to equal split
  return people.map(() => Math.round(totalCents / people.length));
}
```

**Detection:** Warning sign is the summary showing `NaN` after removing all items while tip/tax mode is "proportional".

---

### Pitfall 3: Unassigned Items Are Silently Dropped

**What goes wrong:** Items that have no person assigned (and are not marked "shared") contribute to the receipt total but are not included in any person's subtotal. The sum of all person totals is therefore less than the bill total. There is no error — the discrepancy is silent.

**Why it happens:** The summary calculation loops over people and sums their assigned items. Items with no assignment simply do not appear in anyone's loop.

**Consequences:** The bill total displayed at the top (sum of all item prices) does not match the sum of what everyone owes. Friends end up underpaying the restaurant.

**Prevention:** Track "unassigned subtotal" explicitly. Either:
- Block advancing to the summary step if any item is unassigned (preferred for v1)
- Display an "unassigned: $X.XX" line in the summary as a warning
- Auto-assign unassigned items to "shared" pool

**Detection:** In the summary step, assert: `sum(personTotals) === billTotal + tip + tax`. If this fails, surface a clear UI warning before the user sees results.

---

## Moderate Pitfalls

---

### Pitfall 4: React State Mutation Produces Stale or Invisible Updates

**What goes wrong:** Items and people are stored as arrays of objects. If state is mutated in place (e.g., `items[i].price = newPrice` followed by `setItems(items)`), React's reference equality check does not detect a change and the component does not re-render — or renders with stale data.

**Why it happens:** `useState` triggers a re-render only when the new state value is a different reference than the old one. Mutating an object and passing back the same array reference looks like "no change" to React.

**Prevention:** Always produce new references when updating nested state:
```typescript
// WRONG — mutates in place
const handlePriceChange = (id: string, newPrice: number) => {
  const item = items.find(i => i.id === id);
  item!.price = newPrice; // mutation
  setItems(items);        // same reference — React ignores this
};

// CORRECT — new array, new object
const handlePriceChange = (id: string, newPrice: number) => {
  setItems(prev => prev.map(item =>
    item.id === id ? { ...item, price: newPrice } : item
  ));
};
```

**Detection:** A price or name edit appears to do nothing on screen. Adding a `console.log` inside the render confirms the component did not re-render despite state being "set".

---

### Pitfall 5: Assignment State Becomes Stale After Person Deletion

**What goes wrong:** Items store their assigned person as a string ID (or name). When a person is deleted from the people list, their ID is removed from `people[]` but the assignment reference on each item is not cleaned up. The deleted person's name may still appear in the summary, or the item silently becomes unassigned depending on how the summary code resolves dangling IDs.

**Why it happens:** The item and people arrays are managed independently. Deletion of a person requires a cascade update to all items — this is easy to forget.

**Prevention:** In the "remove person" handler, simultaneously clear all item assignments that reference the deleted person ID:
```typescript
const removePerson = (personId: string) => {
  setPeople(prev => prev.filter(p => p.id !== personId));
  setItems(prev => prev.map(item => ({
    ...item,
    assignedTo: item.assignedTo === personId ? null : item.assignedTo,
  })));
};
```

**Detection:** Delete a person who has items assigned. Check if the item appears in any person's total in the summary, and whether the grand total still balances.

---

### Pitfall 6: Tip/Tax Percentage Input Accepts Invalid Values Silently

**What goes wrong:** A "custom tip" text input accepts any string. If the user types `""`, `"abc"`, or `"200"`, `parseFloat()` returns `NaN`, `NaN`, or `2.0` respectively. The calculation proceeds with `NaN * subtotal = NaN` or a 200% tip without any validation feedback.

**Prevention:**
- Parse and validate on every change: clamp to `[0, 100]`, default to `0` if NaN
- Show a red border or inline error for out-of-range values
- Disable the "Calculate" or summary button until all inputs are valid

---

### Pitfall 7: "Shared" Item Split Has the Same Rounding Problem as Proportional Tip

**What goes wrong:** A shared appetizer costing $13.00 split among 3 people = $4.333... per person. If you round each to $4.33, the total is $12.99 — one cent short. Multiplied across several shared items, the error accumulates.

**Prevention:** Use the same "remainder to last person" approach for shared item distribution (see Pitfall 1). Alternatively, track shared item remainders in a pool and assign them cent-by-cent to people in round-robin order. The cent-pool approach is more equitable but more complex — for v1 the "last person gets remainder" rule is sufficient.

---

## Minor Pitfalls

---

### Pitfall 8: Single-Person Edge Case

**What goes wrong:** With one person, "equal split" and "proportional split" should both assign 100% of everything to that person. Some implementations fail when `people.length === 1` if they index into a `people[1]` or assume a minimum count.

**Prevention:** Test explicitly with one person. The result should be: person owes subtotal + full tip + full tax.

---

### Pitfall 9: Empty Bill Edge Case

**What goes wrong:** With zero items added, the summary should show $0.00 for everyone (or prompt the user to add items). Some implementations render `NaN` or crash when the items array is empty and they try to compute a subtotal.

**Prevention:** Guard the summary calculation: if `items.length === 0`, short-circuit and display a prompt rather than computing.

---

### Pitfall 10: Confusing Item Assignment UX Causes Wrong Assignments

**What goes wrong:** If the item assignment UI is a text field or a multi-select that is hard to operate, users assign items to the wrong person without realizing it. The math is then correct for the wrong inputs — the bug is invisible and the app is blamed.

**Why it happens:** Multi-person assignment (for shared items) is inherently harder to design than single-person assignment. A checkbox list per item is clear but takes vertical space. A dropdown only allows one person.

**Prevention:**
- Use a checkbox list per item: each person's name with a checkbox. Checked = this person shares this item.
- Distinguish "assigned to one person" vs "shared among checked people" visually — not just in logic.
- Show an assignment summary inline: "Assigned to: Sarah, Mike" under each item so users can verify.
- Highlight unassigned items in a warning color before proceeding to summary.

---

### Pitfall 11: Price Input Accepts Commas or Currency Symbols

**What goes wrong:** Users copy prices from a photo or type `$12.50` or `12,50` (European locale). `parseFloat("$12.50")` returns `NaN`. `parseFloat("12,50")` returns `12` (truncates at comma).

**Prevention:** Strip non-numeric characters before parsing:
```typescript
const parseCurrency = (raw: string): number => {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
};
```

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|----------------|------------|
| Core data model setup | Storing prices as floats from the start | Define cent-integer representation before writing any arithmetic |
| Item assignment UI | Unassigned items silently missing from totals | Build unassigned-item guard into summary step, not as an afterthought |
| Tip/tax calculation | Proportional divide-by-zero | Add zero-subtotal guard before implementing proportional mode |
| Final summary | Person totals not summing to bill total | Write a balance assertion as part of the summary render, not just tests |
| Person deletion | Stale item assignments | Implement cascade delete handler at the same time as person removal |
| Custom tip input | NaN propagation through all calculations | Validate and clamp all numeric inputs at parse time |

---

## Sources

- Floating point behavior: IEEE 754 standard; well-documented in MDN Web Docs (JavaScript number type) — HIGH confidence
- "Last person gets remainder" distribution pattern: standard technique in financial software (used in tax proration, invoice splitting) — HIGH confidence
- React immutable state update requirement: React official docs on `useState` — HIGH confidence
- UX patterns for item assignment: derived from standard form design principles and known failure modes in similar apps — MEDIUM confidence (no single authoritative source; reflects widely-observed pattern)
