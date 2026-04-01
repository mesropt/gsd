# Phase 2: People & Items - Research

**Researched:** 2026-03-31
**Domain:** React controlled-form components, Zustand store wiring, cascade delete pattern, RTL component tests
**Confidence:** HIGH

---

## Summary

Phase 2 adds the two primary data-entry panels — People and Items — on top of the fully working Phase 1 foundation. All infrastructure is already in place: Zustand store with `addPerson`, `removePerson`, `addItem`, `removeItem`, and `assignItem` actions are implemented and tested; `toCents` / `fromCents` helpers handle the dollar-to-cent conversion; shadcn/ui `Button` and `Input` components are available in `src/components/ui/`.

The three plans are cleanly separated: 02-01 builds `PeoplePanel` (add/remove people, wired to store), 02-02 builds `ItemsPanel` (add/remove items with dollar-to-cent price parsing), and 02-03 upgrades the existing `removePerson` Zustand action to also clear stale person IDs from all `item.assignedTo` arrays in the same `set()` dispatch. No new npm packages are required — everything needed exists from Phase 1.

The key insight for 02-03 is that cascade delete must happen inside the Zustand `set()` call, not in two separate dispatches. A two-dispatch approach creates an observable intermediate state (person gone, items still have stale IDs) and violates the atomicity guarantee the requirement demands. The unit test must confirm that after `removePerson`, no item in the store contains the removed person's ID in its `assignedTo` array.

**Primary recommendation:** Build form components as controlled inputs with local `useState`, dispatch to Zustand on submit (not on every keystroke), convert price with `toCents()` at submit boundary, implement cascade delete as a single atomic `set()` dispatch.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PEOP-01 | User can add a person to the bill by name | `PersonForm` controlled input + `addPerson` Zustand action already implemented in store. Component needs form UI only. |
| PEOP-02 | User can remove a person from the bill | `PersonTag` with Remove button, wired to `removePerson(id)`. Action exists in store. |
| PEOP-03 | Removing a person clears their item assignments (no dangling references) | Upgrade `removePerson` in store to cascade-clear `item.assignedTo` in single `set()` dispatch. Unit test verifies no stale IDs. |
| ITEM-01 | User can add an item with a name and price | `ItemForm` with label + price inputs. Price accepts `$` and commas (handled by `toCents()`). Dispatches `addItem(label, toCents(price))`. |
| ITEM-02 | User can remove an item from the bill | `ItemRow` with Remove button, wired to `removeItem(id)`. Action exists in store. |
</phase_requirements>

---

## Standard Stack

### Core (all from Phase 1 — no new packages required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.4 | UI framework | Already installed |
| zustand | 5.0.12 | State management | Store with all actions already implemented |
| tailwindcss | 4.2.2 | Utility CSS styling | Already configured |
| shadcn/ui Button | (copied) | Add/Remove buttons | Already in `src/components/ui/button.tsx` |
| shadcn/ui Input | (copied) | Text/price inputs | Already in `src/components/ui/input.tsx` |
| lucide-react | 1.7.0 | Icons (X / trash icon for Remove) | Already installed |
| @testing-library/react | 16.3.2 | Component integration tests | Already installed |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Already installed |
| vitest | 4.1.2 | Test runner | Already configured |

### No New Packages

Phase 2 adds zero new npm dependencies. All form primitives, state management, and testing utilities are available from Phase 1. The `toCents()` function in `src/lib/calculations.ts` already handles `$` and comma stripping.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local `useState` for form inputs | Zustand form state | Local state is correct here — form buffer is transient, not shared app state |
| Controlled inputs | Uncontrolled ref-based inputs | Controlled is required: need to clear the field after submit and show validation feedback |
| `toCents()` at submit boundary | Parse cents in the store action | Parsing at the boundary keeps the store action pure and reusable |

---

## Architecture Patterns

### Recommended Project Structure for Phase 2

