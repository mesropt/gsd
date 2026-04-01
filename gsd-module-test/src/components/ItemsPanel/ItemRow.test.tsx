import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect } from 'vitest'
import { ItemRow } from './ItemRow'
import { useBillStore } from '@/store/useBillStore'

describe('ItemRow', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  it('shows warning icon when item is unassigned (ASGN-04)', () => {
    useBillStore.getState().addItem('Pizza', 1200)
    const item = useBillStore.getState().items[0]

    render(<ItemRow item={item} />)

    expect(screen.getByLabelText('Item not assigned')).toBeInTheDocument()
  })

  it('hides warning icon when item is assigned', () => {
    useBillStore.getState().addItem('Salad', 800)
    useBillStore.getState().addPerson('Alice')
    const item = useBillStore.getState().items[0]
    const person = useBillStore.getState().people[0]

    useBillStore.getState().assignItem(item.id, [person.id])

    render(<ItemRow item={useBillStore.getState().items[0]} />)

    expect(screen.queryByLabelText('Item not assigned')).toBeNull()
  })

  it('renders AssignmentSelector trigger', () => {
    useBillStore.getState().addItem('Burger', 1500)
    useBillStore.getState().addPerson('Bob')
    const item = useBillStore.getState().items[0]

    render(<ItemRow item={item} />)

    expect(screen.getByRole('button', { name: /Assign/i })).toBeInTheDocument()
  })
})
