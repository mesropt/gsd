---
phase: 2
slug: people-items
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-31
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.2 |
| **Config file** | `vite.config.ts` (test block configured in Phase 1) |
| **Quick run command** | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx src/components/ItemsPanel/ItemsPanel.test.tsx src/store/useBillStore.test.ts` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx src/components/ItemsPanel/ItemsPanel.test.tsx src/store/useBillStore.test.ts`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | PEOP-01, PEOP-02 | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | Wave 0 | ⬜ pending |
| 2-01-02 | 01 | 1 | PEOP-01 | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | ✅ W0 | ⬜ pending |
| 2-01-03 | 01 | 1 | PEOP-02 | integration | `npm test -- --run src/components/PeoplePanel/PeoplePanel.test.tsx` | ✅ W0 | ⬜ pending |
| 2-02-01 | 02 | 0 | ITEM-01, ITEM-02 | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | Wave 0 | ⬜ pending |
| 2-02-02 | 02 | 1 | ITEM-01 | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | ✅ W0 | ⬜ pending |
| 2-02-03 | 02 | 1 | ITEM-02 | integration | `npm test -- --run src/components/ItemsPanel/ItemsPanel.test.tsx` | ✅ W0 | ⬜ pending |
| 2-03-01 | 03 | 0 | PEOP-03 | unit | `npm test -- --run src/store/useBillStore.test.ts` | Wave 0 | ⬜ pending |
| 2-03-02 | 03 | 1 | PEOP-03 | unit | `npm test -- --run src/store/useBillStore.test.ts` | ✅ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/PeoplePanel/PeoplePanel.test.tsx` — stubs for PEOP-01, PEOP-02
- [ ] `src/components/ItemsPanel/ItemsPanel.test.tsx` — stubs for ITEM-01, ITEM-02
- [ ] Cascade delete tests in `src/store/useBillStore.test.ts` — extend existing file for PEOP-03

*Existing Vitest + jsdom + RTL infrastructure from Phase 1 covers all requirements — no new framework config needed.*

---

## Manual-Only Verifications

*All phase behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