```
src/
├── components/
│   ├── ui/                         # (Phase 1 — Button, Input already here)
│   ├── PeoplePanel/
│   │   ├── PeoplePanel.tsx         # Container: renders PersonForm + list of PersonTags
│   │   ├── PersonForm.tsx          # Controlled input + Add button
│   │   ├── PersonTag.tsx           # Name display + Remove button
│   │   └── PeoplePanel.test.tsx    # RTL tests for PEOP-01, PEOP-02
│   └── ItemsPanel/
│       ├── ItemsPanel.tsx          # Container: renders ItemForm + list of ItemRows
│       ├── ItemForm.tsx            # Label input + price input + Add button
│       ├── ItemRow.tsx             # Label, formatted price, Remove button
│       └── ItemsPanel.test.tsx     # RTL tests for ITEM-01, ITEM-02
└── store/
    └── useBillStore.ts             # Modified: removePerson cascade in 02-03
```

The `PeoplePanel.test.tsx` and `ItemsPanel.test.tsx` files test the full panel (not isolated sub-components) — this is the RTL philosophy: test user-observable behavior, not internal component structure.

### Pattern 1: Controlled Form with Local State, Dispatch on Submit

**What:** Form holds its draft value in `useState`. On submit: validate, dispatch to store, clear local state.
**When to use:** All add-person and add-item forms.

```typescript
// src/components/PeoplePanel/PersonForm.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'

export function PersonForm() {
  const [name, setName] = useState('')
  const addPerson = useBillStore((s) => s.addPerson)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addPerson(trimmed)
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter a name..."
        aria-label="Person name"
      />
      <Button type="submit" disabled={!name.trim()}>
        Add
      </Button>
    </form>
  )
}
```

Key points:
- `e.preventDefault()` on form submit prevents page reload
- Trim name before dispatch and for disabled check
- Clear local state after dispatch — field empties after add
- `disabled={!name.trim()}` prevents empty submissions via button; form handler guards for keyboard Enter too

### Pattern 2: PersonTag (Name + Remove)

**What:** Displays a single person's name with a Remove button. Receives `id` and `name` as props, dispatches `removePerson(id)`.
**When to use:** Rendered per-person in `PeoplePanel`.

```typescript
// src/components/PeoplePanel/PersonTag.tsx
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useBillStore } from '@/store/useBillStore'

interface PersonTagProps {
  id: string
  name: string
}

export function PersonTag({ id, name }: PersonTagProps) {
  const removePerson = useBillStore((s) => s.removePerson)

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
      <span className="text-sm">{name}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => removePerson(id)}
        aria-label={`Remove ${name}`}
      >
        <X />
      </Button>
    </div>
  )
}
```

Note: `aria-label={`Remove ${name}`}` is required for accessibility — the button contains only an icon, not text.

### Pattern 3: ItemForm with Dollar-to-Cent Conversion

**What:** Two inputs (label + price). Price accepts dollar format with `$` and commas. Converts with `toCents()` at submit — never stores dollar strings in Zustand.
**When to use:** `ItemsPanel` add-item form.

```typescript
// src/components/ItemsPanel/ItemForm.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBillStore } from '@/store/useBillStore'
import { toCents } from '@/lib/calculations'

export function ItemForm() {
  const [label, setLabel] = useState('')
  const [price, setPrice] = useState('')
  const addItem = useBillStore((s) => s.addItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedLabel = label.trim()
    const cents = toCents(price)
    if (!trimmedLabel || isNaN(cents) || cents <= 0) return
    addItem(trimmedLabel, cents)
    setLabel('')
    setPrice('')
  }

  const canSubmit = label.trim().length > 0 && price.trim().length > 0

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Item name"
        aria-label="Item name"
      />
      <Input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="$0.00"
        aria-label="Item price"
      />
      <Button type="submit" disabled={!canSubmit}>
        Add
      </Button>
    </form>
  )
}
```

Validation: `isNaN(cents)` catches non-numeric input. `cents <= 0` rejects negative or zero prices. `toCents()` already strips `$` and commas (from Phase 1 implementation), so the user can type `$12.50` or `12.50` or `$1,234.56`.

