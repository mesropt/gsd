# Feature Landscape

**Domain:** Bill-splitting / expense splitter web app
**Researched:** 2026-03-31
**Confidence:** MEDIUM — based on training knowledge of Splitwise, Tricount, Tab, Divvy, PayPal Split, and similar apps. WebSearch unavailable; no live verification performed.

---

## Table Stakes

Features users absolutely expect. Missing any of these makes the product feel broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Add/remove people by name | Every splitter app has this. No names = no accountability | Low | Free text input; at least 2 people required |
| Add/remove line items with prices | Core data entry. Users arrive with a receipt | Low | Price entry must handle decimals correctly |
| Assign items to specific person | The whole point of the app | Low | Must support assigning one item to multiple people |
| "Shared" item assignment (split equally among selected) | Appetizers, shared dishes — universal restaurant reality | Medium | Shared among ALL or among a SUBSET of people |
| Tip with percentage options (15/18/20/custom) | Every restaurant bill has tip; users expect presets | Low | Custom input must validate (numbers only, reasonable range) |
| Tax entry (amount or percentage) | Sales tax appears on every US restaurant receipt | Low | Both input modes needed — receipts show either |
| Final per-person breakdown showing exact dollar amount | The entire output of the app | Low | Must be unambiguous: name + dollar amount |
| Correct rounding with no penny errors | Users WILL notice if totals don't sum to the bill | Medium | Remainder must be distributed, not lost or doubled |

---

## Rounding: The Hidden Complexity

Rounding is table-stakes but deserves its own section because it causes real bugs.

**The problem:** Dividing $10.00 among 3 people gives $3.3333... Rounded to cents: $3.33 x 3 = $9.99. One penny disappears.

**The standard solution (Largest Remainder Method):**
1. Compute each person's exact share as a float
2. Floor each to cents
3. Compute remainder (total bill minus sum of floored amounts, in cents)
4. Distribute remainder cents one-by-one to the people with the largest fractional parts

**Why this matters:**
- The sum of all per-person amounts MUST exactly equal the bill total
- Users will test this by adding up the numbers
- "Off by a penny" reports are common on apps that skip this

**Confidence:** HIGH — this is a well-known algorithmic problem with a standard solution.

---

## Shared Item Assignment: The Core Edge Case

Shared items introduce the most nuanced logic in the app.

