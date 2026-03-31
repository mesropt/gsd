---
phase: 01-foundation
plan: 01-01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.ts
  - tsconfig.app.json
  - tsconfig.json
  - index.html
  - src/main.tsx
  - src/App.tsx
  - src/index.css
  - src/test/setup.ts
  - components.json
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
autonomous: true
requirements:
  - ITEM-03

must_haves:
  truths:
    - "Running `npm run dev` serves the app with no console errors"
    - "The browser shows an app shell with a shadcn/ui Button and Input rendered"
    - "Running `npm test -- --run` exits 0 (Vitest is configured and the suite starts)"
    - "Tailwind utility classes apply visibly (e.g., a background color or padding on a wrapper)"
  artifacts:
    - path: "vite.config.ts"
      provides: "Vite config with @tailwindcss/vite plugin, @vitejs/plugin-react, path alias @/, and Vitest test block"
      contains: "tailwindcss"
    - path: "src/index.css"
      provides: "Tailwind v4 import"
      contains: "@import \"tailwindcss\""
    - path: "src/test/setup.ts"
      provides: "jest-dom matcher extension for Vitest"
      contains: "expect.extend(matchers)"
    - path: "src/components/ui/button.tsx"
      provides: "shadcn/ui Button component"
    - path: "src/components/ui/input.tsx"
      provides: "shadcn/ui Input component"
    - path: "src/App.tsx"
      provides: "App shell rendering Button and Input"
  key_links:
    - from: "vite.config.ts"
      to: "src/index.css"
      via: "@tailwindcss/vite plugin picks up @import tailwindcss"
      pattern: "tailwindcss\\(\\)"
    - from: "src/test/setup.ts"
      to: "vitest config setupFiles"
      via: "setupFiles: ['./src/test/setup.ts']"
      pattern: "setupFiles"
    - from: "src/App.tsx"
      to: "src/components/ui/button.tsx"
      via: "import { Button } from '@/components/ui/button'"
      pattern: "Button"
---

<phase>1</phase>
<plan>01-01</plan>
<name>Scaffold — Vite + React + TypeScript + Tailwind CSS v4 + shadcn/ui</name>
<wave>1</wave>

<goal>
Bootstrap the entire project foundation: Vite + React + TypeScript project created, Tailwind CSS v4 wired via the @tailwindcss/vite plugin (no tailwind.config.js), shadcn/ui initialised and Button + Input components added, and Vitest configured with jsdom and jest-dom. The dev server runs clean and `npm test` invokes Vitest.
</goal>

<context>
Key decisions from research (01-RESEARCH.md):

- Tailwind CSS v4 is now `latest` (4.2.2). Setup is: install `tailwindcss @tailwindcss/vite`, add the plugin to vite.config.ts, and put `@import "tailwindcss"` in src/index.css. There is NO tailwind.config.js — do not create one.
- shadcn/ui v4 CLI: `npx shadcn@latest init` (not `npm install shadcn-ui`). Components are copied, not installed. Use `npx shadcn@latest add button input` to install the two components needed for the app shell.
- shadcn/ui v4 uses the unified `radix-ui` package (not separate `@radix-ui/react-*`). The CLI handles this.
- Vitest 4.1.2: add a `test` block to vite.config.ts with `globals: true`, `environment: 'jsdom'`, and `setupFiles`. Add `/// <reference types="vitest" />` at the top of vite.config.ts.
- Vitest requires explicit `expect.extend(matchers)` in setup.ts — jest-dom auto-registration does NOT apply (unlike Jest).
- Zustand v5 TypeScript pattern: `create<T>()()` (double parentheses). Relevant for plan 01-03 but the type files start here.
- Path alias `@/` maps to `./src` — required by shadcn/ui and used throughout the project.
- vite: 8.0.3, react: 19.2.4, typescript: 6.0.2, @vitejs/plugin-react: 6.0.1
</context>

<tasks>
  <task>
    <name>Task 1: Scaffold Vite project, install all dependencies, configure Tailwind v4 and Vitest</name>
    <files>
      package.json, vite.config.ts, tsconfig.app.json, tsconfig.json, src/index.css, src/test/setup.ts
    </files>
    <action>
1. Create the Vite + React + TypeScript project:
   ```
   npm create vite@latest . -- --template react-ts
   npm install
   ```
   Note: The `.` targets the current directory. If the CLI asks to overwrite existing files, confirm yes for all.

2. Install Tailwind CSS v4 and the Vite plugin:
   ```
   npm install tailwindcss @tailwindcss/vite
   ```

3. Install Zustand and shadcn/ui peer utilities:
   ```
   npm install zustand
   npm install class-variance-authority clsx tailwind-merge lucide-react
   ```

4. Install Vitest and testing libraries as dev dependencies:
   ```
   npm install -D vitest @vitest/ui jsdom
   npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom
   ```

5. Replace `vite.config.ts` with the following (Tailwind v4 plugin + Vitest test block):
   ```typescript
   /// <reference types="vitest" />
   import path from 'path'
   import tailwindcss from '@tailwindcss/vite'
   import react from '@vitejs/plugin-react'
   import { defineConfig } from 'vite'

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.ts'],
     },
   })
   ```

