import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect } from 'vitest'
import { ItemsPanel } from './ItemsPanel'
import { useBillStore } from '@/store/useBillStore'

describe('ItemsPanel', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  it('adds an item with formatted price when form is submitted', async () => {
    const user = userEvent.setup()
    render(<ItemsPanel />)
    await user.type(screen.getByLabelText('Item name'), 'Pizza')
    await user.type(screen.getByLabelText('Item price'), '$12.50')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText('$12.50')).toBeInTheDocument()
  })

  it('clears both inputs after adding', async () => {
    const user = userEvent.setup()
    render(<ItemsPanel />)
    await user.type(screen.getByLabelText('Item name'), 'Pizza')
    await user.type(screen.getByLabelText('Item price'), '$12.50')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByLabelText('Item name')).toHaveValue('')
    expect(screen.getByLabelText('Item price')).toHaveValue('')
  })

  it('accepts dollar format with $ and commas', async () => {
    const user = userEvent.setup()
    render(<ItemsPanel />)
    await user.type(screen.getByLabelText('Item name'), 'Steak')
    await user.type(screen.getByLabelText('Item price'), '$1,234.56')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(useBillStore.getState().items[0].price).toBe(123456)
  })

  it('removes an item when Remove is clicked', async () => {
    const user = userEvent.setup()
    useBillStore.getState().addItem('Salad', 800)
    render(<ItemsPanel />)
    await user.click(screen.getByRole('button', { name: 'Remove Salad' }))
    expect(screen.queryByText('Salad')).toBeNull()
  })

  it('rejects non-numeric price silently', async () => {
    const user = userEvent.setup()
    render(<ItemsPanel />)
    await user.type(screen.getByLabelText('Item name'), 'Pizza')
    await user.type(screen.getByLabelText('Item price'), 'abc')
    await user.keyboard('{Enter}')
    expect(useBillStore.getState().items.length).toBe(0)
  })

  it('disables Add button when label is empty', () => {
    render(<ItemsPanel />)
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
  })
})
