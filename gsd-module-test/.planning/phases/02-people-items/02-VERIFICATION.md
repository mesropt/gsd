---
phase: 02-people-items
verified: 2026-04-01T08:52:00Z
status: passed
score: 10/10 must-haves verified
re_verification: false
---

# Phase 2: PeoplePanel + ItemsPanel Verification Report

**Phase Goal:** PeoplePanel and ItemsPanel — add/remove UI panels wired to Zustand store, with cascade delete
**Verified:** 2026-04-01T08:52:00Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can type a name and click Add to see that person appear in the People panel | VERIFIED | PersonForm.tsx: controlled input + addPerson dispatch; PeoplePanel.test.tsx test 1 passes |
| 2 | User can click Remove on a person and they disappear from the list | VERIFIED | PersonTag.tsx: removePerson dispatch via aria-label button; PeoplePanel.test.tsx test 3 passes |
| 3 | Input clears after adding a person | VERIFIED | PersonForm.tsx line 15: `setName('')` in handleSubmit after addPerson; test 2 passes |
| 4 | Empty or whitespace-only names are rejected | VERIFIED | PersonForm.tsx: `disabled={!name.trim()}` on button; `if (!trimmed) return` guard; tests 4 and 5 pass |
| 5 | User can type an item name and price and click Add to see the item in the Items panel | VERIFIED | ItemForm.tsx: controlled inputs + addItem dispatch; ItemsPanel.test.tsx test 1 passes |
| 6 | Price input accepts dollar format ($12.50, $1,234.56) and stores as integer cents | VERIFIED | ItemForm.tsx: `toCents(price)` at submit boundary; test 3 asserts `price === 123456` |
| 7 | User can click Remove on an item and it disappears from the list | VERIFIED | ItemRow.tsx: removeItem dispatch via aria-label button; ItemsPanel.test.tsx test 4 passes |
| 8 | Non-numeric price input is silently rejected (no NaN in store) | VERIFIED | ItemForm.tsx: `isNaN(cents) || cents <= 0` guard; ItemsPanel.test.tsx test 5 passes |
| 9 | When a person is removed, no item in the store contains that person's ID in its assignedTo array | VERIFIED | useBillStore.ts removePerson: maps items and filters assignedTo; useBillStore.test.ts cascade test 1 |
| 10 | The cascade delete happens atomically in a single set() call | VERIFIED | useBillStore.ts lines 19-26: both `people` and `items` returned in a single set() call |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/PeoplePanel/PersonForm.tsx` | Controlled name input + Add button, dispatches addPerson | VERIFIED | 29 lines; exports `PersonForm`; `aria-label="Person name"`; `useBillStore((s) => s.addPerson)` |
| `src/components/PeoplePanel/PersonTag.tsx` | Name display + Remove button, dispatches removePerson | VERIFIED | 26 lines; exports `PersonTag`; `aria-label={`Remove ${name}`}`; `useBillStore((s) => s.removePerson)` |
| `src/components/PeoplePanel/PeoplePanel.tsx` | Container rendering PersonForm + PersonTag list | VERIFIED | 23 lines; exports `PeoplePanel`; `useBillStore((s) => s.people)`; renders empty state and list |
| `src/components/PeoplePanel/PeoplePanel.test.tsx` | RTL integration tests for add and remove person | VERIFIED | 5 it() blocks in `describe('PeoplePanel')` covering add, clear, remove, disable, whitespace |
| `src/App.tsx` | App shell with PeoplePanel and ItemsPanel rendered | VERIFIED | 24 lines; imports and renders both `<PeoplePanel />` and `<ItemsPanel />` in `flex gap-6` |
| `src/components/ItemsPanel/ItemForm.tsx` | Label + price inputs, toCents() at submit boundary, dispatches addItem | VERIFIED | 39 lines; exports `ItemForm`; both aria-labels present; `toCents(price)`; `isNaN(cents) \|\| cents <= 0` |
| `src/components/ItemsPanel/ItemRow.tsx` | Label + formatted price display + Remove button | VERIFIED | 26 lines; exports `ItemRow`; `fromCents(item.price)`; `aria-label={`Remove ${item.label}`}` |
| `src/components/ItemsPanel/ItemsPanel.tsx` | Container rendering ItemForm + ItemRow list | VERIFIED | 23 lines; exports `ItemsPanel`; `useBillStore((s) => s.items)`; renders empty state and list |
| `src/components/ItemsPanel/ItemsPanel.test.tsx` | RTL integration tests for add and remove item | VERIFIED | 6 it() blocks in `describe('ItemsPanel')` covering all behaviors |
| `src/store/useBillStore.ts` | Upgraded removePerson action with cascade delete | VERIFIED | Lines 19-26: single set() updating both people and items with assignedTo filter |
| `src/store/useBillStore.test.ts` | Cascade delete unit tests | VERIFIED | `describe('removePerson — cascade delete')` with 3 it() blocks |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| PersonForm.tsx | useBillStore.ts | `useBillStore((s) => s.addPerson)` | WIRED | Line 8: granular selector; called in handleSubmit line 14 |
| PersonTag.tsx | useBillStore.ts | `useBillStore((s) => s.removePerson)` | WIRED | Line 11: granular selector; called in onClick line 19 |
| PeoplePanel.tsx | useBillStore.ts | `useBillStore((s) => s.people)` | WIRED | Line 6: granular selector; rendered in map line 17 |
| ItemForm.tsx | calculations.ts | `toCents()` called at submit boundary | WIRED | Import on line 5; called on line 15 in handleSubmit |
| ItemForm.tsx | useBillStore.ts | `useBillStore((s) => s.addItem)` | WIRED | Line 10: granular selector; called in handleSubmit line 17 |
| ItemRow.tsx | calculations.ts | `fromCents()` for price display | WIRED | Import on line 4; called in JSX line 14 `{fromCents(item.price)}` |
| ItemRow.tsx | useBillStore.ts | `useBillStore((s) => s.removeItem)` | WIRED | Line 8: granular selector; called in onClick line 19 |
| useBillStore.ts removePerson | state.items[].assignedTo | `assignedTo.filter((pid) => pid !== id)` inside single set() | WIRED | Lines 22-25: `items: state.items.map(item => ({ ...item, assignedTo: item.assignedTo.filter((pid) => pid !== id) }))` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| PeoplePanel.tsx | `people` | `useBillStore((s) => s.people)` — live Zustand state | Yes — store populated by addPerson actions | FLOWING |
| ItemsPanel.tsx | `items` | `useBillStore((s) => s.items)` — live Zustand state | Yes — store populated by addItem actions | FLOWING |
| PersonTag.tsx | `name`, `id` | Props from PeoplePanel.tsx via `people.map()` | Yes — real Person objects from store | FLOWING |
| ItemRow.tsx | `item` | Props from ItemsPanel.tsx via `items.map()` | Yes — real Item objects from store, price via `fromCents(item.price)` | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 5 PeoplePanel RTL tests pass | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | 5/5 passed | PASS |
| All 6 ItemsPanel RTL tests pass | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | 6/6 passed | PASS |
| All cascade delete store tests pass | `npm test -- --run src/store/useBillStore.test.ts` | 15/15 passed | PASS |
| Full test suite passes | `npm test -- --run` | 160/160 passed (13 test files) | PASS |
| TypeScript clean | `npx tsc --noEmit` | 0 errors | PASS |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| PEOP-01 | 02-01-PLAN.md | User can add a person to the bill by name | SATISFIED | PersonForm.tsx: controlled input + addPerson dispatch; 5 RTL tests pass |
| PEOP-02 | 02-01-PLAN.md | User can remove a person from the bill | SATISFIED | PersonTag.tsx: removePerson dispatch; PeoplePanel.test.tsx test 3 passes |
| PEOP-03 | 02-03-PLAN.md | Removing a person clears their item assignments (no dangling references) | SATISFIED | useBillStore.ts removePerson: atomic single set() with assignedTo cascade; 3 cascade delete tests pass |
| ITEM-01 | 02-02-PLAN.md | User can add an item with a name and price | SATISFIED | ItemForm.tsx: label + price inputs, toCents conversion, addItem dispatch; 6 RTL tests pass |
| ITEM-02 | 02-02-PLAN.md | User can remove an item from the bill | SATISFIED | ItemRow.tsx: removeItem dispatch; ItemsPanel.test.tsx test 4 passes |

**Notes on REQUIREMENTS.md state:** PEOP-01, PEOP-02, PEOP-03 remain marked `Pending` in the REQUIREMENTS.md traceability table even though implementation is complete and all tests pass. ITEM-01 and ITEM-02 are correctly marked `Complete`. This is a documentation-only inconsistency and does not affect code correctness.

**Orphan check:** ITEM-03 appears in the REQUIREMENTS.md Phase 2 section of the requirements list (`- [x] ITEM-03`) but the traceability table correctly maps it to `Phase 1 | Complete`. ITEM-03 was not claimed by any Phase 2 plan and is not expected — it was satisfied in Phase 1 via `toCents`/`fromCents` helpers. No orphaned requirements for Phase 2.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| PersonForm.tsx | 23 | `placeholder="Enter a name..."` | Info | HTML input placeholder attribute — not a code stub |
| ItemForm.tsx | 27 | `placeholder="Item name"` | Info | HTML input placeholder attribute — not a code stub |
| ItemForm.tsx | 33 | `placeholder="$0.00"` | Info | HTML input placeholder attribute — not a code stub |

No blockers or warnings. The three `placeholder` matches are HTML input hint text, not stub indicators. All components have real implementations with live store wiring.

---

### Human Verification Required

#### 1. Visual layout: side-by-side panels

**Test:** Start dev server (`npm run dev`), open browser at localhost port. Observe the main view.
**Expected:** "Expense Splitter" heading, PeoplePanel on the left ("People" heading, name input, Add button, empty state), ItemsPanel on the right ("Items" heading, name + price inputs, Add button, empty state).
**Why human:** CSS flex layout and visual spacing cannot be verified programmatically.

#### 2. Add → Remove round-trip in browser

**Test:** Add "Alice", add "Bob", add item "Pizza" at "$12.50". Verify both people and the item appear. Remove Alice. Verify Alice disappears but Bob and Pizza remain.
**Expected:** Smooth UI updates, no errors in browser console.
**Why human:** Real-time DOM update behavior and absence of console errors require a live browser session.

---

### Gaps Summary

No gaps found. All 10 observable truths are verified by code inspection and test results. All 11 artifacts exist, are substantive, and are wired to live data sources. All 8 key links are connected. The full test suite (160 tests, 13 files) passes with zero failures and zero TypeScript errors.

The only open items are:
1. Two human-verification UI checks (visual layout, browser interaction) — these are standard post-automation checks, not blockers.
2. A documentation inconsistency: PEOP-01, PEOP-02, PEOP-03 remain `Pending` in REQUIREMENTS.md despite being implemented. This should be updated to `Complete` in a housekeeping pass.

---

_Verified: 2026-04-01T08:52:00Z_
_Verifier: Claude (gsd-verifier)_
