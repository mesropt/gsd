import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { useBillStore } from '@/store/useBillStore'
import { SubtotalsStrip } from './SubtotalsStrip'

describe('SubtotalsStrip', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  it('renders null when people.length === 0', () => {
    const { container } = render(<SubtotalsStrip />)
    expect(container.firstChild).toBeNull()
  })

  it('shows person name and subtotal for assigned item', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Pizza', 1000)
    const aliceId = useBillStore.getState().people[0].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId])
    render(<SubtotalsStrip />)
    expect(screen.getByText('Alice:')).toBeInTheDocument()
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  it('splits shared item correctly with distributeRemainder', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addItem('Shared', 1001)
    const aliceId = useBillStore.getState().people[0].id
    const bobId = useBillStore.getState().people[1].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId, bobId])
    render(<SubtotalsStrip />)
    // distributeRemainder(1001, 2) => [501, 500]
    expect(screen.getByText('$5.01')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
  })

  it('updates subtotals when item is reassigned', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addItem('Dinner', 2000)
    const aliceId = useBillStore.getState().people[0].id
    const bobId = useBillStore.getState().people[1].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId])
    render(<SubtotalsStrip />)
    // Initially: Alice $20.00, Bob $0.00
    expect(screen.getAllByText('$20.00').length).toBeGreaterThan(0)
    // Reassign to Bob
    useBillStore.getState().assignItem(itemId, [bobId])
    expect(screen.getAllByText('$20.00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0)
  })

  it('unassigned items excluded from subtotals — person shows $0.00', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addItem('Unassigned', 500)
    // Item is NOT assigned to Alice
    render(<SubtotalsStrip />)
    expect(screen.getByText('Alice:')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('handles many people without overflow — all 5 names rendered', () => {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
    names.forEach(n => useBillStore.getState().addPerson(n))
    useBillStore.getState().addItem('Big Feast', 5000)
    const item = useBillStore.getState().items[0]
    const allIds = useBillStore.getState().people.map(p => p.id)
    useBillStore.getState().assignItem(item.id, allIds)

    render(<SubtotalsStrip />)
    names.forEach(n => {
      expect(screen.getByText(`${n}:`)).toBeInTheDocument()
    })
  })

  it('person with no assigned items shows $0.00', () => {
    useBillStore.getState().addPerson('Alice')
    useBillStore.getState().addPerson('Bob')
    useBillStore.getState().addItem('Solo Meal', 1500)
    const aliceId = useBillStore.getState().people[0].id
    const itemId = useBillStore.getState().items[0].id
    useBillStore.getState().assignItem(itemId, [aliceId])

    render(<SubtotalsStrip />)
    expect(screen.getByText('Bob:')).toBeInTheDocument()
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })
})