### Pattern 4: ItemRow with Formatted Price

**What:** Displays label, formatted price (using `fromCents()`), and Remove button.

```typescript
// src/components/ItemsPanel/ItemRow.tsx
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useBillStore } from '@/store/useBillStore'
import { fromCents } from '@/lib/calculations'
import type { Item } from '@/types'

interface ItemRowProps {
  item: Item
}

export function ItemRow({ item }: ItemRowProps) {
  const removeItem = useBillStore((s) => s.removeItem)

  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <div className="flex gap-4">
        <span className="text-sm font-medium">{item.label}</span>
        <span className="text-sm text-muted-foreground">{fromCents(item.price)}</span>
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => removeItem(item.id)}
        aria-label={`Remove ${item.label}`}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
```

### Pattern 5: Cascade Delete — Atomic Zustand Dispatch

**What:** `removePerson` action in `useBillStore.ts` must also sweep all items' `assignedTo` arrays in the same `set()` call.
**When to use:** 02-03 — upgrade existing `removePerson` action.

```typescript
// Upgraded removePerson in src/store/useBillStore.ts
removePerson: (id) =>
  set((state) => ({
    people: state.people.filter((p) => p.id !== id),
    items: state.items.map((item) => ({
      ...item,
      assignedTo: item.assignedTo.filter((pid) => pid !== id),
    })),
  })),
```

**Critical:** Both `people` and `items` are updated in the SAME `set()` return object. This is atomic — Zustand applies them together. Do NOT do `set({ people: ... })` followed by a second `set({ items: ... })` — that creates a momentary state where the person is gone but items still reference them.

### Pattern 6: RTL Component Tests

**What:** React Testing Library pattern for testing form interactions.
**When to use:** `PeoplePanel.test.tsx` and `ItemsPanel.test.tsx`.

```typescript
// src/components/PeoplePanel/PeoplePanel.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect } from 'vitest'
import { PeoplePanel } from './PeoplePanel'
import { useBillStore } from '@/store/useBillStore'

beforeEach(() => useBillStore.getState().resetBill())

describe('PeoplePanel', () => {
  it('adds a person when the form is submitted', async () => {
    const user = userEvent.setup()
    render(<PeoplePanel />)

    await user.type(screen.getByLabelText('Person name'), 'Alice')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('removes a person when Remove is clicked', async () => {
    const user = userEvent.setup()
    useBillStore.getState().addPerson('Bob')
    render(<PeoplePanel />)

    await user.click(screen.getByRole('button', { name: 'Remove Bob' }))

    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('clears the input after adding', async () => {
    const user = userEvent.setup()
    render(<PeoplePanel />)

    await user.type(screen.getByLabelText('Person name'), 'Carol')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(screen.getByLabelText('Person name')).toHaveValue('')
  })
})
```

Key RTL conventions to use:
- `screen.getByRole('button', { name: 'Add' })` — query by accessible role + name
- `screen.getByLabelText('Person name')` — matches `aria-label` on Input
- `userEvent.setup()` + `await user.type(...)` — higher fidelity than `fireEvent`
- `beforeEach(() => useBillStore.getState().resetBill())` — reset store between tests

### Pattern 7: Cascade Delete Unit Test

**What:** Pure store test (no React render needed) verifying no stale IDs remain after `removePerson`.

```typescript
// Part of src/store/useBillStore.test.ts (new tests in 02-03)
describe('removePerson — cascade delete', () => {
  it('clears the removed person ID from all item assignedTo arrays', () => {
    const { addPerson, addItem, assignItem, removePerson } = useBillStore.getState()
    addPerson('Alice')
    addPerson('Bob')
    const { people, items: emptyItems } = useBillStore.getState()
    const aliceId = people[0].id
    const bobId = people[1].id

    addItem('Pizza', 1200)
    addItem('Salad', 800)
    const { items } = useBillStore.getState()
    assignItem(items[0].id, [aliceId, bobId])
    assignItem(items[1].id, [aliceId])

    removePerson(aliceId)

    const { items: afterItems } = useBillStore.getState()
    // No item should contain Alice's ID in assignedTo
    const stale = afterItems.filter((i) => i.assignedTo.includes(aliceId))
    expect(stale).toHaveLength(0)
    // Bob's assignment on Pizza should be preserved
    expect(afterItems[0].assignedTo).toContain(bobId)
  })
})
```