| Scenario | Behavior Required |
|----------|-------------------|
| Item shared among ALL people | Divide item price equally by headcount |
| Item shared among a SUBSET | Divide by subset size, not total headcount |
| Item assigned to ONE person | Full price goes to that person |
| Item with no assignment | Should be flagged as unassigned (don't silently ignore it) |

**Tip and tax on shared items:** Tip/tax proportional split must use each person's post-shared-item subtotal, not just their individually-assigned items. Shared item cost should flow into the subtotal before proportional calculations.

---

## Tip/Tax Split Methods

Two split models are expected and serve different social contracts:

| Method | How It Works | When People Prefer It |
|--------|-------------|----------------------|
| Equal split | Tip/tax divided equally by headcount | Simple, fast, avoids tracking who ordered what |
| Proportional split | Tip/tax allocated in proportion to each person's food subtotal | Fair when spending is unequal — high spenders pay more tip |

Both methods must be independently configurable for tip and tax (someone may want tip proportional but tax equal).

---

## Differentiators

Features that set a splitter apart. Not universally expected in v1 but add real value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Running subtotal per person (live update) | Users want to see impact of each assignment immediately — reduces errors | Low | Reactive state; already implicit in React |
| Unassigned item warning | Prevents silent errors where an item was forgotten | Low | Flag items with no assignee in the UI |
| Quick-assign "everyone" button | Assigning shared items one-by-one is tedious for large groups | Low | Single-click marks item as shared by all |
| Item editing in-place | Mistyped prices are common; requiring delete-and-re-add is frustrating | Low | Edit name and price without losing assignment state |
| Person removal with reassignment prompt | Removing a person who has assigned items needs graceful handling | Medium | Options: reassign items, or drop them |
| Subtotal visibility before tip/tax | Users want to verify food total before applying tip/tax | Low | Simple sum display |
| "Split item equally" per-item control | Some items shared among some people, others among all — needs per-item configuration | Medium | More granular than a global "shared" flag |

---

## Anti-Features

Features to explicitly NOT build in v1, with rationale.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Receipt photo / OCR | Requires ML pipeline or third-party API; fails unpredictably; adds infrastructure cost | Manual item entry — faster to type than debug OCR errors |
| Venmo / payment deep links | Venmo API requires OAuth + app review; deep links are fragile across platforms | Show the dollar amount; users know how to pay |
| Save / share / history | Requires backend or localStorage serialization strategy; out of scope for v1 | Stateless session — user gets result and leaves |
| Accounts / auth | Zero value for a single-session use case | Anonymous use only |
| Multi-currency | Complexity without a clear user need in the restaurant context | Single currency assumed |
| Percentage-based item splits | "Sarah pays 30%, Mike pays 70%" of one item — almost never needed at a restaurant table | Equal share per person on shared items is sufficient |
| Debt simplification (A owes B, B owes C → A owes C) | Useful for group trips; overkill for one-meal use | Each person is told what they owe to the "pot"; settlement is their problem |
| Negative items / discounts | Coupons, comps — rare edge case that adds UI complexity | Not supported in v1 |

---

## UX Patterns That Work Well

Based on app-store dominant patterns in Splitwise, Tab, and Tricount:

### Input First, Math Later
Users enter all data (people, items, assignments, tip, tax) and see the result at the end — not per-step. This matches the mental model of "I have a receipt in my hand."

### Sticky Summary Panel
A persistent sidebar or bottom bar showing running per-person subtotals as the user assigns items. Provides instant feedback without requiring navigation to a "results" page.

### Item-Centric Assignment (not person-centric)
Users think about items ("who had the salmon?"), not people ("what did Sarah order?"). The primary UI should be a list of items, each with assignee controls — not a list of people where you add items.

### Inline Tip/Tax Section
Tip and tax configuration should appear at the bottom of the item list as a natural extension of "the receipt," not on a separate screen. Single-page flow matches how users physically experience a restaurant bill.

### Final Screen is Read-Only
The summary screen should not allow edits. If the user needs to change something, they go back. Prevents accidental edits after everyone has seen the result.

### People as Chips / Avatars
Showing people as small clickable chips next to each item (one chip per person) is the dominant pattern. Faster than dropdowns. Works for 2–8 people at a table.

### Mobile-First Layout
Restaurant table use is on a phone. Touch targets must be large. Input forms must not require keyboard precision. Avoid hover-dependent UI.

---

## Feature Dependencies

```
People list → Item assignment (need people before you can assign)
Item assignment → Per-person subtotal
Per-person subtotal → Proportional tip/tax calculation
Per-person subtotal + tip + tax → Final breakdown
Rounding logic → Final breakdown (must be applied last, after all calculations)
```

---

## MVP Recommendation

Prioritize (in implementation order):

1. People management (add/remove by name) — unblocks everything
2. Item list (add/remove with price) — core data
3. Item assignment to person(s) — "shared" is a variant of this, build together
4. Unassigned item warning — cheap, prevents silent bugs
5. Tip configuration (presets + custom, equal vs proportional)
6. Tax configuration (amount or percentage, equal vs proportional)
7. Rounding-correct final summary

Defer to v2:
- Receipt OCR — out of scope, high complexity, low payoff vs. manual entry
- Venmo deep links — nice-to-have, requires platform work
- Save/share — requires persistence strategy decision
- Debt simplification — single-meal use case doesn't need it

---

## Sources

- Training knowledge of Splitwise (web + mobile, circa 2024), Tricount, Tab, Divvy, PayPal Split
- Largest Remainder Method: standard computer science rounding algorithm — HIGH confidence
- UX pattern observations: MEDIUM confidence (based on training data; no live app audit performed)
- Anti-feature rationale: HIGH confidence for technical reasons, MEDIUM confidence for product reasons
