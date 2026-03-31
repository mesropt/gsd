import { describe, it, expect } from 'vitest'
import { toCents, fromCents, distributeRemainder, distributeProportionally } from './calculations'

describe('toCents', () => {
  it('parses plain number string', () => expect(toCents('12.50')).toBe(1250))
  it('strips dollar sign', () => expect(toCents('$12.50')).toBe(1250))
  it('strips commas', () => expect(toCents('$1,234.56')).toBe(123456))
  it('rounds half-cent input', () => expect(toCents('12.555')).toBe(1256))
  it('handles numeric input', () => expect(toCents(12.5)).toBe(1250))
  it('handles zero', () => expect(toCents(0)).toBe(0))
})

describe('fromCents', () => {
  it('formats cents to dollar string', () => expect(fromCents(1250)).toBe('$12.50'))
  it('formats zero', () => expect(fromCents(0)).toBe('$0.00'))
  it('formats single cent', () => expect(fromCents(1)).toBe('$0.01'))
})

describe('distributeRemainder', () => {
  it('distributes evenly when divisible', () => {
    expect(distributeRemainder(99, 3)).toEqual([33, 33, 33])
  })
  it('distributes remainder penny — 100 cents into 3 parts', () => {
    const result = distributeRemainder(100, 3)
    expect(result).toEqual([34, 33, 33])
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('always sums to total (property test)', () => {
    for (const [total, parts] of [[1, 3], [7, 3], [10, 7], [1000, 9]] as [number, number][]) {
      const result = distributeRemainder(total, parts)
      expect(result.reduce((a, b) => a + b, 0)).toBe(total)
    }
  })
  it('handles single part', () => expect(distributeRemainder(100, 1)).toEqual([100]))
  it('handles zero total', () => {
    const result = distributeRemainder(0, 3)
    expect(result.reduce((a, b) => a + b, 0)).toBe(0)
  })
  it('returns empty array for zero parts', () => {
    expect(distributeRemainder(100, 0)).toEqual([])
  })
})

describe('distributeProportionally', () => {
  it('splits equally with equal weights', () => {
    const result = distributeProportionally(100, [1, 1, 1])
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
  })
  it('handles all-zero weights without NaN', () => {
    const result = distributeProportionally(100, [0, 0, 0])
    expect(result.reduce((a, b) => a + b, 0)).toBe(100)
    expect(result.every((v) => !isNaN(v))).toBe(true)
  })
  it('distributes proportionally — 10 cents with weights [3,1]', () => {
    const result = distributeProportionally(10, [3, 1])
    expect(result).toEqual([8, 2])
    expect(result.reduce((a, b) => a + b, 0)).toBe(10)
  })
  it('always sums to total (property test)', () => {
    for (const [total, weights] of [
      [100, [1, 2, 3]],
      [7, [1, 1, 1]],
      [1000, [10, 20, 30, 40]],
    ] as [number, number[]][]) {
      const result = distributeProportionally(total, weights)
      expect(result.reduce((a, b) => a + b, 0)).toBe(total)
    }
  })
})
