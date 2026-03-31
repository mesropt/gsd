# Architecture Patterns

**Domain:** Expense splitter SPA (React + Vite + Tailwind CSS)
**Researched:** 2026-03-31
**Confidence:** HIGH — grounded in official React docs, Vite conventions, and well-established patterns for this category of app

---

## Recommended Architecture

A single-page React app with no backend. All state lives in a top-level `useReducer` + Context pair. Calculations are pure functions in a dedicated `lib/` module. Components are purely presentational or lightly coordinating — they dispatch actions and render derived data; they do not contain business logic.

```
App (Context Provider)
├── PeoplePanel
│   ├── PersonForm          (add person)
│   └── PersonList
│       └── PersonTag       (name + remove button)
├── ItemsPanel
│   ├── ItemForm            (add item + price)
│   └── ItemList
│       └── ItemRow
│           └── AssignmentSelector  (who gets this item)
├── ChargesPanel
│   ├── TipControl          (% selector + split method toggle)
│   └── TaxControl          (amount or %, split method toggle)
└── SummaryPanel
    └── PersonSummaryRow    (name + subtotal + tip share + tax share + total)
```

Data flows down as props or via context reads. Updates flow up exclusively through `dispatch`. No component mutates state directly.

---

## State Shape

### Canonical State (lives in `useReducer`)

```typescript
type SplitMethod = "equal" | "proportional";

interface Person {
  id: string;          // crypto.randomUUID()
  name: string;
}

interface Item {
  id: string;
  label: string;
  price: number;       // stored as cents (integer) to avoid float errors
  assignedTo: string[] | "shared";
  // "shared" = split equally among ALL people
  // string[] = IDs of specific people who ordered this
}

interface ChargeConfig {
  mode: "percent" | "amount";
  value: number;       // percent: 0–100, amount: cents
  splitMethod: SplitMethod;
}

interface AppState {
  people: Person[];
  items: Item[];
  tip: ChargeConfig;
  tax: ChargeConfig;
}
```

### Derived State (computed, never stored)

These are calculated on every render from the canonical state above. Do NOT put them in state — they are redundant and will drift.

```typescript
// Computed in lib/calculations.ts, consumed in SummaryPanel
interface PersonBreakdown {
  personId: string;
  itemSubtotal: number;   // sum of their assigned items (cents)
  tipShare: number;       // cents
  taxShare: number;       // cents
  total: number;          // itemSubtotal + tipShare + taxShare
}
```

### State Ownership

All state lives at the top (`App` component via `useReducer`). The shape is one cohesive object, not separate `useState` calls — this prevents the people/items/tip/tax pieces from drifting out of sync.

State is made available via two contexts:

```typescript
const BillStateContext = createContext<AppState>(…);
const BillDispatchContext = createContext<Dispatch<BillAction>>(…);
```

Components read from `BillStateContext` and write via `BillDispatchContext`. The two are separate so components that only dispatch don't re-render when state changes.

---

## Component Boundaries

| Component | Responsibility | State Access |
|-----------|---------------|--------------|
| `App` | Provider root, renders layout panels | owns state via `useReducer` |
| `PeoplePanel` | Section wrapper | none |
| `PersonForm` | Controlled input for new name, dispatches `ADD_PERSON` on submit | dispatch only |
| `PersonTag` | Renders one name + remove button, dispatches `REMOVE_PERSON` | dispatch only |
| `ItemsPanel` | Section wrapper | none |
| `ItemForm` | Controlled inputs for label + price, dispatches `ADD_ITEM` | dispatch only |
| `ItemRow` | Renders item label, price, and assignment selector | reads `people` for selector options |
| `AssignmentSelector` | Dropdown/multi-select: "shared" or choose specific people | reads `people`, dispatches `ASSIGN_ITEM` |
| `TipControl` | Percent preset buttons + custom input + split toggle | reads `tip`, dispatches `SET_TIP` |
| `TaxControl` | Amount/percent toggle + value input + split toggle | reads `tax`, dispatches `SET_TAX` |
| `SummaryPanel` | Renders final breakdown per person | reads full state, calls `calculateBreakdowns()` |
| `PersonSummaryRow` | One row: name, subtotal, tip, tax, total | receives `PersonBreakdown` as props |

