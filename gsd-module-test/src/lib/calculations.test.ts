import { describe, it, expect } from 'vitest'
import { toCents, fromCents, distributeRemainder, distributeProportionally, calculateBreakdowns } from './calculations'
import type { AppState } from '@/types'

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

describe('calculateBreakdowns', () => {
  function makeState(overrides: Partial<AppState> = {}): AppState {
    return {
      people: [],
      items: [],
      tip: { mode: 'percent', value: 0, splitMethod: 'equal' },
      tax: { mode: 'percent', value: 0, splitMethod: 'equal' },
      ...overrides,
    }
  }

  it('returns empty map when no people', () => {
    const result = calculateBreakdowns(makeState())
    expect(result.size).toBe(0)
  })

  it('assigns full item cost to single assignee', () => {
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      items: [{ id: 'i1', label: 'Pizza', price: 1000, assignedTo: ['a'] }],
    }))
    expect(result.get('a')).toBe(1000)
    expect(result.get('b')).toBe(0)
  })

  it('splits shared item equally using distributeRemainder (odd cent)', () => {
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      items: [{ id: 'i1', label: 'Bread', price: 1001, assignedTo: ['a', 'b'] }],
    }))
    const total = result.get('a')! + result.get('b')!
    expect(total).toBe(1001)
    // One person gets 501, the other 500
    const values = [result.get('a')!, result.get('b')!].sort((x, y) => y - x)
    expect(values[0]).toBe(501)
    expect(values[1]).toBe(500)
  })

  it('equal tip split divides evenly regardless of subtotals', () => {
    // a ordered 1000 cents item, b ordered nothing; tip 20% equal => each gets 100
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      items: [{ id: 'i1', label: 'Pizza', price: 1000, assignedTo: ['a'] }],
      tip: { mode: 'percent', value: 20, splitMethod: 'equal' },
    }))
    // tipCents = Math.round(1000 * 20 / 100) = 200; each gets 100
    expect(result.get('a')).toBe(1000 + 100)  // 1100
    expect(result.get('b')).toBe(0 + 100)      // 100
  })

  it('proportional tip split distributes by subtotal weights', () => {
    // a: 1000 item, b: 500 item; tip 10% proportional
    // totalSubtotal=1500, tipCents=150; a gets 100, b gets 50
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      items: [
        { id: 'i1', label: 'Pizza', price: 1000, assignedTo: ['a'] },
        { id: 'i2', label: 'Salad', price: 500, assignedTo: ['b'] },
      ],
      tip: { mode: 'percent', value: 10, splitMethod: 'proportional' },
    }))
    expect(result.get('a')).toBe(1100)
    expect(result.get('b')).toBe(550)
  })

  it('tax in amount mode uses value as cents directly', () => {
    // tax = $5 = 500 cents, equal split => each gets 250
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      items: [{ id: 'i1', label: 'Pizza', price: 1000, assignedTo: ['a'] }],
      tax: { mode: 'amount', value: 500, splitMethod: 'equal' },
    }))
    expect(result.get('a')).toBe(1000 + 250)  // 1250
    expect(result.get('b')).toBe(0 + 250)      // 250
  })

  it('tax in percent mode computes from subtotal', () => {
    // a gets 2000 item; tax 10% = 200 cents equal to a
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }],
      items: [{ id: 'i1', label: 'Steak', price: 2000, assignedTo: ['a'] }],
      tax: { mode: 'percent', value: 10, splitMethod: 'equal' },
    }))
    expect(result.get('a')).toBe(2200)
  })

  it('proportional split with all-zero subtotals does not crash or produce NaN', () => {
    // No items, tip 20% proportional — tipCents = 0, all totals should be 0, no NaN
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      tip: { mode: 'percent', value: 20, splitMethod: 'proportional' },
    }))
    expect(Array.from(result.values()).every(v => !isNaN(v))).toBe(true)
    expect(result.get('a')).toBe(0)
    expect(result.get('b')).toBe(0)
  })

  it('proportional split with zero subtotals and nonzero tip amount falls back to equal', () => {
    // No items, tip 100 cents (amount mode) proportional — subtotals all 0, falls back to equal
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      tip: { mode: 'amount', value: 100, splitMethod: 'proportional' },
    }))
    const total = result.get('a')! + result.get('b')!
    expect(total).toBe(100)
    expect(result.get('a')).toBe(50)
    expect(result.get('b')).toBe(50)
  })

  it('unassigned items are skipped (not counted in any subtotal)', () => {
    // a: 1000 item; second item 500 unassigned — a should only get 1000
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }],
      items: [
        { id: 'i1', label: 'Pizza', price: 1000, assignedTo: ['a'] },
        { id: 'i2', label: 'Appetizer', price: 500, assignedTo: [] },
      ],
    }))
    expect(result.get('a')).toBe(1000)
  })

  it('sum of all totals equals items + tip + tax exactly', () => {
    // 3 people; items: 1000 to a, 701 to [a,b], 300 to [b,c]; tip 18% proportional; tax 8.5% equal
    const result = calculateBreakdowns(makeState({
      people: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }],
      items: [
        { id: 'i1', label: 'Pizza', price: 1000, assignedTo: ['a'] },
        { id: 'i2', label: 'Shared', price: 701, assignedTo: ['a', 'b'] },
        { id: 'i3', label: 'Salad', price: 300, assignedTo: ['b', 'c'] },
      ],
      tip: { mode: 'percent', value: 18, splitMethod: 'proportional' },
      tax: { mode: 'percent', value: 8.5, splitMethod: 'equal' },
    }))
    const itemTotal = 1000 + 701 + 300  // 2001
    const totalSubtotal = itemTotal
    const tipCents = Math.round(totalSubtotal * 18 / 100)
    const taxCents = Math.round(totalSubtotal * 8.5 / 100)
    const expectedTotal = itemTotal + tipCents + taxCents
    const actualTotal = Array.from(result.values()).reduce((a, b) => a + b, 0)
    expect(actualTotal).toBe(expectedTotal)
  })
})
