/**
 * src/lib/calculations.ts
 *
 * Pure monetary math helpers. All bill values are stored as INTEGER CENTS.
 * Convert on input (toCents), display on output (fromCents).
 * Never store or compute with floating-point dollar values.
 */

import type { AppState } from '../types'

/**
 * Parse a user-entered dollar string or number to integer cents.
 * Strips $, commas, and whitespace. Rounds to nearest cent.
 *
 * toCents("$12.50")    === 1250
 * toCents("$1,234.56") === 123456
 * toCents(12.5)        === 1250
 */
export function toCents(dollars: string | number): number {
  if (typeof dollars === 'string') {
    const cleaned = dollars.replace(/[$,\s]/g, '')
    return Math.round(parseFloat(cleaned) * 100)
  }
  return Math.round(dollars * 100)
}

/**
 * Format integer cents as a dollar display string.
 *
 * fromCents(1250) === "$12.50"
 * fromCents(0)    === "$0.00"
 * fromCents(1)    === "$0.01"
 */
export function fromCents(cents: number): string {
  return '$' + (cents / 100).toFixed(2)
}

/**
 * Distribute `totalCents` into `parts` equal integer shares that sum exactly to totalCents.
 * Uses the Largest Remainder Method: floor each share, assign remainder pennies to the
 * first `remainder` indices (index 0 first).
 *
 * distributeRemainder(100, 3) === [34, 33, 33]   (not [33, 33, 33] with 1 penny lost)
 * distributeRemainder(99, 3)  === [33, 33, 33]
 * distributeRemainder(1, 3)   === [1, 0, 0]
 * distributeRemainder(100, 0) === []
 */
export function distributeRemainder(totalCents: number, parts: number): number[] {
  if (parts <= 0) return []
  if (parts === 1) return [totalCents]

  const base = Math.floor(totalCents / parts)
  const remainder = totalCents - base * parts

  const shares = Array<number>(parts).fill(base)
  for (let i = 0; i < remainder; i++) {
    shares[i] += 1
  }

  return shares
}

/**
 * Distribute `totalCents` proportionally according to `weights` (arbitrary positive numbers).
 * Uses the Largest Remainder Method: sort indices by fractional part descending, assign
 * remainder pennies to the indices with the largest fractional parts.
 * Sum of result always equals totalCents exactly.
 *
 * Divide-by-zero guard: when all weights are zero, falls back to equal split.
 *
 * distributeProportionally(100, [1, 1, 1]) — sums to 100, equal share
 * distributeProportionally(10, [3, 1])     === [8, 2]
 */
export function distributeProportionally(totalCents: number, weights: number[]): number[] {
  if (weights.length === 0) return []

  const totalWeight = weights.reduce((a, b) => a + b, 0)
  if (totalWeight === 0) {
    // Divide-by-zero guard: fall back to equal split
    return distributeRemainder(totalCents, weights.length)
  }

  const exact = weights.map((w) => (w / totalWeight) * totalCents)
  const floors = exact.map(Math.floor)
  const remainder = totalCents - floors.reduce((a, b) => a + b, 0)

  // Sort indices by fractional part descending; assign +1 to the top `remainder` indices
  const indices = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .map((x) => x.i)

  for (let j = 0; j < remainder; j++) {
    floors[indices[j]] += 1
  }

  return floors
}

export interface PersonBreakdown {
  subtotal: number   // item costs assigned to this person (cents)
  tipShare: number   // tip allocated to this person (cents)
  taxShare: number   // tax allocated to this person (cents)
  total: number      // subtotal + tipShare + taxShare (cents)
}

/**
 * Calculate per-person totals from item assignments, tip, and tax.
 * Returns Map<personId, totalCentsOwed>.
 * Pure function — no store reads.
 */