### Anti-Patterns to Avoid

- **Two-dispatch cascade delete:** `removePerson(id)` then a separate `clearAssignments(id)` dispatch. Creates observable intermediate invalid state. Must be atomic in one `set()`.
- **Storing price as string in Zustand:** `addItem(label, price)` where `price` is the raw input string. Store always receives integer cents from `toCents()` at the form boundary.
- **Subscribing to full store in components:** `const store = useBillStore()` re-renders on every state change. Use selectors: `const addPerson = useBillStore(s => s.addPerson)`.
- **Querying by `getByTestId` in tests:** RTL best practice is role/label/text queries. `aria-label` on inputs and buttons makes this natural.
- **Not calling `resetBill()` in beforeEach:** Without reset, test state bleeds between tests. All Phase 2 tests must call `useBillStore.getState().resetBill()` in `beforeEach`.
- **Empty name validation only in button `disabled`:** The form `onSubmit` handler must also guard against empty/whitespace names — users can press Enter even when the button is visually disabled in some browsers.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible icon button | Custom `<button><svg/></button>` | `<Button variant="ghost" size="icon-xs" aria-label="...">` | shadcn Button already has focus ring, hover states, disabled handling |
| Dollar string parsing | Custom regex/split | `toCents()` from `src/lib/calculations.ts` | Already tested with 19 passing tests; handles `$`, commas, whitespace |
| Price display formatting | `(cents / 100).toFixed(2)` inline | `fromCents()` from `src/lib/calculations.ts` | Centralized, tested, includes `$` prefix |
| Class name merging | String concatenation | `cn()` from `src/lib/utils.ts` | Prevents Tailwind class conflicts; already used by all shadcn components |

**Key insight:** The entire "don't hand-roll" list for Phase 2 is already solved by Phase 1 infrastructure. Phase 2 is pure UI composition over existing store actions and helpers.

---

## Common Pitfalls

### Pitfall 1: Non-Atomic Cascade Delete

**What goes wrong:** `removePerson` removes from `people`, then a separate effect or dispatch removes from `items.assignedTo`. There is a frame where people and items are inconsistent.
**Why it happens:** Natural instinct to keep actions small and single-purpose.
**How to avoid:** Update both `people` and `items` in the same `set()` return object. Zustand merges them atomically.
**Warning signs:** Unit tests pass in isolation but fail when order-dependent; briefly rendering stale names in item rows.

### Pitfall 2: toCents() Called at Wrong Boundary

**What goes wrong:** `addItem(label, priceString)` where the store action calls `toCents()` internally. Then the store's `addItem` type becomes `(label: string, price: string) => void` instead of `(label: string, priceCents: number) => void`.
**Why it happens:** "Cleaner" to keep parsing inside the action.
**How to avoid:** Call `toCents()` in `ItemForm.handleSubmit` before dispatching. The store action signature `addItem(label: string, priceCents: number)` is already locked — it accepts integers.
**Warning signs:** TypeScript error on `addItem(label, price)` where price is a string.

### Pitfall 3: Price Validation Gap — NaN Stored in State

**What goes wrong:** User types `"abc"` in the price field. `toCents("abc")` returns `NaN`. `isNaN(cents)` is not checked. `addItem("Pizza", NaN)` is dispatched. `fromCents(NaN)` displays `"$NaN"`.
**Why it happens:** Happy-path testing only.
**How to avoid:** `if (!trimmedLabel || isNaN(cents) || cents <= 0) return` before dispatch.
**Warning signs:** `"$NaN"` appearing in item rows during manual QA.

