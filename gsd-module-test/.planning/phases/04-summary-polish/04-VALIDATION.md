---
phase: 4
slug: summary-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 (jsdom environment) |
| **Config file** | `vite.config.ts` (uses `vitest/config` defineConfig) |
| **Quick run command** | `npx vitest run src/lib/calculations.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/calculations.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 0 | SUMM-02 | unit | `npx vitest run src/lib/calculations.test.ts` | ❌ Wave 0 | ⬜ pending |
| 4-01-02 | 01 | 1 | SUMM-01 | unit (RTL) | `npx vitest run src/components/SummaryPanel/SummaryPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-02-01 | 02 | 0 | SUMM-03 | unit (RTL) | `npx vitest run src/components/SubtotalsStrip/SubtotalsStrip.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-02-02 | 02 | 1 | SUMM-02 | integration | `npx vitest run src/lib/calculations.test.ts` | ❌ Wave 0 | ⬜ pending |
| 4-02-03 | 02 | 1 | SUMM-03 | unit (RTL) | `npx vitest run src/components/SubtotalsStrip/SubtotalsStrip.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 4-03-01 | 03 | 1 | SUMM-01 | smoke (RTL) | `npx vitest run src/components/SummaryPanel/SummaryPanel.test.tsx` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/SummaryPanel/SummaryPanel.test.tsx` — stubs for SUMM-01 render + edge cases (0 people, 1 person, all items unassigned, zero tip/tax)
- [ ] `src/components/SubtotalsStrip/SubtotalsStrip.test.tsx` — stubs for SUMM-03 (shows subtotals, updates live, hidden when 0 people)
- [ ] Add `calculateDetailedBreakdowns` tests to `src/lib/calculations.test.ts` — covers SUMM-02 balance assertion + odd-cent proportional split integration test

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Layout usable on 375px screen | SUMM-01 (SC-4) | Visual/layout check; no DOM assertions for pixel width | Open DevTools, set device to 375px width, verify panels stack vertically and no horizontal scroll |
| Touch target ≥44px on buttons | SUMM-01 (SC-4) | Physical feel — requires device or careful DevTools inspection | In DevTools, inspect TipControl/TaxControl buttons and confirm computed height ≥ 44px |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
