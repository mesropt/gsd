# Requirements: Expense Splitter

**Defined:** 2026-03-31
**Core Value:** Give everyone at the table a fair, accurate number they owe — no mental math, no arguments

## v1 Requirements

### People

- [ ] **PEOP-01**: User can add a person to the bill by name
- [ ] **PEOP-02**: User can remove a person from the bill
- [ ] **PEOP-03**: Removing a person clears their item assignments (no dangling references)

### Items

- [x] **ITEM-01**: User can add an item with a name and price
- [x] **ITEM-02**: User can remove an item from the bill
- [x] **ITEM-03**: Item prices are stored as integer cents (no floating-point errors)

### Assignment

- [ ] **ASGN-01**: User can assign an item to a specific person
- [ ] **ASGN-02**: User can mark an item as "shared" (split equally among all people)
- [ ] **ASGN-03**: User can assign a shared item to a subset of people (not necessarily all)
- [ ] **ASGN-04**: Unassigned items are surfaced with a visible warning in the summary

### Tip

- [x] **TIP-01**: User can select tip percentage (15%, 18%, 20%, or custom)
- [x] **TIP-02**: User can choose equal tip split (divided evenly across all people)
- [x] **TIP-03**: User can choose proportional tip split (based on each person's subtotal)

### Tax

- [ ] **TAX-01**: User can enter tax as a dollar amount or percentage
- [ ] **TAX-02**: User can choose equal tax split (divided evenly across all people)
- [x] **TAX-03**: User can choose proportional tax split (based on each person's subtotal)

### Summary

- [ ] **SUMM-01**: App shows final breakdown: each person's name and total amount owed
- [ ] **SUMM-02**: All person totals sum exactly to the bill total (Largest Remainder Method for rounding)
- [ ] **SUMM-03**: Running subtotal visible as user builds the bill

## v2 Requirements

### Integrations

- **INTG-01**: Receipt photo upload with OCR auto-populates items
- **INTG-02**: Venmo/payment deep link generated per person in summary
- **INTG-03**: Bill can be saved and shared via URL

### History

- **HIST-01**: User can view history of past splits
- **HIST-02**: User can reload a past split to review or modify

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / auth | No persistence needed for single-session use |
| Backend / database | Pure frontend SPA — no server required |
| Real-time collaboration | Out of scope for v1 |
| Debt simplification ("A owes B $5, cancel with B owes A $3") | Adds complexity, not core to restaurant bill use case |
| Multi-currency | Single currency per session is sufficient for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ITEM-03 | Phase 1 | Complete |
| PEOP-01 | Phase 2 | Pending |
| PEOP-02 | Phase 2 | Pending |
| PEOP-03 | Phase 2 | Pending |
| ITEM-01 | Phase 2 | Complete |
| ITEM-02 | Phase 2 | Complete |
| ASGN-01 | Phase 3 | Pending |
| ASGN-02 | Phase 3 | Pending |
| ASGN-03 | Phase 3 | Pending |
| ASGN-04 | Phase 3 | Pending |
| TIP-01 | Phase 3 | Complete |
| TIP-02 | Phase 3 | Complete |
| TIP-03 | Phase 3 | Complete |
| TAX-01 | Phase 3 | Pending |
| TAX-02 | Phase 3 | Pending |
| TAX-03 | Phase 3 | Complete |
| SUMM-01 | Phase 4 | Pending |
| SUMM-02 | Phase 4 | Pending |
| SUMM-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after roadmap creation*