6. Replace `src/index.css` entirely with:
   ```css
   @import "tailwindcss";
   ```
   Do NOT add any other content. The shadcn/ui init will append CSS variables when it runs in Task 2.

7. Update `tsconfig.app.json` compilerOptions to add path alias and Vitest/jest-dom types:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       },
       "types": ["vitest/globals", "@testing-library/jest-dom"]
     }
   }
   ```
   Merge into the existing compilerOptions — do not remove existing fields like `target`, `lib`, `strict`.

8. Create `src/test/setup.ts`:
   ```typescript
   import { expect, afterEach } from 'vitest'
   import { cleanup } from '@testing-library/react'
   import * as matchers from '@testing-library/jest-dom/matchers'

   expect.extend(matchers)
   afterEach(() => cleanup())
   ```

9. Add test scripts to `package.json` scripts section:
   ```json
   "test": "vitest",
   "test:ui": "vitest --ui"
   ```
   The existing `dev`, `build`, and `preview` scripts should remain untouched.
    </action>
    <verify>
      Run `npm run dev` — the Vite dev server should start and report a localhost URL.
      Run `npm test -- --run` — Vitest should start, find no test files (0 tests), and exit 0.
      Check that `src/test/setup.ts` exists and `vite.config.ts` contains `tailwindcss()` in plugins.
    </verify>
    <done>
      `npm run dev` starts without error. `npm test -- --run` exits 0. `vite.config.ts` has both the `@tailwindcss/vite` plugin and the `test` block. `src/test/setup.ts` exists with `expect.extend(matchers)`.
    </done>
  </task>

  <task>
    <name>Task 2: Initialise shadcn/ui and add Button + Input components; update App shell</name>
    <files>
      components.json, src/index.css, src/components/ui/button.tsx, src/components/ui/input.tsx, src/App.tsx, src/main.tsx
    </files>
    <action>
1. Run shadcn/ui init (detects Tailwind v4 automatically):
   ```
   npx shadcn@latest init
   ```
   When prompted:
   - Style: Default (or New York — either is fine, pick Default)
   - Base color: Neutral (or Slate — either acceptable)
   - Use CSS variables: Yes

   The CLI will generate `components.json` and update `src/index.css` with CSS variable definitions using Tailwind v4 `@theme` directives. Let it modify index.css — this is expected and correct.

2. Add the Button and Input components:
   ```
   npx shadcn@latest add button input
   ```
   This copies `src/components/ui/button.tsx` and `src/components/ui/input.tsx` into the repo. It also installs `radix-ui` (unified package) as a dependency.

3. Replace `src/App.tsx` with an app shell that renders both components:
   ```typescript
   import { Button } from '@/components/ui/button'
   import { Input } from '@/components/ui/input'

   export default function App() {
     return (
       <div className="min-h-screen bg-background p-8">
         <h1 className="text-2xl font-bold mb-6">Expense Splitter</h1>
         <div className="flex gap-4 items-center max-w-sm">
           <Input placeholder="Enter a name..." />
           <Button>Add Person</Button>
         </div>
       </div>
     )
   }
   ```

4. Verify `src/main.tsx` imports `./index.css` (the Vite template includes this; confirm it is present):
   ```typescript
   import './index.css'
   ```
   If missing, add it before `import App from './App'`.

5. Delete boilerplate files left by the Vite template that are no longer needed:
   - `src/App.css` (replaced by Tailwind utilities)
   - `public/vite.svg` (optional; remove to keep workspace clean)
   - `src/assets/react.svg` (optional)
   Do NOT delete `src/index.css` — it now contains the Tailwind import + shadcn variables.
    </action>
    <verify>
      Run `npm run dev` and open the browser URL. Confirm:
      - Page renders "Expense Splitter" heading, an Input field, and a Button
      - No console errors
      - The button has visible styling (background color, padding) from shadcn/Tailwind
      Run `npm test -- --run` — still exits 0 (no test regressions from the CLI runs).
    </verify>
    <done>
      Browser shows the app shell with styled Button and Input. `src/components/ui/button.tsx` and `src/components/ui/input.tsx` exist. `components.json` exists. `npm run dev` and `npm test -- --run` both succeed.
    </done>
  </task>
</tasks>

<success_criteria>
1. `npm run dev` serves the app on localhost with no browser console errors
2. Browser displays "Expense Splitter" heading, a functional Input field, and a styled shadcn/ui Button
3. Tailwind utilities are applied (visible styling on the Button — not unstyled HTML)
4. `npm test -- --run` exits 0 (Vitest is configured, suite runs, no failures)
5. `src/components/ui/button.tsx` and `src/components/ui/input.tsx` exist (copied by shadcn CLI)
6. `src/test/setup.ts` exists with `expect.extend(matchers)` and `afterEach(cleanup)`
7. `vite.config.ts` contains `tailwindcss()` in plugins and a `test` block with `globals: true`, `environment: 'jsdom'`, and `setupFiles`
8. No `tailwind.config.js` exists in the project root
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-foundation-01-SUMMARY.md` documenting:
- Actual package versions installed (from package.json)
- Any prompts shadcn init asked and what was chosen
- Any deviations from the plan (e.g., CLI changed prompts, version differences)
- Confirmation that dev server and Vitest both run clean
</output>
