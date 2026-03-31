# Technology Stack

**Project:** Expense Splitter
**Researched:** 2026-03-31
**Confidence note:** WebSearch and WebFetch were unavailable during this session. All findings are sourced from training data (cutoff August 2025). Confidence levels are assigned conservatively. Verify versions with npm before installing.

---

## Pre-Decided (Already Locked)

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| Tailwind CSS | 3.x | Utility-first styling |

These are not re-evaluated here.

---

## Recommended Stack: Additional Libraries

### State Management

**Recommendation: Zustand ~5.x**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | ~5.0 | App-wide state (people, items, tip, tax) | Minimal boilerplate, flat store API, plays well with React 18 concurrent features, no provider wrap needed |

**Rationale.**
The expense splitter has moderate state complexity: a list of people, a list of items with per-item assignments, and two calculation configs (tip, tax). This is a single cohesive store — not a deeply nested tree, not server-synchronized data, not highly concurrent writes.

Zustand is the right fit:
- A single `useStore` hook replaces dozens of prop-drills or Context boilerplate
- The store can hold the full bill model as a flat object with named actions (`addPerson`, `removeItem`, `setTip`, etc.)
- No Redux Toolkit setup ceremony (slices, reducers, dispatch, selectors)
- No Jotai atom-graph maintenance — which shines for highly granular reactivity but adds indirection for a cohesive domain model

**What NOT to use:**

| Option | Why Not |
|--------|---------|
| `useState` only | Works for isolated components but bill data needs to flow from item assignment down to the final summary without prop chains. Becomes unmaintainable by phase 2. |
| Redux Toolkit | Correct choice at scale. For a client-only single-page calculator with ~5 entity types, the setup cost (slices, reducers, selectors, provider) is disproportionate overhead. |
| Jotai | Excellent for atom-level granularity (e.g., each cell in a spreadsheet). The bill model is a cohesive record, not a collection of independent atoms. Zustand's single-store model maps more naturally to it. |
| Recoil | Facebook's internal tool, lower external adoption than Zustand or Jotai, less certain maintenance trajectory. |
| React Context + useReducer | Viable, but verbose compared to Zustand and lacks devtools without extra setup. Adds a Provider wrapper that Zustand avoids. |

**Confidence:** MEDIUM. Zustand's dominance in the small-to-mid React app space was well-established through training data cutoff. Version 5.x was released; verify exact version on npm.

---

### Financial Math / Rounding

**Recommendation: No external library — use integer-cent arithmetic manually**

| Approach | Purpose | Why |
|----------|---------|-----|
| Integer cents (custom helpers) | All bill calculations | Avoids floating-point entirely; no dependency to maintain |

**Rationale.**
JavaScript floating-point is the primary source of penny errors in bill-splitting apps. `0.1 + 0.2 === 0.30000000000000004`. The correct fix is to work in integer cents throughout:

```
// Store all monetary values as integer cents
// e.g., $12.50 → 1250
// Display: (cents / 100).toFixed(2)
```

A few helper functions cover 100% of the need:
- `toCents(dollars: string | number): number` — parse input to integer cents
- `fromCents(cents: number): string` — format for display
- `distributeRemainder(total: number, parts: number): number[]` — split a cent amount N ways, distributing remainder pennies to the first N slots (prevents totals that are off by 1)

**Why not a library:**
- `big.js` (~7 KB gzipped) is excellent but adds a dependency for a problem solvable with 30 lines of arithmetic
- `dinero.js` v2 is well-designed for multi-currency money objects, but this app has one currency and simple split math; the abstraction adds learning cost
- `decimal.js` is heavier than `big.js` and similarly over-engineered for this scope

**If you want a library anyway:** Use `dinero.js` v2 (not v1 — v2 is the modern rewrite with a functional API). It handles remainder distribution correctly and is type-safe. Do not use `accounting.js` — it is unmaintained and handles rounding poorly for distribution scenarios.

**Confidence:** HIGH. IEEE 754 floating-point behavior is a language constant. Integer-cent math is the standard industry approach for financial apps without multi-currency requirements.

---

### Component Library

**Recommendation: shadcn/ui (no fixed version — copy-paste components)**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui | Latest CLI | Input, Button, Select, Dialog, Badge primitives | Not a dependency — components are copied into your codebase and styled with Tailwind; zero runtime overhead |

**Rationale.**
shadcn/ui is not an npm package. The CLI (`npx shadcn@latest add button`) copies accessible, Radix UI-backed components into `src/components/ui/`. You own the code. No version conflicts, no library updates to manage, no CSS-in-JS runtime.

This is the correct choice for a Tailwind project because:
- Components are already written in Tailwind classes — no style overrides needed
- Radix UI primitives handle accessibility (keyboard nav, aria, focus traps) that you would otherwise implement manually
- Selects, dialogs, and dropdowns (needed for tip percentage picker) are included
- The component code is in your repo, so customizations are permanent