### Pitfall 4: Input Not Cleared After Submit

**What goes wrong:** After adding a person or item, the input field retains the old value. User must manually clear it.
**Why it happens:** Forgetting `setName('')` / `setLabel(''); setPrice('')` after dispatch.
**How to avoid:** Clear all controlled state fields at the end of `handleSubmit`, after the dispatch.
**Warning signs:** RTL test `expect(screen.getByLabelText('Person name')).toHaveValue('')` fails.

### Pitfall 5: Zustand Selector Performance — Full Store Subscription

**What goes wrong:** Component renders on every Zustand state change, not just changes to the data it cares about.
**Why it happens:** `const { people, addPerson } = useBillStore()` subscribes to entire store.
**How to avoid:** Use granular selectors: `const people = useBillStore(s => s.people)` and `const addPerson = useBillStore(s => s.addPerson)`.
**Warning signs:** Profiler shows components re-rendering when unrelated state (tip, tax, items in the wrong panel) changes.

### Pitfall 6: `userEvent` Not Awaited in Tests

**What goes wrong:** RTL tests pass locally but fail intermittently or produce "act()" warnings.
**Why it happens:** `userEvent.type()` and `userEvent.click()` return Promises in v14+. Forgetting `await`.
**How to avoid:** Always `await user.type(...)` and `await user.click(...)`. Use `userEvent.setup()` (not the legacy `userEvent` directly).
**Warning signs:** "Warning: An update to X inside a test was not wrapped in act(...)" in test output.

---

## Code Examples

### Verified: Zustand selector pattern (from Phase 1 store)

```typescript
// Correct: granular selector — only re-renders when 'people' changes
const people = useBillStore((s) => s.people)
const addPerson = useBillStore((s) => s.addPerson)

// Incorrect: full store subscription — re-renders on ANY state change
const { people, addPerson } = useBillStore()
```

### Verified: toCents() already handles dollar format

```typescript
// From src/lib/calculations.ts (implemented and tested in Phase 1)
toCents('$12.50')    // 1250
toCents('$1,234.56') // 123456
toCents('12.50')     // 1250
toCents('abc')       // NaN — must guard in ItemForm
```

### Verified: shadcn Button variants available

Available variants (from `src/components/ui/button.tsx`):
- `variant="default"` — primary action (Add button)
- `variant="ghost"` — icon-only remove button
- `variant="destructive"` — for destructive actions (optional; ghost is fine for Remove)
- `size="icon-xs"` — compact icon button (Remove button)
- `size="default"` — standard (Add button)

### Verified: lucide-react icons available

