import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect } from 'vitest'
import { AssignmentSelector } from './AssignmentSelector'
import { useBillStore } from '@/store/useBillStore'

describe('AssignmentSelector', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  function setupWithPeople(names: string[]) {
    for (const name of names) {
      useBillStore.getState().addPerson(name)
    }
    useBillStore.getState().addItem('Pizza', 1000)
    return { item: useBillStore.getState().items[0] }
  }

  it('assigns item to one person when checkbox is checked (ASGN-01)', async () => {
    const user = userEvent.setup()
    const { item } = setupWithPeople(['Alice', 'Bob'])
    render(<AssignmentSelector item={useBillStore.getState().items[0]} />)

    // Open popover
    await user.click(screen.getByRole('button', { name: /Assign/i }))

    // Click first person checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    expect(useBillStore.getState().items[0].assignedTo.length).toBe(1)
  })

  it('assigns to everyone when Everyone button is clicked (ASGN-02)', async () => {
    const user = userEvent.setup()
    setupWithPeople(['Alice', 'Bob', 'Carol'])
    render(<AssignmentSelector item={useBillStore.getState().items[0]} />)

    // Open popover
    await user.click(screen.getByRole('button', { name: /Assign/i }))

    // Click Everyone
    await user.click(screen.getByRole('button', { name: 'Select everyone' }))

    expect(useBillStore.getState().items[0].assignedTo.length).toBe(3)
  })

  it('assigns to subset by checking two of three people (ASGN-03)', async () => {
    const user = userEvent.setup()
    setupWithPeople(['Alice', 'Bob', 'Carol'])
    render(<AssignmentSelector item={useBillStore.getState().items[0]} />)

    // Open popover
    await user.click(screen.getByRole('button', { name: /Assign/i }))

    // Check first and second person
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])

    expect(useBillStore.getState().items[0].assignedTo.length).toBe(2)
  })

  it('Everyone unchecks all when all are selected', async () => {
    const user = userEvent.setup()
    setupWithPeople(['Alice', 'Bob'])
    const people = useBillStore.getState().people
    const item = useBillStore.getState().items[0]

    // Pre-assign everyone
    useBillStore.getState().assignItem(item.id, people.map((p) => p.id))

    render(<AssignmentSelector item={useBillStore.getState().items[0]} />)

    // Open popover (label should say "Everyone")
    await user.click(screen.getByRole('button', { name: /Everyone/i }))

    // Click "Deselect everyone"
    await user.click(screen.getByRole('button', { name: 'Deselect everyone' }))

    expect(useBillStore.getState().items[0].assignedTo.length).toBe(0)
  })

  it("shows 'Assign' when unassigned, person name when 1, 'Everyone' when all", async () => {
    setupWithPeople(['Alice', 'Bob'])
    const people = useBillStore.getState().people
    const item = useBillStore.getState().items[0]

    // Initially unassigned
    const { rerender } = render(<AssignmentSelector item={useBillStore.getState().items[0]} />)
    expect(screen.getByRole('button', { name: /Assign/i })).toBeInTheDocument()

    // Assign to 1 person
    act(() => { useBillStore.getState().assignItem(item.id, [people[0].id]) })
    rerender(<AssignmentSelector item={useBillStore.getState().items[0]} />)
    expect(screen.getByRole('button', { name: new RegExp(people[0].name, 'i') })).toBeInTheDocument()

    // Assign to everyone
    act(() => { useBillStore.getState().assignItem(item.id, people.map((p) => p.id)) })
    rerender(<AssignmentSelector item={useBillStore.getState().items[0]} />)
    expect(screen.getByRole('button', { name: /Everyone/i })).toBeInTheDocument()
  })

  it("shows 'Add people first' when no people exist", async () => {
    const user = userEvent.setup()
    useBillStore.getState().addItem('Pizza', 1000)
    const item = useBillStore.getState().items[0]

    render(<AssignmentSelector item={item} />)

    // Open popover
    await user.click(screen.getByRole('button', { name: /Assign/i }))

    expect(screen.getByText('Add people first')).toBeVisible()
  })
})
