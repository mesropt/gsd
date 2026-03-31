/**
 * src/lib/calculations.ts
 *
 * Pure monetary math helpers. All bill values are stored as INTEGER CENTS.
 * Convert on input (toCents), display on output (fromCents).
 * Never store or compute with floating-point dollar values.
 */

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
