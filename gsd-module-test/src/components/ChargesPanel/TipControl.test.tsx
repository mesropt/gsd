import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, it, expect } from 'vitest'
import { TipControl } from './TipControl'
import { useBillStore } from '@/store/useBillStore'

describe('TipControl', () => {
  beforeEach(() => useBillStore.getState().resetBill())

  it('TIP-01 selecting 15% preset updates store tip value to 15', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: '15%' }))
    expect(useBillStore.getState().tip.value).toBe(15)
  })

  it('TIP-01 selecting 20% preset updates store tip value to 20', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: '20%' }))
    expect(useBillStore.getState().tip.value).toBe(20)
  })

  it('TIP-01 custom input sets store tip value', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: 'Custom' }))
    await user.type(screen.getByLabelText('Custom tip percentage'), '25')
    expect(useBillStore.getState().tip.value).toBe(25)
  })

  it('TIP-01 custom input shows error for non-numeric value', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: 'Custom' }))
    await user.type(screen.getByLabelText('Custom tip percentage'), 'abc')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number')
  })

  it('TIP-01 custom input clears error on empty (mid-edit)', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: 'Custom' }))
    const input = screen.getByLabelText('Custom tip percentage')
    await user.type(input, 'abc')
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await user.clear(input)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('TIP-01 selecting a preset deactivates custom input', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: 'Custom' }))
    expect(screen.getByLabelText('Custom tip percentage')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '18%' }))
    expect(screen.queryByLabelText('Custom tip percentage')).toBeNull()
    expect(useBillStore.getState().tip.value).toBe(18)
  })

  it('TIP-02 equal split button sets splitMethod to equal', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: 'Proportional' }))
    await user.click(screen.getByRole('button', { name: 'Equal' }))
    expect(useBillStore.getState().tip.splitMethod).toBe('equal')
  })

  it('TIP-03 proportional split button sets splitMethod to proportional', async () => {
    const user = userEvent.setup()
    render(<TipControl />)
    await user.click(screen.getByRole('button', { name: 'Proportional' }))
    expect(useBillStore.getState().tip.splitMethod).toBe('proportional')
  })
})