---

## Calculation Logic

All math lives in `src/lib/calculations.ts`. This file exports pure functions — no React imports, no side effects, fully unit-testable.

### Core function

```typescript
export function calculateBreakdowns(state: AppState): PersonBreakdown[] {
  // 1. For each person, sum the prices of items assigned to them
  //    + their proportional share of "shared" items
  // 2. Compute tip total from state.tip config
  // 3. Distribute tip per person based on splitMethod:
  //    - "equal": tipTotal / people.length
  //    - "proportional": (personSubtotal / billSubtotal) * tipTotal
  // 4. Same for tax
  // 5. Return array of PersonBreakdown, one per person
}
```

### Rounding strategy

Store all prices and computed values as **integer cents** throughout the calculation pipeline. Convert to dollars only at display time (`(cents / 100).toFixed(2)`).

For proportional splits, the last person in the array absorbs any rounding remainder so the parts always sum to exactly the total. This is the "largest remainder" method and prevents penny errors.

```typescript
// Anti-pattern: float arithmetic
const share = (subtotal / billTotal) * tipAmount; // 33.333...

// Correct: integer cents + remainder assignment
const shares = people.map(p => Math.floor((subtotal(p) / billTotal) * tipCents));
const remainder = tipCents - shares.reduce((a, b) => a + b, 0);
shares[shares.length - 1] += remainder;
```

---

## File / Folder Structure

```
src/
├── main.tsx                  # ReactDOM.createRoot, nothing else
├── App.tsx                   # Provider setup + top-level layout
│
├── context/
│   ├── BillContext.tsx       # createContext + BillProvider component
│   └── useBill.ts            # useBillState() and useBillDispatch() hooks
│
├── reducer/
│   ├── billReducer.ts        # useReducer handler: all action cases
│   ├── actions.ts            # Action type union (TypeScript discriminated union)
│   └── initialState.ts       # Default AppState value
│
├── lib/
│   └── calculations.ts       # Pure calculation functions — no React
│
├── components/
│   ├── PeoplePanel/
│   │   ├── PeoplePanel.tsx
│   │   ├── PersonForm.tsx
│   │   └── PersonTag.tsx
│   ├── ItemsPanel/
│   │   ├── ItemsPanel.tsx
│   │   ├── ItemForm.tsx
│   │   ├── ItemRow.tsx
│   │   └── AssignmentSelector.tsx
│   ├── ChargesPanel/
│   │   ├── ChargesPanel.tsx
│   │   ├── TipControl.tsx
│   │   └── TaxControl.tsx
│   └── SummaryPanel/
│       ├── SummaryPanel.tsx
│       └── PersonSummaryRow.tsx
│
└── types/
    └── index.ts              # AppState, Person, Item, ChargeConfig, etc.
```

One component per file. Folder-per-panel keeps co-located concerns together. `lib/` and `context/` are flat because they have few files each.

---

## Data Flow Diagram

```
User action (click/type)
        |
        v
Component calls dispatch(action)
        |
        v
billReducer(state, action) → new AppState
        |
        v
BillStateContext updates
        |
        v
Subscribed components re-render
        |
        v
SummaryPanel calls calculateBreakdowns(state) → PersonBreakdown[]
        |
        v
PersonSummaryRow renders final numbers (cents → formatted dollars)
```

---

## Patterns to Follow

### Pattern 1: Discriminated Union Actions

Use a TypeScript discriminated union for all reducer actions. This gives exhaustive checking and makes the reducer self-documenting.

```typescript
type BillAction =
  | { type: "ADD_PERSON"; name: string }
  | { type: "REMOVE_PERSON"; id: string }
  | { type: "ADD_ITEM"; label: string; priceCents: number }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "ASSIGN_ITEM"; itemId: string; assignedTo: string[] | "shared" }
  | { type: "SET_TIP"; config: Partial<ChargeConfig> }
  | { type: "SET_TAX"; config: Partial<ChargeConfig> };
```

