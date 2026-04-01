import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { SummaryPanel } from './SummaryPanel'
import { useBillStore } from '@/store/useBillStore'
import { calculateDetailedBreakdowns } from '@/lib/calculations'

describe('SummaryPanel', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  it('renders empty state when no people', () => {
    render(<SummaryPanel />)
    expect(screen.getByText('No people added yet.')).toBeInTheDocument()
  })

  it('renders column headers when people present', () => {
    useBillStore.getState().addPerson('Alice')
    render(<SummaryPanel />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Subtotal')).toBeInTheDocument()
    expect(screen.getByText('Tip')).toBeInTheDocument()
    expect(screen.getByText('Tax')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('renders table with person rows and correct values', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Pizza', 1000)
    const aliceId = useBillStore.getState().people[0].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId])

    render(<SummaryPanel />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    // $10.00 should appear (subtotal and total)
    const tenDollarCells = screen.getAllByText('$10.00')
    expect(tenDollarCells.length).toBeGreaterThanOrEqual(1)
  })

  it('single person gets all tip and tax', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Steak', 2000)
    const aliceId = useBillStore.getState().people[0].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId])
    // 20% tip of $20 = $4.00; tax amount $5.00 = 500 cents
    useBillStore.getState().setTip({ mode: 'percent', value: 20, splitMethod: 'equal' })
    useBillStore.getState().setTax({ mode: 'amount', value: 500, splitMethod: 'equal' })

    render(<SummaryPanel />)
    // total = 2000 + 400 + 500 = 2900 => $29.00
    expect(screen.getByText('$29.00')).toBeInTheDocument()
  })

  it('all items unassigned renders without error and shows $0.00 subtotals', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addItem('Mystery', 1000)
    // item not assigned to anyone

    render(<SummaryPanel />)
    // Both Alice and Bob should appear
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    // All subtotals should be $0.00 (2 people, at minimum 2 zeros shown)
    const zeroCells = screen.getAllByText('$0.00')
    expect(zeroCells.length).toBeGreaterThanOrEqual(2)
  })

  it('zero tip zero tax shows $0.00 for tip and tax columns', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Salad', 800)
    const aliceId = useBillStore.getState().people[0].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId])
    // tip and tax default to 0

    render(<SummaryPanel />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    // Tip and Tax should both show $0.00
    const zeroCells = screen.getAllByText('$0.00')
    expect(zeroCells.length).toBeGreaterThanOrEqual(2)
  })

  it('renders with one person, no items — all $0.00, no error', () => {
    useBillStore.getState().addPerson('Alice')
    // no items added

    render(<SummaryPanel />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    // subtotal, tip, tax, total all $0.00
    const zeroCells = screen.getAllByText('$0.00')
    expect(zeroCells.length).toBeGreaterThanOrEqual(4)
  })

  it('renders with multiple people, mixed assigned and unassigned items', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addPerson('Charlie')
    useBillStore.getState().addItem('Entree', 1200)
    useBillStore.getState().addItem('Shared App', 600)
    useBillStore.getState().addItem('Unassigned Dessert', 500)

    const aliceId = useBillStore.getState().people[0].id
    const bobId = useBillStore.getState().people[1].id
    const entreeId = useBillStore.getState().items[0].id
    const sharedId = useBillStore.getState().items[1].id
    // item 2 (Unassigned Dessert) is left unassigned

    useBillStore.getState().assignItem(entreeId, [aliceId])
    useBillStore.getState().assignItem(sharedId, [aliceId, bobId])
    useBillStore.getState().setTip({ mode: 'percent', value: 18, splitMethod: 'proportional' })
    useBillStore.getState().setTax({ mode: 'amount', value: 300, splitMethod: 'equal' })

    render(<SummaryPanel />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('Charlie')).toBeInTheDocument()
  })

  it('SUMM-02 balance: sum of displayed totals equals bill total', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addPerson('Charlie')
    // items totaling 3333 cents
    useBillStore.getState().addItem('Item A', 1111)
    useBillStore.getState().addItem('Item B', 1111)
    useBillStore.getState().addItem('Item C', 1111)

    const aliceId = useBillStore.getState().people[0].id
    const bobId = useBillStore.getState().people[1].id
    const charlieId = useBillStore.getState().people[2].id
    const [itemA, itemB, itemC] = useBillStore.getState().items.map(i => i.id)

    useBillStore.getState().assignItem(itemA, [aliceId])
    useBillStore.getState().assignItem(itemB, [bobId])
    useBillStore.getState().assignItem(itemC, [charlieId])
    useBillStore.getState().setTip({ mode: 'percent', value: 15, splitMethod: 'proportional' })
    useBillStore.getState().setTax({ mode: 'percent', value: 8.5, splitMethod: 'proportional' })

    const state = useBillStore.getState()
    const breakdowns = calculateDetailedBreakdowns(state)
    const sumOfTotals = breakdowns.reduce((acc, b) => acc + b.total, 0)
    const totalSubtotal = 3333
    const tipCents = Math.round(totalSubtotal * 15 / 100)
    const taxCents = Math.round(totalSubtotal * 8.5 / 100)
    const expectedBillTotal = totalSubtotal + tipCents + taxCents

    expect(sumOfTotals).toBe(expectedBillTotal)
  })
})