export function calculateBreakdowns(state: AppState): Map<string, number> {
  if (state.people.length === 0) return new Map()

  const totals = new Map<string, number>(state.people.map(p => [p.id, 0]))

  // 1. Distribute item costs (skip unassigned items)
  for (const item of state.items) {
    if (item.assignedTo.length === 0) continue
    const shares = distributeRemainder(item.price, item.assignedTo.length)
    item.assignedTo.forEach((personId, idx) => {
      totals.set(personId, (totals.get(personId) ?? 0) + shares[idx])
    })
  }

  // 2. Compute per-person subtotals as weights for proportional distribution
  const subtotals = state.people.map(p => totals.get(p.id) ?? 0)
  const totalSubtotal = subtotals.reduce((a, b) => a + b, 0)

  // 3. Calculate and distribute tip
  const tipCents = state.tip.mode === 'percent'
    ? Math.round(totalSubtotal * state.tip.value / 100)
    : state.tip.value  // already integer cents in amount mode

  const tipShares = state.tip.splitMethod === 'equal'
    ? distributeRemainder(tipCents, state.people.length)
    : distributeProportionally(tipCents, subtotals)

  state.people.forEach((p, idx) => {
    totals.set(p.id, (totals.get(p.id) ?? 0) + tipShares[idx])
  })

  // 4. Calculate and distribute tax
  const taxCents = state.tax.mode === 'percent'
    ? Math.round(totalSubtotal * state.tax.value / 100)
    : state.tax.value  // already integer cents in amount mode

  const taxShares = state.tax.splitMethod === 'equal'
    ? distributeRemainder(taxCents, state.people.length)
    : distributeProportionally(taxCents, subtotals)

  state.people.forEach((p, idx) => {
    totals.set(p.id, (totals.get(p.id) ?? 0) + taxShares[idx])
  })

  return totals
}

/**
 * Calculate per-person detailed breakdowns (subtotal, tipShare, taxShare, total).
 * Includes a balance assertion: sum(totals) must equal assignedItemTotal + tipCents + taxCents.
 * Pure function — no store reads.
 */
export function calculateDetailedBreakdowns(state: AppState): PersonBreakdown[] {
  if (state.people.length === 0) return []

  // Step 1: per-person item subtotals
  const subtotals = new Map<string, number>(state.people.map(p => [p.id, 0]))
  for (const item of state.items) {
    if (item.assignedTo.length === 0) continue
    const shares = distributeRemainder(item.price, item.assignedTo.length)
    item.assignedTo.forEach((personId, idx) => {
      subtotals.set(personId, (subtotals.get(personId) ?? 0) + shares[idx])
    })
  }

  const subtotalValues = state.people.map(p => subtotals.get(p.id) ?? 0)
  const totalSubtotal = subtotalValues.reduce((a, b) => a + b, 0)

  // Step 2: tip shares
  const tipCents = state.tip.mode === 'percent'
    ? Math.round(totalSubtotal * state.tip.value / 100)
    : state.tip.value
  const tipShares = state.tip.splitMethod === 'equal'
    ? distributeRemainder(tipCents, state.people.length)
    : distributeProportionally(tipCents, subtotalValues)

  // Step 3: tax shares
  const taxCents = state.tax.mode === 'percent'
    ? Math.round(totalSubtotal * state.tax.value / 100)
    : state.tax.value
  const taxShares = state.tax.splitMethod === 'equal'
    ? distributeRemainder(taxCents, state.people.length)
    : distributeProportionally(taxCents, subtotalValues)

  // Step 4: build PersonBreakdown array
  const breakdowns = state.people.map((_, idx) => ({
    subtotal: subtotalValues[idx],
    tipShare: tipShares[idx],
    taxShare: taxShares[idx],
    total: subtotalValues[idx] + tipShares[idx] + taxShares[idx],
  }))

  // Step 5: balance assertion (SUMM-02)
  const assignedItemTotal = totalSubtotal
  const billTotal = assignedItemTotal + tipCents + taxCents
  const sumOfTotals = breakdowns.reduce((acc, b) => acc + b.total, 0)
  if (sumOfTotals !== billTotal) {
    throw new Error(
      `Balance assertion failed: sum(totals)=${sumOfTotals} !== billTotal=${billTotal}`
    )
  }

  return breakdowns
}
