---
status: complete
phase: 01-foundation
source: [01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md]
started: 2026-03-31T00:00:00Z
updated: 2026-03-31T00:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Dev Server Starts
expected: |
  npm run dev starts successfully and app is accessible at http://localhost:5173
awaiting: user response

## Tests

### 1. Dev Server Starts
expected: Running `npm run dev` opens the app at http://localhost:5173 with no console errors in the browser DevTools
result: pending

### 2. App Shell Renders
expected: Browser shows "Expense Splitter" heading, a shadcn/ui Input field, and a styled Button
result: pending

### 3. Tailwind Styling Applied
expected: Elements have visible Tailwind styling — background color, padding, font weight applied. No unstyled raw HTML.
result: pending

### 4. All Tests Pass
expected: Running `npm test -- --run` in terminal exits with 0 and shows 31 tests passing (19 calculations + 12 store)
result: pending

### 5. Browser Console Store Access
expected: Opening browser DevTools console and typing `window.__store__.getState()` returns the Zustand store state object (people: [], items: [], tip: {...}, tax: {...})
result: pending

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]