### Pattern 2: Input Prices as Dollars, Store as Cents

The `ItemForm` accepts a dollar-format string input from the user. Convert to cents (integer) on dispatch — not in the reducer, not in calculations.

```typescript
// In ItemForm.tsx, on submit:
const priceCents = Math.round(parseFloat(priceInput) * 100);
dispatch({ type: "ADD_ITEM", label, priceCents });
```

### Pattern 3: Controlled Forms with Local State

Each form (`PersonForm`, `ItemForm`) owns its own input state via `useState`. Only dispatch to global state on submit, not on every keystroke. This prevents the reducer from handling transient input state.

### Pattern 4: useMemo for Summary Calculations

Wrap `calculateBreakdowns(state)` in `useMemo` inside `SummaryPanel` so it only recalculates when state actually changes.

```typescript
const breakdowns = useMemo(() => calculateBreakdowns(state), [state]);
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Calculated Totals in State

**What:** Keeping `personTotals` or `billTotal` in the reducer alongside raw data.
**Why bad:** Creates a second source of truth. The totals go stale when items or charges change, requiring careful synchronization across every action case.
**Instead:** Always derive totals from canonical state at render time via `calculateBreakdowns`.

### Anti-Pattern 2: Float Arithmetic for Money

**What:** `item.price = 12.99` as a JavaScript `number`.
**Why bad:** `0.1 + 0.2 === 0.30000000000000004`. With proportional splits across multiple items, errors compound and you get totals like "$34.4999999".
**Instead:** Store all money as integer cents. Format to display strings at the boundary (render only).

### Anti-Pattern 3: Putting Business Logic in Components

**What:** Writing split calculations or rounding logic inside `SummaryPanel.tsx`.
**Why bad:** Untestable without React rendering. Mixes display concerns with math. Gets duplicated if another component needs the same logic.
**Instead:** All math goes in `src/lib/calculations.ts`. Components only call `calculateBreakdowns(state)` and render the result.

### Anti-Pattern 4: Global State for Form Inputs

**What:** Storing the "new person name" text field value in the `useReducer` state.
**Why bad:** Every keystroke dispatches an action and runs the reducer. Adds noise to state history. The input value is ephemeral and only matters on submit.
**Instead:** Local `useState` in each form component. Only dispatch on submit.

### Anti-Pattern 5: Prop-Drilling Through Panel Wrappers

**What:** Passing `people`, `dispatch`, `items` as props through `PeoplePanel → PersonList → PersonTag`.
**Why bad:** The panel wrapper components become pure relay components — they hold data they don't use. Adding a new leaf means updating every intermediate component.
**Instead:** Leaf components read from `BillStateContext` and `BillDispatchContext` directly via the `useBillState()` / `useBillDispatch()` custom hooks.

---

## Scalability Considerations

This is a v1 SPA with no backend. The architecture is intentionally simple. Here is where complexity would be introduced for v2 features:

| Concern | v1 (current) | v2 consideration |
|---------|-------------|-----------------|
| Persistence | None — state resets on refresh | `localStorage` sync via `useEffect` watching state |
| URL sharing | Not applicable | Serialize state to URL param (Base64 JSON) |
| Multi-bill history | Not applicable | Lift `AppState` into an array, add bill selector |
| Receipt OCR | Out of scope | Add an upload step before item entry; OCR results populate `ADD_ITEM` dispatches |
| Payment links | Out of scope | `PersonSummaryRow` gains a Venmo deep-link button using the `total` from breakdown |

None of these v2 paths require restructuring the core reducer/context/lib architecture — they extend it. That is a sign the architecture is correctly layered.

---

## Sources

- React official docs — Managing State: https://react.dev/learn/managing-state (HIGH confidence)
- React official docs — Thinking in React: https://react.dev/learn/thinking-in-react (HIGH confidence)
- React official docs — Choosing the State Structure: https://react.dev/learn/choosing-the-state-structure (HIGH confidence)
- Vite default scaffold structure: training data (MEDIUM confidence — structure is stable and well-established)
- Integer-cents money storage pattern: established industry practice for browser-based financial apps (HIGH confidence)
