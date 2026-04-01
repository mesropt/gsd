import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect } from 'vitest'
import { PeoplePanel } from './PeoplePanel'
import { useBillStore } from '@/store/useBillStore'

beforeEach(() => {
  useBillStore.getState().resetBill()
})

describe('PeoplePanel', () => {
  it('adds a person when form is submitted', async () => {
    const user = userEvent.setup()
    render(<PeoplePanel />)
    await user.type(screen.getByLabelText('Person name'), 'Alice')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('clears input after adding', async () => {
    const user = userEvent.setup()
    render(<PeoplePanel />)
    await user.type(screen.getByLabelText('Person name'), 'Carol')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByLabelText('Person name')).toHaveValue('')
  })

  it('removes a person when Remove is clicked', async () => {
    const user = userEvent.setup()
    useBillStore.getState().addPerson('Bob')
    render(<PeoplePanel />)
    await user.click(screen.getByRole('button', { name: 'Remove Bob' }))
    expect(screen.queryByText('Bob')).toBeNull()
  })

  it('disables Add button when input is empty', () => {
    render(<PeoplePanel />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })

  it('does not add whitespace-only names', async () => {
    const user = userEvent.setup()
    render(<PeoplePanel />)
    await user.type(screen.getByLabelText('Person name'), '   ')
    await user.keyboard('{Enter}')
    expect(useBillStore.getState().people.length).toBe(0)
  })
})