**What to install alongside it:**

```bash
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-slot
```

These are peer dependencies the shadcn/ui components import.

**What NOT to use:**

| Option | Why Not |
|--------|---------|
| Material UI (MUI) | Ships its own style system (Emotion/styled-components). Overriding MUI styles with Tailwind classes is a fighting match — two style systems colliding. |
| Chakra UI | Same problem as MUI — owns its own CSS-in-JS layer. Works in isolation, fights with Tailwind. |
| Ant Design | Heavy, opinionated visual style, not Tailwind-native. |
| Headless UI (standalone) | Lower-level than shadcn/ui; you write all the Tailwind styling yourself. Fine for one or two components, but shadcn/ui provides styled starting points for free. |
| Flowbite / DaisyUI | CSS-class-based Tailwind component libraries. Viable, but shadcn/ui's Radix-backed accessibility is better out of the box and it has stronger community traction as of 2024-2025. |

**Confidence:** MEDIUM-HIGH. shadcn/ui became the dominant Tailwind component solution in the React ecosystem through 2024. Its copy-paste model is unusual but well-understood. Verify the CLI is still `npx shadcn@latest` (it was renamed from `shadcn-ui` to `shadcn` in 2024).

---

### Testing

**Recommendation: Vitest + React Testing Library**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vitest | ~2.x | Test runner | Vite-native; shares vite.config — no separate Jest config, same transform pipeline |
| @testing-library/react | ~16.x | Component testing | Queries DOM the way users do; industry standard for React |
| @testing-library/user-event | ~14.x | User interaction simulation | Realistic event firing (vs fireEvent which is lower-fidelity) |
| @testing-library/jest-dom | ~6.x | Custom matchers | `toBeInTheDocument()`, `toHaveValue()`, etc. |
| jsdom | ~25.x | DOM environment for Vitest | Required by RTL; configure via `environment: 'jsdom'` in vitest.config |

**Rationale.**
Vitest is the natural test runner for a Vite project. It uses the same config file and transformation pipeline — no Babel setup, no separate tsconfig for tests, no Jest module mocking workarounds for ESM. For a pure-frontend app with no backend mocking complexity, Vitest + RTL is the complete stack.

What to test in this app:
- **Unit tests for rounding helpers** — these are the highest-risk logic in the app. Test `distributeRemainder` exhaustively with odd-cent scenarios.
- **Unit tests for Zustand store actions** — verify `addItem`, `removeItem`, `setTip` produce correct state.
- **Integration tests for the summary calculation** — render the full bill state, verify "Sarah owes $X" output matches expected values.

Do not bother with end-to-end (Playwright/Cypress) for v1. The app has no network calls, no auth, no multi-page flows. RTL integration tests give 90% of the value at 10% of the setup cost.

**What NOT to use:**

| Option | Why Not |
|--------|---------|
| Jest | Works fine but requires separate babel/ts transform configuration alongside Vite. Duplication. Vitest eliminates this. |
| Cypress (for unit/integration) | Overkill for a single-page calculator. Reserve for e2e if the app grows to multi-step flows. |
| Playwright | Same as Cypress — correct tool for a different problem. |
| Enzyme | Unmaintained since React 17. Do not use. |

**Confidence:** HIGH. Vitest + RTL was the settled standard for Vite-based React apps well before the training cutoff. This combination is unlikely to have been displaced.

---

## Complete Installation Reference

```bash
# State management
npm install zustand

# Component library scaffolding
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-select @radix-ui/react-dialog @radix-ui/react-slot
npx shadcn@latest init
# Then add components as needed: npx shadcn@latest add button select input

# Testing
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add to `vite.config.ts` (or `vitest.config.ts`):
```typescript
/// <reference types="vitest" />
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

`src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

---

## Alternatives Summary

| Category | Recommended | Runner-up | Why Not Runner-up |
|----------|-------------|-----------|-------------------|
| State | Zustand ~5 | Jotai ~2 | Jotai atoms suit granular reactivity; overkill for a cohesive bill model |
| Financial math | Integer cents (custom) | dinero.js v2 | Library solves a 30-line problem; only adopt dinero.js if multi-currency is added |
| Components | shadcn/ui | Headless UI | Headless UI requires writing all Tailwind manually; shadcn provides styled starting points |
| Testing | Vitest + RTL | Jest + RTL | Jest requires duplicate transform config next to Vite |

---

## Sources

- Training data (cutoff August 2025) — confidence levels noted per section
- Verify current versions: https://www.npmjs.com/package/zustand, https://www.npmjs.com/package/vitest
- shadcn/ui docs: https://ui.shadcn.com/docs/installation/vite
- Zustand docs: https://docs.pmnd.rs/zustand/getting-started/introduction
- Vitest docs: https://vitest.dev/guide/