```typescript
import { X } from 'lucide-react'          // for PersonTag Remove
import { Trash2 } from 'lucide-react'     // for ItemRow Remove
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `fireEvent.click()` in RTL tests | `await userEvent.setup().click()` | RTL user-event v14 | `userEvent` simulates full browser event sequence; `fireEvent` is lower-fidelity |
| Separate `@radix-ui/react-*` packages | Unified `radix-ui` package | shadcn v4 (2026) | Already handled in Phase 1; no new imports needed for Phase 2 |
| `create<T>()` single parens | `create<T>()()` double parens | Zustand v4+ | Already established in Phase 1 store |

---

## Open Questions

1. **`PeoplePanel` and `ItemsPanel` placement in `App.tsx`**
   - What we know: `App.tsx` currently renders a placeholder layout. Phase 2 plans must add the two panels.
   - What's unclear: Whether panels should be placed side-by-side (grid/flex row) or stacked (flex column) — the ROADMAP mentions mobile polish is Phase 4
   - Recommendation: Use a simple `flex gap-6` row layout for now (desktop-first). Phase 4 adds the responsive stack. Both panels should be rendered from `App.tsx`.

2. **Empty-state display for panels**
   - What we know: When no people/items exist, the list area is empty.
   - What's unclear: Whether empty panels should show a placeholder message ("No people added yet")
   - Recommendation: Add a simple empty-state message (`text-muted-foreground text-sm`) — costs one line, improves UX, no added complexity.

---

## Environment Availability

Phase 2 is purely code/config changes — no new external dependencies, CLI tools, or services. All required tools (Node.js, npm, Vite) were confirmed available in Phase 1 execution.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js / npm | `npm test`, `npm run dev` | Yes (confirmed Phase 1) | — | — |
| Vitest | Test runner | Yes | 4.1.2 | — |
| @testing-library/react | Component tests | Yes | 16.3.2 | — |
| @testing-library/user-event | Interaction simulation | Yes | 14.6.1 | — |
| zustand | State management | Yes | 5.0.12 | — |
| shadcn/ui Button + Input | Form UI | Yes (copied to src/components/ui/) | — | — |
| lucide-react | Remove button icons | Yes | 1.7.0 | — |

**Missing dependencies with no fallback:** None — Phase 2 introduces no new packages.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vite.config.ts` (test block already configured in Phase 1) |
| Quick run command | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` |
| Full suite command | `npm test -- --run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PEOP-01 | Type name + click Add → person appears in list | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | Wave 0 |
| PEOP-01 | Input clears after successful add | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | Wave 0 |
| PEOP-01 | Empty/whitespace name is rejected (no add) | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | Wave 0 |
| PEOP-02 | Click Remove on PersonTag → person disappears | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | Wave 0 |
| PEOP-03 | removePerson clears ID from all item assignedTo arrays atomically | unit | `npm test -- --run src/store/useBillStore.test.ts` | Wave 0 (new test in existing file) |
| ITEM-01 | Type label + price + click Add → item appears with formatted price | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | Wave 0 |
| ITEM-01 | Price input accepts $ and commas | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | Wave 0 |
| ITEM-01 | Non-numeric price is rejected | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | Wave 0 |
| ITEM-02 | Click Remove on ItemRow → item disappears | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx src/components/ItemsPanel/ItemsPanel.test.tsx src/store/useBillStore.test.ts`
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green (currently 31 passing; Phase 2 completion target: 31 + ~15 new tests = ~46 passing)

### Wave 0 Gaps

- [ ] `src/components/PeoplePanel/PeoplePanel.test.tsx` — covers PEOP-01, PEOP-02
- [ ] `src/components/ItemsPanel/ItemsPanel.test.tsx` — covers ITEM-01, ITEM-02
- [ ] Cascade delete tests in `src/store/useBillStore.test.ts` — covers PEOP-03 (extend existing file, not create new)

No new framework config needed — Vitest + jsdom + RTL are fully configured from Phase 1.

---

## Sources

### Primary (HIGH confidence)
- Phase 1 source files (read live 2026-03-31): `src/store/useBillStore.ts`, `src/types/index.ts`, `src/lib/calculations.ts`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx` — exact APIs confirmed
- `package.json` (read live 2026-03-31) — exact installed versions confirmed
- `npm test -- --run` output (ran live 2026-03-31) — 31/31 tests passing confirmed

### Secondary (MEDIUM confidence)
- [Zustand docs — `set()` merging](https://zustand.dev/guides/updating-state) — atomic update pattern confirmed; single `set()` return object is merged atomically
- [Testing Library user-event v14 docs](https://testing-library.com/docs/user-event/intro/) — `userEvent.setup()` + async pattern confirmed

### Tertiary (LOW confidence)
- Training knowledge of RTL best practices (role/label queries over testId) — widely established, LOW because not re-verified against current RTL 16.x docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified by reading installed `package.json`
- Architecture: HIGH — patterns derived directly from Phase 1 source code; store actions and type signatures are locked
- Pitfalls: HIGH — derived from concrete Phase 1 implementation details (toCents signature, store action types, Zustand selector pattern) + standard RTL async patterns
- Test patterns: HIGH — Phase 1 test files read directly; same patterns extend naturally

**Research date:** 2026-03-31
**Valid until:** 2026-06-30 (inherits Phase 1 validity window; no new packages introduced)
